import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const requestSchema = z.object({
  jumlahTamu: z.number().int().min(1).max(10),
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
      },
    });

    if (!mahasiswa) return apiError("Data mahasiswa tidak ditemukan", 404);

    return apiSuccess({
      requestedTamu: mahasiswa.requestedTamu,
      statusPengajuan: mahasiswa.statusPengajuan,
      sesiWisuda: mahasiswa.sesiWisuda,
      undangan: mahasiswa.undangan[0] ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data";
    return apiError(message, 500);
  }
}

/**
 * POST /api/portal/tamu
 * Mahasiswa submit request jumlah tamu → status jadi PENDING
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

    const updated = await prisma.mahasiswa.update({
      where: { id: mahasiswa.id },
      data: {
        requestedTamu: parsed.data.jumlahTamu,
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
