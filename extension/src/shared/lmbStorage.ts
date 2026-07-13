import bcrypt from "bcryptjs";

export interface lmbSettings {
  autoLockEnabled: boolean;
  autoLockMinutes: number;
  lockedUrl: string;
}

export interface lmbData {
  onboarded: boolean;
  email: string | null;
  pin: string | null;
  settings: lmbSettings;
}

export const DEFAULT_SETTINGS: lmbSettings = {
  autoLockEnabled: true,
  autoLockMinutes: 5,
  lockedUrl: "",
};

const KEYS = {
  onboarded: "lmb:onboarded",
  email: "lmb:email",
  pin: "lmb:pin",
  settings: "lmb:settings",
  accessToken: "lmb:accessToken",
} as const;

export async function getlmbData(): Promise<lmbData> {
  const result = await chrome.storage.local.get([
    KEYS.onboarded,
    KEYS.email,
    KEYS.pin,
    KEYS.settings,
  ]);

  return {
    onboarded: Boolean(result[KEYS.onboarded]),
    email: (result[KEYS.email] as string | undefined) ?? null,
    pin: (result[KEYS.pin] as string | undefined) ?? null,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(result[KEYS.settings] as Partial<lmbSettings> | undefined),
    },
  };
}

export async function setlmbSettings(partial: Partial<lmbSettings>): Promise<lmbSettings> {
  const current = await getlmbData();
  const next = { ...current.settings, ...partial };
  await chrome.storage.local.set({ [KEYS.settings]: next });
  return next;
}

export async function cacheBackendPinHash(bcryptHash: string): Promise<void> {
  await chrome.storage.local.set({ [KEYS.pin]: bcryptHash });
}

export async function verifyPin(enteredPin: string, storedPinHash: string | null): Promise<boolean> {
  if (!storedPinHash) return false;
  return bcrypt.compare(enteredPin, storedPinHash);
}

export async function completeOnboarding(data: { email: string }): Promise<void> {
  await chrome.storage.local.set({
    [KEYS.onboarded]: true,
    [KEYS.email]: data.email,
  });
}

export async function setAccessToken(token: string): Promise<void> {
  await chrome.storage.local.set({ [KEYS.accessToken]: token });
}

export async function getAccessToken(): Promise<string | null> {
  const result = await chrome.storage.local.get(KEYS.accessToken);
  return (result[KEYS.accessToken] as string | undefined) ?? null;
}