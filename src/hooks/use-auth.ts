"use client";

import { useCallback } from "react";
import axios from "axios";
import { useAuthStore, writeAuthStorage } from "@/store/auth.store";
import { API_ROUTES, ROUTES } from "@/utils/constants";
import type { LoginCredentials } from "@/types/auth.type";

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } =
    useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      try {
        const { data } = await axios.post(API_ROUTES.AUTH.LOGIN, credentials, {
          withCredentials: true,
        });
        const { user, token } = data.data;
        setAuth(user, token);
        // Tulis langsung ke localStorage (Safari mobile kadang belum selesai persist Zustand)
        writeAuthStorage(user, token);

        const role = user.role;
        if (role === "SUPER_ADMIN" || role === "ADMIN_FAKULTAS") {
          window.location.replace(ROUTES.ADMIN.DASHBOARD);
        } else if (role === "PETUGAS_SCAN") {
          window.location.replace(ROUTES.SCANNER.SCAN);
        } else {
          window.location.replace(ROUTES.PORTAL.HOME);
        }
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setAuth, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await axios.post(API_ROUTES.AUTH.LOGOUT, {}, { withCredentials: true });
    } catch {
      // ignore
    } finally {
      clearAuth();
      window.location.replace(ROUTES.LOGIN);
    }
  }, [clearAuth]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
