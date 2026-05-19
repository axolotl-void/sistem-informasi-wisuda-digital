"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { API_ROUTES, ROUTES } from "@/utils/constants";
import type { LoginCredentials } from "@/types/auth.type";

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } =
    useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      try {
        const { data } = await axios.post(API_ROUTES.AUTH.LOGIN, credentials);
        setAuth(data.data.user, data.data.token);

        // Redirect berdasarkan role
        const role = data.data.user.role;
        if (role === "SUPER_ADMIN" || role === "ADMIN_FAKULTAS") {
          router.push(ROUTES.ADMIN.DASHBOARD);
        } else if (role === "PETUGAS_SCAN") {
          router.push(ROUTES.SCANNER.SCAN);
        } else {
          router.push(ROUTES.MAHASISWA.DASHBOARD);
        }
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [router, setAuth, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await axios.post(API_ROUTES.AUTH.LOGOUT);
    } catch {
      // ignore error
    } finally {
      clearAuth();
      router.push(ROUTES.LOGIN);
    }
  }, [router, clearAuth]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
