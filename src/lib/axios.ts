import axios from "axios";

/**
 * Axios instance dengan auto-attach Bearer token dari localStorage.
 * Dipakai di semua client-side API calls.
 */
export const api = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Selalu kirim cookie di setiap request
});

// Request interceptor — attach token dari Zustand persist storage
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("wisuda-auth");
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { token?: string } };
      const token = parsed?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // localStorage tidak tersedia (SSR) — skip
  }
  return config;
});

// Response interceptor — handle 401 global
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear auth dan redirect ke login
      try {
        localStorage.removeItem("wisuda-auth");
      } catch { /* ignore */ }
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
