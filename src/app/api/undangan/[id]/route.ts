import { NextRequest } from "next/server";
import { UndanganService } from "@/services/undangan.service";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const { id } = await params;
    await UndanganService.delete(id);
    return apiSuccess(null, "Undangan berhasil dihapus");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus undangan";
    return apiError(message, 500);
  }
}
