import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const updateSchema = z.object({
  fakultas: z.string().min(2).optional(),
  prodi: z.string().min(2).optional(),
  foto: z.string().nullable().optional(), // Base64 string atau null
  ukuranToga: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]).optional(),
});

/**
 * PATCH /api/portal/profile
 * Mahasiswa update profil sendiri (foto, fakultas, prodi)
 */
export async function PATCH(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "MAHASISWA") return forbiddenResponse();

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    // Cari mahasiswa berdasarkan userId dari token
    const mahasiswa = await prisma.mahasiswa.findFirst({
      where: { userId: payload.sub },
    });
    if (!mahasiswa) return apiError("Data mahasiswa tidak ditemukan", 404);

    // Validasi ukuran Base64 foto (max ~2MB)
    if (parsed.data.foto && parsed.data.foto.length > 2_800_000) {
      return apiError("Ukuran foto terlalu besar. Maksimal 2MB.", 413);
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.fakultas !== undefined) updateData.fakultas = parsed.data.fakultas;
    if (parsed.data.prodi !== undefined) updateData.prodi = parsed.data.prodi;
    if (parsed.data.foto !== undefined) updateData.foto = parsed.data.foto;
    if (parsed.data.ukuranToga !== undefined) updateData.ukuranToga = parsed.data.ukuranToga;

    const updated = await prisma.mahasiswa.update({
      where: { id: mahasiswa.id },
      data: updateData,
      select: {
        id: true,
        nim: true,
        nama: true,
        email: true,
        fakultas: true,
        prodi: true,
        angkatan: true,
        status: true,
        sesiWisuda: true,
        foto: true,
        ukuranToga: true,
      },
    });

    return apiSuccess(updated, "Profil berhasil diperbarui");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui profil";
    return apiError(message, 500);
  }
}
