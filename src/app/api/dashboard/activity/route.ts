import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { DashboardService } from "@/services/dashboard.service";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * GET /api/dashboard/activity
 * Log aktivitas scan kehadiran terbaru
 */
export async function GET(request: Request) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 10), 30);
    const activities = await DashboardService.getRecentActivity(limit);
    return apiSuccess(activities);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mengambil aktivitas terkini";
    return apiError(message, 500);
  }
}
