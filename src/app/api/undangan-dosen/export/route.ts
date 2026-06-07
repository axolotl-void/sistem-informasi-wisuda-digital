import { NextRequest } from "next/server";
import { UndanganDosenService } from "@/services/undangan-dosen.service";
import {
  getTokenFromRequest,
  unauthorizedResponse,
} from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * GET /api/undangan-dosen/export — Export all lecturer invitations
 */
export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();

  try {
    const list = await UndanganDosenService.exportData();

    // Map database models to clean Excel headers/rows
    const rows = list.map((item) => ({
      NIDN: item.nidn || "-",
      Nama: item.nama,
      Jabatan: item.jabatan,
      Email: item.email || "-",
      "No. WhatsApp": item.noWa || "-",
      "Kode Undangan": item.kode,
      Status: item.statusHadir ? "Hadir" : "Belum Hadir",
      "Waktu Hadir": item.waktuScan
        ? new Date(item.waktuScan).toLocaleString("id-ID")
        : "-",
    }));

    return apiSuccess(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal export data";
    return apiError(message, 500);
  }
}
