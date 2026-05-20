import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { KehadiranService } from "@/services/kehadiran.service";
import { apiError } from "@/lib/utils";

export async function GET(request: Request) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const csv = await KehadiranService.exportToCsv();
    const filename = `kehadiran-wisuda-${new Date().toISOString().split("T")[0]}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal export data";
    return apiError(message, 500);
  }
}
