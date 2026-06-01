import { NextRequest } from "next/server";
import { z } from "zod";
import { ScannerService } from "@/services/scanner.service";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { InMemoryRateLimiter, getClientIp } from "@/lib/rate-limiter";

const scanSchema = z.object({
  qrToken: z.string().min(1, "QR Token tidak boleh kosong"),
  gate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate Limiting: Maksimal 100 kali scan per 1 menit per IP petugas (mencegah bruteforce massal tiket)
  const scanLimitKey = `rate:scan:${ip}`;
  const ipCheck = InMemoryRateLimiter.check(scanLimitKey, 100, 60 * 1000);
  if (!ipCheck.success) {
    return apiError("Terlalu banyak upaya pemindaian. Silakan tunggu 1 menit lagi.", 429);
  }

  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["PETUGAS_SCAN", "SUPER_ADMIN"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json();
    const parsed = scanSchema.safeParse(body);
    if (!parsed.success) return apiError("Validasi gagal", 422, parsed.error.flatten());

    const result = await ScannerService.processQrScan({
      qrToken: parsed.data.qrToken,
      petugasId: payload.sub,
      gate: parsed.data.gate,
    });

    const status = result.success ? 200 : 400;
    return apiSuccess(result, result.message, status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memproses scan";
    return apiError(message, 500);
  }
}
