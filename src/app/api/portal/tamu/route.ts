import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const HUBUNGAN_OPTIONS = ["Orang Tua", "Saudara", "Wali", "Pasangan", "Lainnya"];

const tamuItemSchema = z.object({
  nama: z.string().min(2, "Nama tamu minimal 2 karakter").max(100),
  hubungan: z.enum(HUBUNGAN_OPTIONS as [string, ...string[]]).optional().default("Lainnya"),
});

const requestSchema = z.object({
  tamu: z
    .array(tamuItemSchema)
    .min(1, "Minimal 1 tamu")
    .max(3, "Maksimal 3 tamu"),
});

/**
 * GET /api/portal/tamu
 * Ambil status pengajuan tamu mahasiswa yang sedang login
 */
export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "MAHASISWA") return forbiddenResponse();

  try {
    const mahasiswa = await prisma.mahasiswa.findFirst({
      where: { userId: payload.sub },
      select: {
        id: true,
        requestedTamu: true,
        statusPengajuan: true,
        sesiWisuda: true,
        undangan: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { id: true, kode: true, statusUndangan: true, kuotaTamu: true },
        },
        undanganTamu: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            kode: true,
            namaTamu: true,
            hubungan: true,
            qrToken: true,
            qrImageUrl: true,
            statusUndangan: true,
            statusHadir: true,
            waktuScan: true,
          },
        },
      },
    });

    if (!mahasiswa) return apiError("Data mahasiswa tidak ditemukan", 404);

    return apiSuccess({
      requestedTamu: mahasiswa.requestedTamu,
      statusPengajuan: mahasiswa.statusPengajuan,
      sesiWisuda: mahasiswa.sesiWisuda,
      undangan: mahasiswa.undangan[0] ?? null,
      undanganTamu: mahasiswa.undanganTamu,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data";
    return apiError(message, 500);
  }
}

/**
 * POST /api/portal/tamu
 * Mahasiswa submit request tamu dengan nama + hubungan → status jadi PENDING
 */
export async function POST(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "MAHASISWA") return forbiddenResponse();

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    const mahasiswa = await prisma.mahasiswa.findFirst({
      where: { userId: payload.sub },
    });
    if (!mahasiswa) return apiError("Data mahasiswa tidak ditemukan", 404);

    // Tidak bisa submit ulang jika sudah APPROVED
    if (mahasiswa.statusPengajuan === "APPROVED") {
      return apiError("Pengajuan tamu sudah disetujui dan tidak dapat diubah", 400);
    }

    const tamuList = parsed.data.tamu;

    // Hapus UndanganTamu lama jika ada (re-submit saat PENDING/REJECTED)
    await prisma.undanganTamu.deleteMany({
      where: {
        mahasiswaId: mahasiswa.id,
        statusHadir: false, // Hanya hapus yang belum discan
      },
    });

    // Buat UndanganTamu baru per-tamu (tanpa QR, QR digenerate setelah admin approve)
    const undanganTamuData = tamuList.map((tamu) => ({
      kode: `TMU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      namaTamu: tamu.nama,
      hubungan: tamu.hubungan,
      mahasiswaId: mahasiswa.id,
      statusUndangan: "AKTIF" as const,
    }));

    await prisma.undanganTamu.createMany({ data: undanganTamuData });

    // Update mahasiswa
    const updated = await prisma.mahasiswa.update({
      where: { id: mahasiswa.id },
      data: {
        requestedTamu: tamuList.length,
        statusPengajuan: "PENDING",
      },
      select: {
        id: true,
        requestedTamu: true,
        statusPengajuan: true,
      },
    });

    return apiSuccess(updated, "Pengajuan tamu berhasil dikirim, menunggu persetujuan admin");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengirim pengajuan";
    return apiError(message, 500);
  }
}

/**
 * DELETE /api/portal/tamu
 * Mahasiswa batalkan request (hanya jika masih PENDING)
 */
export async function DELETE(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "MAHASISWA") return forbiddenResponse();

  try {
    const mahasiswa = await prisma.mahasiswa.findFirst({
      where: { userId: payload.sub },
    });
    if (!mahasiswa) return apiError("Data mahasiswa tidak ditemukan", 404);

    if (mahasiswa.statusPengajuan !== "PENDING") {
      return apiError("Hanya pengajuan berstatus PENDING yang bisa dibatalkan", 400);
    }

    // Hapus semua UndanganTamu yang belum discan
    await prisma.undanganTamu.deleteMany({
      where: {
        mahasiswaId: mahasiswa.id,
        statusHadir: false,
      },
    });

    await prisma.mahasiswa.update({
      where: { id: mahasiswa.id },
      data: { requestedTamu: 0, statusPengajuan: "NONE" },
    });

    return apiSuccess(null, "Pengajuan tamu berhasil dibatalkan");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membatalkan pengajuan";
    return apiError(message, 500);
  }
}
