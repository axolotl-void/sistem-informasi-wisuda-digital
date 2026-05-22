import { NextRequest } from "next/server";
import { z } from "zod";
import { KehadiranService } from "@/services/kehadiran.service";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);
  const search = searchParams.get("search") ?? undefined;
  const statusKehadiran = searchParams.get("status") as any;
  const fakultas = searchParams.get("fakultas") ?? undefined;
  const sesiWisuda = searchParams.get("sesi") ?? undefined;

  try {
    const result = await KehadiranService.getAll(
      {
        search,
        statusKehadiran: statusKehadiran === "all" ? undefined : statusKehadiran,
        fakultas: fakultas === "all" ? undefined : fakultas,
        sesiWisuda: sesiWisuda === "all" ? undefined : sesiWisuda,
      },
      page,
      limit
    );
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data";
    return apiError(message, 500);
  }
}

const manualSchema = z.object({
  mahasiswaId: z.string().min(1, "Mahasiswa ID tidak boleh kosong"),
  statusKehadiran: z.enum(["HADIR", "TERLAMBAT", "TIDAK_HADIR"]).default("HADIR"),
  catatan: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS", "PETUGAS_SCAN"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json();
    const parsed = manualSchema.safeParse(body);
    if (!parsed.success) return apiError("Validasi gagal", 422, parsed.error.flatten());

    const { mahasiswaId, statusKehadiran, catatan } = parsed.data;
    const result = await KehadiranService.manualOverride(
      mahasiswaId,
      statusKehadiran,
      payload.sub, // ID user yang sedang login
      catatan
    );

    return apiSuccess(result, "Status kehadiran berhasil diperbarui");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui kehadiran";
    return apiError(message, 500);
  }
}
