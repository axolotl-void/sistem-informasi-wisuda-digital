import { NextRequest } from "next/server";
import { z } from "zod";
import { MahasiswaService } from "@/services/mahasiswa.service";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const createSchema = z.object({
  nim: z.string().min(8).max(20),
  nama: z.string().min(2).max(100),
  email: z.string().email(),
  fakultas: z.string().min(2),
  prodi: z.string().min(2),
  angkatan: z.number().int().min(2000).max(2100),
  userId: z.string().cuid(),
});

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);
  const search = searchParams.get("search") ?? undefined;
  const fakultas = searchParams.get("fakultas") ?? undefined;

  try {
    const result = await MahasiswaService.getAll({ search, fakultas }, page, limit);
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data";
    return apiError(message, 500);
  }
}

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return apiError("Validasi gagal", 422, parsed.error.flatten());

    const mahasiswa = await MahasiswaService.create(parsed.data);
    return apiSuccess(mahasiswa, "Mahasiswa berhasil ditambahkan", 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menambahkan mahasiswa";
    return apiError(message, 400);
  }
}
