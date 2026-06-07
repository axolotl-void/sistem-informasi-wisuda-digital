import { NextRequest } from "next/server";
import { z } from "zod";
import { UndanganDosenService } from "@/services/undangan-dosen.service";
import {
  getTokenFromRequest,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const updateSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  jabatan: z.string().min(2, "Jabatan wajib diisi"),
  nidn: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  noWa: z.string().optional(),
  statusHadir: z.boolean().optional(),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT /api/undangan-dosen/[id] — Update lecturer invitation details
 */
export async function PUT(request: NextRequest, { params }: Params) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    const updated = await UndanganDosenService.update(id, parsed.data);
    return apiSuccess(updated, "Data undangan dosen berhasil diubah");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengubah data";
    return apiError(message, 400);
  }
}

/**
 * DELETE /api/undangan-dosen/[id] — Delete single lecturer invitation
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  const { id } = await params;

  try {
    await UndanganDosenService.delete(id);
    return apiSuccess(null, "Undangan dosen berhasil dihapus");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus data";
    return apiError(message, 400);
  }
}
