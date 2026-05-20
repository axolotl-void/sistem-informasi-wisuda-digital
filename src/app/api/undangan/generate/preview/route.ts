import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * GET /api/undangan/generate/preview
 * Returns the count of mahasiswa LULUS yang belum punya undangan AKTIF
 * Used by the mass generate modal to display the target count.
 */
export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  const { searchParams } = request.nextUrl;
  const sesi = searchParams.get("sesi") ?? "all";

  try {
    // Build where clause for mahasiswa with LULUS status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = { status: "LULUS" };

    if (sesi && sesi !== "all") {
      const sessionKeyword = sesi.replace("Sesi ", "");
      whereClause.sesiWisuda = {
        contains: sessionKeyword,
        mode: "insensitive",
      };
    }

    // Get all LULUS mahasiswa matching the filter
    const mahasiswaList = await prisma.mahasiswa.findMany({
      where: whereClause,
      select: {
        id: true,
        nim: true,
        nama: true,
        sesiWisuda: true,
        undangan: {
          where: { statusUndangan: "AKTIF" },
          select: { id: true },
        },
      },
    });

    // Count those who don't have an active invitation yet
    const eligible = mahasiswaList.filter((m) => m.undangan.length === 0);
    const alreadyGenerated = mahasiswaList.filter((m) => m.undangan.length > 0);

    return apiSuccess({
      total: mahasiswaList.length,
      eligible: eligible.length,
      alreadyGenerated: alreadyGenerated.length,
      sesi,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data preview";
    return apiError(message, 500);
  }
}
