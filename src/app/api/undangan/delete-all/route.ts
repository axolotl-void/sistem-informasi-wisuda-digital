import { NextRequest } from "next/server";
import { UndanganService } from "@/services/undangan.service";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function DELETE(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const count = await UndanganService.deleteAll();
    return apiSuccess({ count }, `Berhasil menghapus ${count} undangan`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus semua undangan";
    return apiError(message, 500);
  }
}
