import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * GET /api/admin/tamu-requests
 * Ambil semua mahasiswa dengan statusPengajuan PENDING
 */
export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) return forbiddenResponse();

  try {
    const requests = await prisma.mahasiswa.findMany({
      where: { statusPengajuan: "PENDING" },
      select: {
        id: true,
        nim: true,
        nama: true,
        email: true,
        fakultas: true,
        prodi: true,
        sesiWisuda: true,
        foto: true,
        requestedTamu: true,
        statusPengajuan: true,
        undangan: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { id: true, kode: true, statusUndangan: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return apiSuccess(requests);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data";
    return apiError(message, 500);
  }
}
