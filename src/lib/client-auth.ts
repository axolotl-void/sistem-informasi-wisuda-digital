import type { User } from "@/types/auth.type";

export const AUTH_STORAGE_KEY = "wisuda-auth";

/** Token di memori — selalu tersedia dalam sesi SPA (termasuk sebelum storage selesai ditulis). */
let memoryToken: string | null = null;
let memoryUser: User | null = null;

function buildPersistPayload(user: User, token: string) {
  return JSON.stringify({
    state: { user, token, isAuthenticated: true },
    version: 0,
  });
}

function parseStoredAuth(raw: string | null): { token: string | null; role: string | null } {
  if (!raw) return { token: null, role: null };
  try {
    const parsed = JSON.parse(raw) as {
      state?: { token?: string; user?: { role?: string } };
    };
    return {
      token: parsed?.state?.token ?? null,
      role: parsed?.state?.user?.role ?? null,
    };
  } catch {
    return { token: null, role: null };
  }
}

/** Simpan auth ke memori + localStorage + sessionStorage (mobile-safe). */
export function persistAuth(user: User, token: string) {
  if (typeof window === "undefined") return;
  memoryToken = token;
  memoryUser = user;
  const payload = buildPersistPayload(user, token);
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, payload);
  } catch {
    // Private mode / quota
  }
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, payload);
  } catch {
    // ignore
  }
}

export function clearClientAuth() {
  memoryToken = null;
  memoryUser = null;
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function readAuthStorage(): { token: string | null; role: string | null } {
  if (memoryToken) {
    return { token: memoryToken, role: memoryUser?.role ?? null };
  }
  if (typeof window === "undefined") return { token: null, role: null };

  const raw =
    localStorage.getItem(AUTH_STORAGE_KEY) ?? sessionStorage.getItem(AUTH_STORAGE_KEY);
  const parsed = parseStoredAuth(raw);
  if (parsed.token) {
    memoryToken = parsed.token;
  }
  return parsed;
}

export function getClientToken(): string | null {
  return readAuthStorage().token;
}

export function getAuthHeaders(extra?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getClientToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  if (extra instanceof Headers) {
    extra.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(extra)) {
    for (const [key, value] of extra) {
      headers[key] = value;
    }
  } else if (extra && typeof extra === "object") {
    Object.assign(headers, extra as Record<string, string>);
  }

  return headers;
}

/** Pulihkan token dari cookie httpOnly ke client storage. */
export async function syncAuthFromSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    if (!res.ok) return false;
    const result = await res.json();
    const user = result?.data?.user as User | undefined;
    const token = result?.data?.token as string | undefined;
    if (user && token) {
      persistAuth(user, token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: getAuthHeaders(init?.headers),
    credentials: "include",
  });
}

/** Storage hybrid untuk Zustand persist. */
export const hybridAuthStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name) ?? sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(name, value);
    } catch {
      // ignore
    }
    try {
      sessionStorage.setItem(name, value);
    } catch {
      // ignore
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};
