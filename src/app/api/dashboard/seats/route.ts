import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * GET /api/dashboard/seats
 * Returns all active invitations with student details and attendance log
 */
export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS", "PETUGAS_SCAN"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const invitations = await prisma.undangan.findMany({
      where: {
        statusUndangan: { in: ["AKTIF", "DIGUNAKAN"] },
      },
      select: {
        id: true,
        kode: true,
        statusUndangan: true,
        tanggalWisuda: true,
        tempatWisuda: true,
        kuotaTamu: true,
        pdfUrl: true,
        mahasiswaId: true,
        createdAt: true,
        updatedAt: true,
        mahasiswa: {
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
            userId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        kehadiran: {
          select: {
            id: true,
            statusKehadiran: true,
            waktuScan: true,
            catatan: true,
            undanganId: true,
            mahasiswaId: true,
            petugasId: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        mahasiswa: {
          nim: "asc",
        },
      },
    });

    return apiSuccess(invitations);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data kursi";
    return apiError(message, 500);
  }
}
