import { NextRequest } from "next/server";
import { z } from "zod";
import { UndanganDosenService } from "@/services/undangan-dosen.service";
import {
  getTokenFromRequest,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const createSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  jabatan: z.string().min(2, "Jabatan wajib diisi"),
  nidn: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  noWa: z.string().optional(),
});

/**
 * GET /api/undangan-dosen — List with pagination, search, status, and stats
 */
export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  const sp = request.nextUrl.searchParams;
  const page = Number(sp.get("page") ?? 1);
  const limit = Number(sp.get("limit") ?? 50);
  const search = sp.get("search") ?? undefined;
  
  const statusHadirParam = sp.get("statusHadir");
  const statusHadir = statusHadirParam === "true" ? true : statusHadirParam === "false" ? false : undefined;

  try {
    const [result, stats] = await Promise.all([
      UndanganDosenService.getAll({ search, statusHadir }, page, limit),
      UndanganDosenService.getStats(),
    ]);

    return apiSuccess({
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      stats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data";
    return apiError(message, 500);
  }
}

/**
 * POST /api/undangan-dosen — Create single lecturer invitation
 */
export async function POST(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    const item = await UndanganDosenService.create(parsed.data);
    return apiSuccess(item, "Undangan dosen berhasil dibuat", 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat undangan";
    return apiError(message, 400);
  }
}

/**
 * DELETE /api/undangan-dosen — Clear all lecturer invitations
 */
export async function DELETE(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "SUPER_ADMIN") {
    return forbiddenResponse();
  }

  try {
    const count = await UndanganDosenService.deleteAll();
    return apiSuccess({ count }, `${count} undangan dosen berhasil dihapus`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus data";
    return apiError(message, 500);
  }
}
