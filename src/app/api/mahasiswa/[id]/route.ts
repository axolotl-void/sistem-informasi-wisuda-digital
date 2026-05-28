import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { MahasiswaService } from "@/services/mahasiswa.service";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  const { id } = await params;

  // Proteksi IDOR: Mahasiswa hanya boleh mengakses datanya sendiri
  if (payload.role === "MAHASISWA") {
    const dbMahasiswa = await prisma.mahasiswa.findUnique({
      where: { userId: payload.sub },
    });
    if (!dbMahasiswa || dbMahasiswa.id !== id) {
      return forbiddenResponse("Anda tidak memiliki hak akses untuk data wisudawan ini.");
    }
  }

  try {
    const mahasiswa = await MahasiswaService.getById(id);
    if (!mahasiswa) return apiError("Mahasiswa tidak ditemukan", 404);
    return apiSuccess(mahasiswa);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data";
    return apiError(message, 500);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const mahasiswa = await MahasiswaService.update(id, body);
    return apiSuccess(mahasiswa, "Mahasiswa berhasil diperbarui");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui data";
    return apiError(message, 400);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "SUPER_ADMIN") return forbiddenResponse();

  const { id } = await params;

  try {
    await MahasiswaService.delete(id);
    return apiSuccess(null, "Mahasiswa berhasil dihapus");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus data";
    return apiError(message, 400);
  }
}
