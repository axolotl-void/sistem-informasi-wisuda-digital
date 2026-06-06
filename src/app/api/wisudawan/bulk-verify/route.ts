import { NextRequest } from "next/server";
import { WisudawanService } from "@/services/wisudawan.service";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * POST /api/wisudawan/bulk-verify
 * Verifies (approves) all student accounts with status 'AKTIF', optionally filtered by fakultas and prodi.
 */
export async function POST(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { fakultas, prodi } = body;

    const count = await WisudawanService.bulkVerify({
      fakultas: fakultas || undefined,
      prodi: prodi || undefined,
    });
    return apiSuccess({ count }, `Berhasil memverifikasi massal ${count} wisudawan`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal memverifikasi massal";
    return apiError(msg, 500);
  }
}
