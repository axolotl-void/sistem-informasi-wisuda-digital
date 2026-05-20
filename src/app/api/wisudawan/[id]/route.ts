import { NextRequest } from "next/server";
import { WisudawanService } from "@/services/wisudawan.service";
import { updateWisudawanSchema } from "@/validations/wisudawan.validation";
import {
  getTokenFromRequest,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/wisudawan/:id — Get single account
 */
export async function GET(request: NextRequest, { params }: Params) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  const { id } = await params;

  try {
    const wisudawan = await WisudawanService.getById(id);
    if (!wisudawan) return apiError("Wisudawan tidak ditemukan", 404);
    return apiSuccess(wisudawan);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal mengambil data";
    return apiError(msg, 500);
  }
}

/**
 * PATCH /api/wisudawan/:id — Update account
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateWisudawanSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    const wisudawan = await WisudawanService.update(id, parsed.data);
    return apiSuccess(wisudawan, "Akun berhasil diperbarui");
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal memperbarui data";
    return apiError(msg, 400);
  }
}

/**
 * DELETE /api/wisudawan/:id — Delete account
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "SUPER_ADMIN") return forbiddenResponse();

  const { id } = await params;

  try {
    await WisudawanService.delete(id);
    return apiSuccess(null, "Akun wisudawan berhasil dihapus");
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus data";
    return apiError(msg, 400);
  }
}
