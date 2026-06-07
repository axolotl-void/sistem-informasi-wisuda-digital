import prisma from "@/lib/prisma";
import { randomString } from "@/lib/utils";

function normalizeWaNumber(phone?: string | null): string | null {
  if (!phone) return null;
  let cleaned = phone.toString().replace(/\D/g, "");
  if (!cleaned) return null;
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  return cleaned;
}

export interface UndanganDosenFilter {
  search?: string;
  statusHadir?: boolean;
}

export class UndanganDosenService {
  static async getAll(filter: UndanganDosenFilter = {}, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filter.search) {
      where.OR = [
        { nama: { contains: filter.search, mode: "insensitive" } },
        { nidn: { contains: filter.search, mode: "insensitive" } },
        { jabatan: { contains: filter.search, mode: "insensitive" } },
        { kode: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    if (filter.statusHadir !== undefined) {
      where.statusHadir = filter.statusHadir;
    }

    const [data, total] = await Promise.all([
      prisma.undanganDosen.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.undanganDosen.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async getStats() {
    const [total, hadir] = await Promise.all([
      prisma.undanganDosen.count(),
      prisma.undanganDosen.count({ where: { statusHadir: true } }),
    ]);

    return {
      total,
      hadir,
      belumHadir: total - hadir,
    };
  }

  static async getByQrToken(qrToken: string) {
    return prisma.undanganDosen.findUnique({
      where: { qrToken },
    });
  }

  static async create(input: {
    nama: string;
    jabatan: string;
    nidn?: string;
    email?: string;
    noWa?: string;
  }) {
    const year = new Date().getFullYear();
    const uniqueSuffix = randomString(6).toUpperCase();
    const kode = `DSN-${year}-${uniqueSuffix}`;
    const qrToken = `QR-DSN-${randomString(16)}`;

    return prisma.undanganDosen.create({
      data: {
        kode,
        qrToken,
        nama: input.nama,
        jabatan: input.jabatan,
        nidn: input.nidn || null,
        email: input.email || null,
        noWa: normalizeWaNumber(input.noWa),
        statusHadir: false,
      },
    });
  }

  static async update(
    id: string,
    input: {
      nama: string;
      jabatan: string;
      nidn?: string;
      email?: string;
      noWa?: string;
      statusHadir?: boolean;
    }
  ) {
    const data: any = {
      nama: input.nama,
      jabatan: input.jabatan,
      nidn: input.nidn || null,
      email: input.email || null,
      noWa: normalizeWaNumber(input.noWa),
    };

    if (input.statusHadir !== undefined) {
      data.statusHadir = input.statusHadir;
      if (input.statusHadir) {
        data.waktuScan = new Date();
      } else {
        data.waktuScan = null;
      }
    }

    return prisma.undanganDosen.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.undanganDosen.delete({
      where: { id },
    });
  }

  static async deleteAll() {
    const result = await prisma.undanganDosen.deleteMany({});
    return result.count;
  }

  static async importExcel(rows: {
    nama: string;
    jabatan: string;
    nidn?: string;
    email?: string;
    noWa?: string;
  }[]) {
    let created = 0;
    let skipped = 0;
    const skippedLogs: string[] = [];

    // Filter duplicates within the file itself
    const seenNidns = new Set<string>();
    const uniqueRows: typeof rows = [];

    for (const row of rows) {
      const nidn = row.nidn ? row.nidn.trim() : "";
      if (nidn && seenNidns.has(nidn)) {
        skipped++;
        skippedLogs.push(`NIDN Duplikat dalam file Excel: NIDN ${nidn} (${row.nama})`);
      } else {
        if (nidn) seenNidns.add(nidn);
        uniqueRows.push(row);
      }
    }

    // Process chunked creations
    const chunkSize = 50;
    for (let i = 0; i < uniqueRows.length; i += chunkSize) {
      const chunk = uniqueRows.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (row) => {
          try {
            // Check if NIDN already exists
            const nidn = row.nidn ? row.nidn.trim() : "";
            if (nidn) {
              const existing = await prisma.undanganDosen.findFirst({
                where: { nidn },
              });
              if (existing) {
                skipped++;
                skippedLogs.push(`NIDN sudah terdaftar: NIDN ${nidn} (${row.nama})`);
                return;
              }
            }

            // Create invitation
            const year = new Date().getFullYear();
            const uniqueSuffix = randomString(6).toUpperCase();
            const kode = `DSN-${year}-${uniqueSuffix}`;
            const qrToken = `QR-DSN-${randomString(16)}`;

            await prisma.undanganDosen.create({
              data: {
                kode,
                qrToken,
                nama: row.nama,
                jabatan: row.jabatan,
                nidn: nidn || null,
                email: row.email || null,
                noWa: normalizeWaNumber(row.noWa),
                statusHadir: false,
              },
            });
            created++;
          } catch (err) {
            skipped++;
            skippedLogs.push(`Gagal mengimpor ${row.nama}: ${err instanceof Error ? err.message : "Error tidak diketahui"}`);
          }
        })
      );
    }

    return {
      created,
      skipped,
      skippedLogs,
    };
  }

  static async exportData() {
    return prisma.undanganDosen.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
