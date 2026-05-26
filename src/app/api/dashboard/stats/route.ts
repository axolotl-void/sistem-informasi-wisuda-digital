import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { DashboardService } from "@/services/dashboard.service";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * GET /api/dashboard/stats
 * Ringkasan statistik dashboard admin
 */
export async function GET(request: Request) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const overview = await DashboardService.getOverview();
    return apiSuccess(overview);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil statistik dashboard";
    return apiError(message, 500);
  }
}
