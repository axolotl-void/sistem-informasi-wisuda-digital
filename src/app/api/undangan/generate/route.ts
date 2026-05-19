import { NextRequest } from "next/server";
import { z } from "zod";
import { UndanganService } from "@/services/undangan.service";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const bulkSchema = z.object({
  tanggalWisuda: z.string().datetime(),
  tempatWisuda: z.string().min(2),
  kuotaTamu: z.number().int().min(1).max(10),
});

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) return apiError("Validasi gagal", 422, parsed.error.flatten());

    const result = await UndanganService.bulkGenerate(
      new Date(parsed.data.tanggalWisuda),
      parsed.data.tempatWisuda,
      parsed.data.kuotaTamu
    );

    return apiSuccess(
      result,
      `Berhasil generate ${result.generated} undangan, ${result.skipped} dilewati`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal bulk generate";
    return apiError(message, 500);
  }
}
