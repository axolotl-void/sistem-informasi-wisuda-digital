import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { UndanganService } from "@/services/undangan.service";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const generateSchema = z.object({
  mahasiswaId: z.string().min(1),
  tanggalWisuda: z.string().datetime(),
  tempatWisuda: z.string().min(2),
  kuotaTamu: z.number().int().min(1).max(10),
});

export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);
  const search = searchParams.get("search") ?? undefined;
  const mahasiswaId = searchParams.get("mahasiswaId") ?? undefined;

  let targetMahasiswaId = mahasiswaId;

  // Proteksi IDOR: Mahasiswa hanya boleh mengakses undangan miliknya sendiri
  if (payload.role === "MAHASISWA") {
    const dbMahasiswa = await prisma.mahasiswa.findUnique({
      where: { userId: payload.sub },
    });
    if (!dbMahasiswa) {
      return forbiddenResponse("Profil wisudawan tidak ditemukan.");
    }
    if (mahasiswaId && mahasiswaId !== dbMahasiswa.id) {
      return forbiddenResponse("Anda tidak memiliki hak akses untuk data undangan ini.");
    }
    targetMahasiswaId = dbMahasiswa.id;
  }

  try {
    const result = await UndanganService.getAll({ search, mahasiswaId: targetMahasiswaId }, page, limit);
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data";
    return apiError(message, 500);
  }
}

export async function POST(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json();
    console.log("Generate undangan request body:", body);

    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.flatten());
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    const undangan = await UndanganService.generate({
      ...parsed.data,
      tanggalWisuda: new Date(parsed.data.tanggalWisuda),
    });
    return apiSuccess(undangan, "Undangan berhasil digenerate", 201);
  } catch (error) {
    console.error("Generate undangan error:", error);
    const message = error instanceof Error ? error.message : "Gagal generate undangan";
    return apiError(message, 400);
  }
}
