import { NextRequest } from "next/server";
import { MahasiswaService } from "@/services/mahasiswa.service";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return apiError("Body harus berupa array data mahasiswa", 422);
    }

    const result = await MahasiswaService.bulkCreate(body);
    return apiSuccess(
      result,
      `Import selesai: ${result.created} ditambahkan, ${result.skipped} dilewati`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal import data";
    return apiError(message, 500);
  }
}
