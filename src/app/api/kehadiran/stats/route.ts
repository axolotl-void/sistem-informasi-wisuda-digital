import { getTokenFromRequest, unauthorizedResponse } from "@/lib/auth";
import { KehadiranService } from "@/services/kehadiran.service";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(request: Request) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  try {
    const stats = await KehadiranService.getStats();
    return apiSuccess(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil statistik";
    return apiError(message, 500);
  }
}
