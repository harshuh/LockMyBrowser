import { cacheBackendPinHash } from "./lmbStorage";

const API_BASE = "http://localhost:1124/api/v1/user";

const STORAGE_KEYS = {
  accessToken: "lmb:accessToken",
  pin: "lmb:pin",
};

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export async function apiRegister(name: string, email: string, pin: string): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, pin }),
  });
  return res.json();
}

export async function apiLogin(
  email: string,
  pin: string
): Promise<ApiResponse<{ accessToken: string; pinHash:string, user: { id: string; name: string; email: string } }>> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, pin }),
  });

  const data = await res.json();

  if (data.success) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.accessToken]: data.data.accessToken,
    });
  }
  await cacheBackendPinHash(data.data.pinHash);
  return data;
}

export async function apiUnlock(pin: string): Promise<{ ok: boolean; error?: string }> {
  const result = await chrome.storage.local.get("lmb:accessToken");
  const accessToken = result["lmb:accessToken"];

  if (!accessToken) return { ok: false, error: "Not logged in." };

  try {
    const res = await fetch(`${API_BASE}/unlock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ pin }),
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();

    if (data.success) return { ok: true };
    return { ok: false, error: data.message ?? "Incorrect PIN." };
  } catch {
    return { ok: false, error: "NETWORK_ERROR" };
  }
}