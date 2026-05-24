import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const CONFIG_KEY = "blok_kursi";

export interface BlokKursiConfig {
  kuning: number;
  biru: number;
  ungu: number;
  hijau: number;
  kuotaPendamping: number;
}

const DEFAULT_CONFIG: BlokKursiConfig = {
  kuning: 39,
  biru: 52,
  ungu: 52,
  hijau: 39,
  kuotaPendamping: 2,
};

const schema = z.object({
  kuning: z.number().int().min(0).max(500),
  biru: z.number().int().min(0).max(500),
  ungu: z.number().int().min(0).max(500),
  hijau: z.number().int().min(0).max(500),
  kuotaPendamping: z.number().int().min(0).max(20),
});

/**
 * GET /api/pengaturan/blok-kursi
 * Ambil konfigurasi kapasitas per blok
 */
export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  try {
    const record = await prisma.konfigurasiSistem.findUnique({
      where: { key: CONFIG_KEY },
    });

    const config: BlokKursiConfig = record
      ? (JSON.parse(record.value) as BlokKursiConfig)
      : DEFAULT_CONFIG;

    return apiSuccess(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil konfigurasi";
    return apiError(message, 500);
  }
}

/**
 * PUT /api/pengaturan/blok-kursi
 * Simpan konfigurasi kapasitas per blok
 */
export async function PUT(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) return forbiddenResponse();

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    await prisma.konfigurasiSistem.upsert({
      where: { key: CONFIG_KEY },
      update: { value: JSON.stringify(parsed.data) },
      create: { key: CONFIG_KEY, value: JSON.stringify(parsed.data) },
    });

    return apiSuccess(parsed.data, "Konfigurasi blok kursi berhasil disimpan");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan konfigurasi";
    return apiError(message, 500);
  }
}
