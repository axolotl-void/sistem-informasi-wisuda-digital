import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateQrToken, generateQrDataUrl } from "@/utils/qr";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  // Diperlukan saat approve
  tanggalWisuda: z.string().datetime().optional(),
  tempatWisuda: z.string().min(2).optional(),
});

type Params = { params: Promise<{ mahasiswaId: string }> };

/**
 * PATCH /api/admin/tamu-requests/:mahasiswaId
 * Admin approve atau reject pengajuan tamu.
 * Jika approve → otomatis generate undangan dengan kuotaTamu = requestedTamu
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) return forbiddenResponse();

  const { mahasiswaId } = await params;

  try {
    const body = await request.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { id: mahasiswaId },
      include: {
        undangan: {
          where: { statusUndangan: "AKTIF" },
          take: 1,
        },
      },
    });

    if (!mahasiswa) return apiError("Mahasiswa tidak ditemukan", 404);
    if (mahasiswa.statusPengajuan !== "PENDING") {
      return apiError("Pengajuan tidak dalam status PENDING", 400);
    }

    const { action } = parsed.data;

    if (action === "reject") {
      // Tolak pengajuan — reset ke NONE
      await prisma.mahasiswa.update({
        where: { id: mahasiswaId },
        data: { statusPengajuan: "REJECTED" },
      });
      return apiSuccess(null, "Pengajuan tamu ditolak");
    }

    // -- APPROVE --------------------------------------------------------------
    // Cek apakah sudah punya undangan aktif
    if (mahasiswa.undangan.length > 0) {
      // Sudah punya undangan — update kuotaTamu saja
      await prisma.$transaction([
        prisma.undangan.update({
          where: { id: mahasiswa.undangan[0].id },
          data: { kuotaTamu: mahasiswa.requestedTamu },
        }),
        prisma.mahasiswa.update({
          where: { id: mahasiswaId },
          data: { statusPengajuan: "APPROVED" },
        }),
      ]);

      return apiSuccess(
        { undanganId: mahasiswa.undangan[0].id },
        `Pengajuan disetujui. Kuota tamu diperbarui menjadi ${mahasiswa.requestedTamu} orang`
      );
    }

    // Belum punya undangan — generate baru
    const tanggalWisuda = parsed.data.tanggalWisuda
      ? new Date(parsed.data.tanggalWisuda)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // default +30 hari

    const tempatWisuda = parsed.data.tempatWisuda ?? "Auditorium Utama";

    const kode = `WIS-${Date.now().toString(36).toUpperCase()}`;
    const undanganId = crypto.randomUUID();
    const qrToken = generateQrToken(mahasiswaId, undanganId);
    const qrImageUrl = await generateQrDataUrl(qrToken);

    const [undangan] = await prisma.$transaction([
      prisma.undangan.create({
        data: {
          id: undanganId,
          kode,
          mahasiswaId,
          qrToken,
          qrImageUrl,
          statusUndangan: "AKTIF",
          tanggalWisuda,
          tempatWisuda,
          kuotaTamu: mahasiswa.requestedTamu,
        },
      }),
      prisma.mahasiswa.update({
        where: { id: mahasiswaId },
        data: { statusPengajuan: "APPROVED" },
      }),
    ]);

    return apiSuccess(
      { undanganId: undangan.id, kode: undangan.kode },
      `Pengajuan disetujui. Undangan berhasil digenerate dengan kuota ${mahasiswa.requestedTamu} tamu`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memproses pengajuan";
    return apiError(message, 500);
  }
}
