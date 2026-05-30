"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { persistAuth } from "@/lib/client-auth";
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
        const { data } = await axios.post(API_ROUTES.AUTH.LOGIN, credentials, {
          withCredentials: true,
        });
        const { user, token } = data.data;
        setAuth(user, token);
        persistAuth(user, token);

        const role = user.role;

        // Portal mahasiswa: navigasi penuh agar storage + cookie stabil di mobile Safari / preview
        if (role === "MAHASISWA") {
          setLoading(false);
          window.location.assign(ROUTES.PORTAL.HOME);
          return;
        }

        setLoading(false);
        if (role === "SUPER_ADMIN" || role === "ADMIN_FAKULTAS") {
          router.replace(ROUTES.ADMIN.DASHBOARD);
        } else if (role === "PETUGAS_SCAN") {
          router.replace(ROUTES.SCANNER.PETUGAS);
        } else {
          router.replace(ROUTES.LOGIN);
        }
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [router, setAuth, setLoading],
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
