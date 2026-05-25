import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/auth.type";

const AUTH_STORAGE_KEY = "wisuda-auth";

/** Format yang sama dengan Zustand persist — dipakai sebelum navigasi penuh (mobile). */
export function writeAuthStorage(user: User, token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      state: { user, token, isAuthenticated: true },
      version: 0,
    }),
  );
}

export function readAuthStorage(): {
  token: string | null;
  role: string | null;
} {
  if (typeof window === "undefined") return { token: null, role: null };
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, role: null };
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

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true, isLoading: false }),

      clearAuth: () =>
        set({ user: null, token: null, isAuthenticated: false, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
