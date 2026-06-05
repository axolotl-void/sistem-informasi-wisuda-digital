import { NextRequest } from "next/server";
import { WisudawanService } from "@/services/wisudawan.service";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function DELETE(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "SUPER_ADMIN") {
    return forbiddenResponse();
  }

  try {
    const count = await WisudawanService.deleteAll();
    return apiSuccess({ count }, `Berhasil menghapus ${count} akun wisudawan`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus semua akun wisudawan";
    return apiError(message, 500);
  }
}
