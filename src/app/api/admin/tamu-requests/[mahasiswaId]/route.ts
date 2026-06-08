import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateQrToken, generateQrDataUrl } from "@/utils/qr";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  // Diperlukan saat approve (jika belum punya undangan wisudawan)
  tanggalWisuda: z.string().datetime().optional(),
  tempatWisuda: z.string().min(2).optional(),
});

type Params = { params: Promise<{ mahasiswaId: string }> };

/**
 * PATCH /api/admin/tamu-requests/:mahasiswaId
 * Admin approve atau reject pengajuan tamu.
 * Jika approve → generate QR untuk setiap UndanganTamu milik mahasiswa
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
        undanganTamu: {
          where: { statusHadir: false },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!mahasiswa) return apiError("Mahasiswa tidak ditemukan", 404);
    if (mahasiswa.statusPengajuan !== "PENDING") {
      return apiError("Pengajuan tidak dalam status PENDING", 400);
    }

    const { action } = parsed.data;

    if (action === "reject") {
      // Tolak pengajuan — set status REJECTED & hapus UndanganTamu
      await prisma.$transaction([
        prisma.undanganTamu.deleteMany({
          where: { mahasiswaId, statusHadir: false },
        }),
        prisma.mahasiswa.update({
          where: { id: mahasiswaId },
          data: { statusPengajuan: "REJECTED", requestedTamu: 0 },
        }),
      ]);
      return apiSuccess(null, "Pengajuan tamu ditolak");
    }

    // -- APPROVE ---------------------------------------------------------------

    // 1. Generate QR untuk setiap UndanganTamu
    const tamuUpdates = [];
    for (const tamu of mahasiswa.undanganTamu) {
      const qrToken = generateQrToken(mahasiswaId, tamu.id);
      const qrImageUrl = await generateQrDataUrl(qrToken);

      tamuUpdates.push(
        prisma.undanganTamu.update({
          where: { id: tamu.id },
          data: { qrToken, qrImageUrl },
        })
      );
    }

    // 2. Update kuotaTamu pada undangan wisudawan jika ada
    const undanganUpdates = [];
    if (mahasiswa.undangan.length > 0) {
      undanganUpdates.push(
        prisma.undangan.update({
          where: { id: mahasiswa.undangan[0].id },
          data: { kuotaTamu: mahasiswa.requestedTamu },
        })
      );
    }

    // 3. Update status mahasiswa
    const mahasiswaUpdate = prisma.mahasiswa.update({
      where: { id: mahasiswaId },
      data: { statusPengajuan: "APPROVED" },
    });

    // Execute all in transaction
    await prisma.$transaction([...tamuUpdates, ...undanganUpdates, mahasiswaUpdate]);

    return apiSuccess(
      { tamuGenerated: mahasiswa.undanganTamu.length },
      `Pengajuan disetujui. ${mahasiswa.undanganTamu.length} QR tamu berhasil digenerate`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memproses pengajuan";
    return apiError(message, 500);
  }
}
