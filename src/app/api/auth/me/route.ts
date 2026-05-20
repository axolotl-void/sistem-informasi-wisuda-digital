import { getTokenFromRequest, unauthorizedResponse } from "@/lib/auth";
import { AuthService } from "@/services/auth.service";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(request: Request) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  try {
    const user = await AuthService.getUserById(payload.sub);
    if (!user) return unauthorizedResponse("User tidak ditemukan");
    return apiSuccess(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data user";
    return apiError(message, 500);
  }
}
