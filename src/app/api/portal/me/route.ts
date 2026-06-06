import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * GET /api/portal/me
 * Ambil data mahasiswa yang sedang login (berdasarkan session cookie)
 */
export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "MAHASISWA") return forbiddenResponse();

  try {
    const mahasiswa = await prisma.mahasiswa.findFirst({
      where: { userId: payload.sub },
      include: {
        user: {
          select: {
            password: true,
          },
        },
        undangan: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            kode: true,
            qrToken: true,
            qrImageUrl: true,
            statusUndangan: true,
            tanggalWisuda: true,
            tempatWisuda: true,
            kuotaTamu: true,
          },
        },
        kehadiran: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { statusKehadiran: true, waktuScan: true },
        },
      },
    });

    if (!mahasiswa) return apiError("Data mahasiswa tidak ditemukan", 404);

    const isDefaultPassword = mahasiswa.user?.password
      ? bcrypt.compareSync(mahasiswa.nim, mahasiswa.user.password)
      : false;

    return apiSuccess({
      id: mahasiswa.id,
      nim: mahasiswa.nim,
      nama: mahasiswa.nama,
      email: mahasiswa.email,
      fakultas: mahasiswa.fakultas,
      prodi: mahasiswa.prodi,
      angkatan: mahasiswa.angkatan,
      status: mahasiswa.status,
      sesiWisuda: mahasiswa.sesiWisuda,
      gate: mahasiswa.gate,
      foto: mahasiswa.foto,
      ukuranToga: mahasiswa.ukuranToga,
      isDefaultPassword,
      undangan: mahasiswa.undangan[0] ?? null,
      kehadiran: mahasiswa.kehadiran[0] ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data";
    return apiError(message, 500);
  }
}
