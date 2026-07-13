import { verifyPin } from "../shared/lmbStorage";
import { apiUnlock } from "../shared/lmbApi";

interface SavedTab {
  id: number;
  url: string;
  windowId: number;
  index: number;
}

interface SavedWindow {
  id: number;
  state: string;
  tabs: SavedTab[];
}

const STORAGE_KEYS = {
  locked: "lmb:locked",
  lockWindowId: "lmb:lockWindowId",
  savedWindows: "lmb:savedWindows",
  pin: "lmb:pin",
  settings: "lmb:settings",
  email: "lmb:email",
};

let isUnlocking = false;
let isBackgroundUnlocked = false;

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("start.html") });
  }
});

// Re-show lock screen if browser was locked before closing
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(STORAGE_KEYS.locked);
  if (!result[STORAGE_KEYS.locked]) return;

  const lockWin = await chrome.windows.create({
    url: chrome.runtime.getURL("lock.html"),
    type: "popup",
    width: 500,
    height: 640,
    focused: true,
  });

  if (lockWin?.id) {
    await chrome.storage.local.set({ [STORAGE_KEYS.lockWindowId]: lockWin.id });
  }

  // Close any normal windows that opened on startup
  const allWindows = await chrome.windows.getAll();
  await Promise.all(
    allWindows
      .filter((w) => w.id !== lockWin?.id && w.type === "normal")
      .map((w) => chrome.windows.remove(w.id!).catch(() => {})),
  );
});

async function applyIdleDetection() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.settings);
  const settings = result[STORAGE_KEYS.settings] as
    | { autoLockEnabled: boolean; autoLockMinutes: number }
    | undefined;
  if (settings?.autoLockEnabled) {
    const seconds = Math.max(60, (settings.autoLockMinutes ?? 5) * 60);
    chrome.idle.setDetectionInterval(seconds);
  }
}

chrome.idle.onStateChanged.addListener(async (state) => {
  if (state !== "idle" && state !== "locked") return;
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.locked,
    STORAGE_KEYS.settings,
  ]);
  if (result[STORAGE_KEYS.locked]) return;
  const settings = result[STORAGE_KEYS.settings] as
    | { autoLockEnabled: boolean }
    | undefined;
  if (!settings?.autoLockEnabled) return;
  await lockBrowser();
});

async function lockBrowser() {
  isBackgroundUnlocked = false;
  const allWindows = await chrome.windows.getAll({ populate: true });

  const savedWindows: SavedWindow[] = allWindows
    .filter((w) => w.type === "normal")
    .map((w) => ({
      id: w.id!,
      state: w.state ?? "normal",
      tabs: (w.tabs ?? [])
        .filter(
          (t) =>
            t.url &&
            !t.url.startsWith("chrome://") &&
            !t.url.startsWith("about:"),
        )
        .map((t) => ({
          id: t.id!,
          url: t.url!,
          windowId: t.windowId,
          index: t.index,
        })),
    }));

  // Set locked state before opening lock window
  await chrome.storage.local.set({
    [STORAGE_KEYS.locked]: true,
    [STORAGE_KEYS.savedWindows]: savedWindows,
  });

  // Open fullscreen lock window
  const lockWin = await chrome.windows.create({
    url: chrome.runtime.getURL("lock.html"),
    type: "popup",
    state: "fullscreen",
    focused: true,
  });

  if (lockWin?.id) {
    await chrome.storage.local.set({ [STORAGE_KEYS.lockWindowId]: lockWin.id });
  }
}

async function enforceLockWindow() {
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.locked,
    STORAGE_KEYS.lockWindowId,
  ]);
  if (!result[STORAGE_KEYS.locked]) return;

  const lockWindowId = result[STORAGE_KEYS.lockWindowId] as number | undefined;

  // Close all normal windows that aren't the lock window
  const allWindows = await chrome.windows.getAll();
  await Promise.all(
    allWindows
      .filter((w) => w.id !== lockWindowId && w.type === "normal")
      .map((w) => chrome.windows.remove(w.id!).catch(() => {})),
  );

  // Bring lock window back to focus and fullscreen
  if (lockWindowId) {
    await chrome.windows
      .update(lockWindowId, { focused: true, width: 500, height: 640 })
      .catch(() => {});
  }
}

chrome.windows.onCreated.addListener(async (window) => {
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.locked,
    STORAGE_KEYS.lockWindowId,
  ]);
  if (!result[STORAGE_KEYS.locked]) return;
  if (window.id === result[STORAGE_KEYS.lockWindowId]) return;
  if (window.type !== "normal") return;
  await enforceLockWindow();
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.locked,
    STORAGE_KEYS.lockWindowId,
  ]);
  if (!result[STORAGE_KEYS.locked]) return;
  if (windowId === result[STORAGE_KEYS.lockWindowId]) return;
  await enforceLockWindow();
});

// Secondary guards for tabs
chrome.tabs.onCreated.addListener(async (tab) => {
  const result = await chrome.storage.local.get(STORAGE_KEYS.locked);
  if (!result[STORAGE_KEYS.locked]) return;
  if (tab.url?.startsWith("chrome-extension://")) return;
  await chrome.tabs
    .update(tab.id!, { url: chrome.runtime.getURL("lock.html") })
    .catch(() => {});
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const result = await chrome.storage.local.get(STORAGE_KEYS.locked);
  if (!result[STORAGE_KEYS.locked]) return;
  const tab = await chrome.tabs.get(activeInfo.tabId).catch(() => null);
  if (!tab || tab.url?.startsWith("chrome-extension://")) return;
  await chrome.tabs
    .update(activeInfo.tabId, { url: chrome.runtime.getURL("lock.html") })
    .catch(() => {});
});

async function unlockBrowser() {
  if (isUnlocking) return;

  const result = await chrome.storage.local.get([
    STORAGE_KEYS.locked,
    STORAGE_KEYS.lockWindowId,
    STORAGE_KEYS.savedWindows,
  ]);

  if (!result[STORAGE_KEYS.locked]) return;

  isUnlocking = true;

  try {
    const lockWindowId = result[STORAGE_KEYS.lockWindowId] as number | undefined;
    const savedWindows = (result[STORAGE_KEYS.savedWindows] ?? []) as SavedWindow[];

    // Clear locked state first so content scripts stop redirecting
    isBackgroundUnlocked = true;
    await chrome.storage.local.set({ [STORAGE_KEYS.locked]: false });
    await chrome.storage.local.remove([
      STORAGE_KEYS.lockWindowId,
      STORAGE_KEYS.savedWindows,
    ]);

    // Restore all saved tabs
    let restoredAny = false;

    for (const win of savedWindows) {
      const windowExists = await chrome.windows
        .get(win.id)
        .then(() => true)
        .catch(() => false);

      if (windowExists) {
        restoredAny = true;
        for (const tab of win.tabs) {
          await chrome.tabs.update(tab.id, { url: tab.url }).catch(async () => {
            await chrome.tabs
              .create({ windowId: win.id, url: tab.url })
              .catch(() => {});
          });
        }
        if (win.state && win.state !== "minimized") {
          await chrome.windows
            .update(win.id, { state: win.state as chrome.windows.WindowState })
            .catch(() => {});
        }
      } else {
        if (win.tabs.length > 0) {
          restoredAny = true;
          const firstTab = win.tabs[0];
          const otherTabs = win.tabs.slice(1);

          const createData: chrome.windows.CreateData = {
            url: firstTab.url,
            focused: true,
          };
          if (win.state && win.state !== "minimized") {
            createData.state = win.state as chrome.windows.WindowState;
          }

          const newWin = await chrome.windows.create(createData).catch(() => null);
          if (newWin && newWin.id) {
            for (const tab of otherTabs) {
              await chrome.tabs
                .create({ windowId: newWin.id, url: tab.url })
                .catch(() => {});
            }
          }
        }
      }
    }

    // Ensure there is at least one normal window open
    if (!restoredAny) {
      await chrome.windows.create({ focused: true }).catch(() => {});
    }

    // Close the lock window
    if (lockWindowId) {
      await chrome.windows.remove(lockWindowId).catch(() => {});
    }
  } finally {
    isUnlocking = false;
  }
}

// If a tab is activated while locked, redirect it to lock.html
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const result = await chrome.storage.local.get(STORAGE_KEYS.locked);
  if (!result[STORAGE_KEYS.locked]) return;

  const tab = await chrome.tabs.get(activeInfo.tabId).catch(() => null);
  if (!tab) return;
  if (tab.url?.startsWith("chrome-extension://")) return;

  await chrome.tabs
    .update(activeInfo.tabId, {
      url: chrome.runtime.getURL("lock.html"),
    })
    .catch(() => {});
});

// If a new tab is opened while locked, redirect to lock.html
chrome.tabs.onCreated.addListener(async (tab) => {
  const result = await chrome.storage.local.get(STORAGE_KEYS.locked);
  if (!result[STORAGE_KEYS.locked]) return;
  if (tab.url?.startsWith("chrome-extension://")) return;

  await chrome.tabs
    .update(tab.id!, {
      url: chrome.runtime.getURL("lock.html"),
    })
    .catch(() => {});
});


async function verifyAndUnlock(enteredPin?: string): Promise<{ ok: boolean; error?: string }> {
  if (!enteredPin) {
    return { ok: false, error: "PIN required." };
  }

  const result = await apiUnlock(enteredPin);

  if (result.ok) {
    await unlockBrowser();
    return { ok: true };
  }

  if (result.error === "NETWORK_ERROR") {
    const stored = await chrome.storage.local.get(STORAGE_KEYS.pin);
    const storedPinHash = stored[STORAGE_KEYS.pin] as string | undefined;

    const isMatch = await verifyPin(enteredPin, storedPinHash ?? null);

    if (isMatch) {
      await unlockBrowser();
      return { ok: true };
    }
    return { ok: false, error: "Incorrect PIN (offline mode)." };
  }

  // Backend was reachable and said the PIN was wrong — don't fall back locally.
  return { ok: false, error: result.error ?? "Incorrect PIN." };
}

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName !== "local") return;

  if (changes[STORAGE_KEYS.locked]) {
    const newValue = changes[STORAGE_KEYS.locked].newValue;
    if (newValue === false && !isBackgroundUnlocked) {
      // Storage bypass attempt! Re-lock immediately.
      await chrome.storage.local.set({ [STORAGE_KEYS.locked]: true });
      await enforceLockWindow();
    } else if (newValue === true) {
      isBackgroundUnlocked = false;
      await enforceLockWindow();
    }
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "LOCK_ALL_TABS") {
    lockBrowser()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  if (message?.type === "UNLOCK") {
    verifyAndUnlock(message.pin)
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  return false;
});

applyIdleDetection();