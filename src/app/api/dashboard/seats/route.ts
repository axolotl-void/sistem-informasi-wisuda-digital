import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * GET /api/dashboard/seats
 * Returns all active invitations with student details and attendance log
 */
export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  try {
    const invitations = await prisma.undangan.findMany({
      where: {
        statusUndangan: { in: ["AKTIF", "DIGUNAKAN"] },
      },
      include: {
        mahasiswa: true,
        kehadiran: true,
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
