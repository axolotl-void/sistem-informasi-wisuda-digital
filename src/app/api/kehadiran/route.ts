import { NextRequest } from "next/server";
import { KehadiranService } from "@/services/kehadiran.service";
import { getTokenFromRequest, unauthorizedResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);
  const search = searchParams.get("search") ?? undefined;
  const statusKehadiran = searchParams.get("status") as
    | "HADIR"
    | "TIDAK_HADIR"
    | "TERLAMBAT"
    | undefined;

  try {
    const result = await KehadiranService.getAll(
      { search, statusKehadiran },
      page,
      limit
    );
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data";
    return apiError(message, 500);
  }
}
