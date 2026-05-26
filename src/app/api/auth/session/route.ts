import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getTokenFromRequest, unauthorizedResponse } from "@/lib/auth";
import { AuthService } from "@/services/auth.service";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * GET /api/auth/session
 * Sinkronkan user + token ke client (localStorage) dari cookie httpOnly.
 * Dipakai saat cookie valid tapi token di localStorage hilang (mobile preview / Safari).
 */
export async function GET(request: Request) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  try {
    const user = await AuthService.getUserById(payload.sub);
    if (!user) return unauthorizedResponse("User tidak ditemukan");

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return unauthorizedResponse("Sesi tidak ditemukan");

    return apiSuccess({ user, token });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil sesi";
    return apiError(message, 500);
  }
}
