import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

/**
 * GET /api/mahasiswa/export
 * Ambil seluruh data mahasiswa dan kembalikan sebagai JSON
 * untuk di-render menjadi Excel di sisi client.
 */
export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const rows = await prisma.mahasiswa.findMany({
      orderBy: [
        { nomorUrut: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        nomorUrut: true,
        isCumlaude: true,
        nim:      true,
        nama:     true,
        email:    true,
        fakultas: true,
        prodi:    true,
        angkatan: true,
        status:   true,
        tahunLulus: true,
        ipk:      true,
        tanggalLulus: true,
        createdAt: true,
      },
    });

    // Map ke format kolom yang ramah untuk Excel
    const STATUS_LABEL: Record<string, string> = {
      AKTIF:   "Aktif",
      LULUS:   "Terverifikasi",
      CUTI:    "Cuti",
      DROPOUT: "Ditolak",
    };

    const data = rows.map((m, i) => ({
      No:                  m.nomorUrut ?? (i + 1),
      NIM:                 m.nim,
      Nama:                m.nama + (m.isCumlaude ? " (Cumlaude)" : ""),
      Email:               m.email,
      Fakultas:            m.fakultas,
      "Program Studi":     m.prodi,
      Angkatan:            m.angkatan,
      "Tahun Lulus":       m.tahunLulus ?? "",
      IPK:                 m.ipk ?? "",
      "Tanggal Lulus":     m.tanggalLulus ? new Date(m.tanggalLulus).toLocaleDateString("id-ID") : "",
      "Status Verifikasi": STATUS_LABEL[m.status] ?? m.status,
      "Tanggal Daftar":    new Date(m.createdAt).toLocaleDateString("id-ID"),
    }));

    return apiSuccess(data, `${data.length} data berhasil diekspor`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengekspor data";
    return apiError(message, 500);
  }
}
