import bcrypt from "bcryptjs";

export interface lmbSettings {
  autoLockEnabled: boolean
  autoLockMinutes: number
  enabled: boolean
  secretPinEnabled: boolean
  alertOnFailedAttempts: boolean
  failedAttemptThreshold: number
}


export interface lmbData {
  onboarded: boolean;
  email: string | null;
  pin: string | null;
  settings: lmbSettings;
  emailVerified: boolean
}


export const DEFAULT_SETTINGS: lmbSettings = {
  autoLockEnabled: true,
  autoLockMinutes: 5,
  enabled: true,
  secretPinEnabled: false,
  alertOnFailedAttempts: true,
  failedAttemptThreshold: 5,
};

const KEYS = {
  onboarded: "lmb:onboarded",
  email: "lmb:email",
  pin: "lmb:pin",
  settings: "lmb:settings",
  emailVerified: "lmb:emailVerified",
  accessToken: "lmb:accessToken",
} as const;

export async function getlmbData(): Promise<lmbData> {
  const result = await chrome.storage.local.get([
    KEYS.onboarded,
    KEYS.email,
    KEYS.pin,
    KEYS.settings,
    KEYS.emailVerified,
  ]);

  return {
    onboarded: Boolean(result[KEYS.onboarded]),
    email: (result[KEYS.email] as string | undefined) ?? null,
    pin: (result[KEYS.pin] as string | undefined) ?? null,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(result[KEYS.settings] as Partial<lmbSettings> | undefined),
    },
    emailVerified: Boolean(result[KEYS.emailVerified]),
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