import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const CONFIG_KEY = "wisuda_settings";

const DEFAULT_CONFIG = {
  namaAcara: "Wisuda Periode 2026/2027",
  tanggalPelaksanaan: "2026-06-25",
  lokasi: "Auditorium Utama UBBG",
  sesiList: ["Sesi Pagi", "Sesi Siang", "Sesi Sore"],
  gateList: ["Gate Utama", "Gate VIP", "Gate Selatan"],
  kapasitasKursi: 200,
  kuotaPendamping: 2,
};

const settingsSchema = z.object({
  namaAcara: z.string().min(1, "Nama acara tidak boleh kosong").default(DEFAULT_CONFIG.namaAcara),
  tanggalPelaksanaan: z.string().min(1, "Tanggal pelaksanaan tidak boleh kosong").default(DEFAULT_CONFIG.tanggalPelaksanaan),
  lokasi: z.string().min(1, "Lokasi tidak boleh kosong").default(DEFAULT_CONFIG.lokasi),
  sesiList: z.array(z.string()).default(DEFAULT_CONFIG.sesiList),
  gateList: z.array(z.string()).default(DEFAULT_CONFIG.gateList),
  kapasitasKursi: z.coerce.number().int().min(0).default(DEFAULT_CONFIG.kapasitasKursi),
  kuotaPendamping: z.coerce.number().int().min(0).default(DEFAULT_CONFIG.kuotaPendamping),
});

/**
 * GET /api/pengaturan
 * Ambil pengaturan sistem terpusat
 */
export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  try {
    const record = await prisma.konfigurasiSistem.findUnique({
      where: { key: CONFIG_KEY },
    });

    const config = record
      ? JSON.parse(record.value)
      : DEFAULT_CONFIG;

    return apiSuccess(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil pengaturan";
    return apiError(message, 500);
  }
}

/**
 * PUT /api/pengaturan
 * Simpan pengaturan sistem terpusat
 */
export async function PUT(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) {
    console.warn("PUT /api/pengaturan: Unauthorized - No payload");
    return unauthorizedResponse();
  }
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    console.warn(`PUT /api/pengaturan: Forbidden for role ${payload.role}`);
    return forbiddenResponse();
  }

  try {
    const body = await request.json();
    console.log("PUT /api/pengaturan request body:", body);
    
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      console.warn("PUT /api/pengaturan validation failed:", parsed.error.format());
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    await prisma.konfigurasiSistem.upsert({
      where: { key: CONFIG_KEY },
      update: { value: JSON.stringify(parsed.data) },
      create: { id: CONFIG_KEY, key: CONFIG_KEY, value: JSON.stringify(parsed.data) },
    });

    console.log("PUT /api/pengaturan: Success saving configurations");
    return apiSuccess(parsed.data, "Pengaturan sistem berhasil disimpan");
  } catch (error) {
    console.error("PUT /api/pengaturan exception:", error);
    const message = error instanceof Error ? error.message : "Gagal menyimpan pengaturan";
    return apiError(message, 500);
  }
}
