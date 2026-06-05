import { NextRequest } from "next/server";
import { WisudawanService } from "@/services/wisudawan.service";
import { createWisudawanSchema } from "@/validations/wisudawan.validation";
import {
  getTokenFromRequest,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * GET /api/wisudawan — List with search, filter, pagination
 */
export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  const sp = request.nextUrl.searchParams;
  const page = Number(sp.get("page") ?? 1);
  const limit = Number(sp.get("limit") ?? 10);
  const search = sp.get("search") ?? undefined;
  const fakultas = sp.get("fakultas") ?? undefined;
  const prodi = sp.get("prodi") ?? undefined;
  const status = sp.get("status") ?? undefined;

  try {
    const result = await WisudawanService.getAll(
      { search, fakultas, prodi, status },
      page,
      limit,
    );
    return apiSuccess(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mengambil data";
    return apiError(message, 500);
  }
}

/**
 * POST /api/wisudawan — Create account
 */
export async function POST(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json();
    const parsed = createWisudawanSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    const wisudawan = await WisudawanService.create(parsed.data);
    return apiSuccess(wisudawan, "Akun wisudawan berhasil dibuat", 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal membuat akun";
    return apiError(message, 400);
  }
}
