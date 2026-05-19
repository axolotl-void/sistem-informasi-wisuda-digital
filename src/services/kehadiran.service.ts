import prisma from "@/lib/prisma";
import type {
  Kehadiran,
  KehadiranFilter,
  KehadiranPagination,
  KehadiranStats,
} from "@/types/kehadiran.type";

interface CreateKehadiranDto {
  undanganId: string;
  mahasiswaId: string;
  petugasId: string;
  statusKehadiran: "HADIR" | "TIDAK_HADIR" | "TERLAMBAT";
  waktuScan: Date;
  catatan?: string;
}

export class KehadiranService {
  /**
   * Get semua kehadiran dengan filter dan pagination
   */
  static async getAll(
    filter: KehadiranFilter = {},
    page = 1,
    limit = 10
  ): Promise<KehadiranPagination> {
    const where = {
      ...(filter.statusKehadiran && { statusKehadiran: filter.statusKehadiran }),
      ...(filter.search && {
        mahasiswa: {
          OR: [
            { nama: { contains: filter.search, mode: "insensitive" as const } },
            { nim: { contains: filter.search, mode: "insensitive" as const } },
          ],
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.kehadiran.findMany({
        where,
        include: {
          mahasiswa: true,
          undangan: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { waktuScan: "desc" },
      }),
      prisma.kehadiran.count({ where }),
    ]);

    return {
      data: data as unknown as Kehadiran[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create record kehadiran
   */
  static async create(dto: CreateKehadiranDto): Promise<Kehadiran> {
    const kehadiran = await prisma.kehadiran.create({
      data: dto,
      include: { mahasiswa: true, undangan: true },
    });
    return kehadiran as unknown as Kehadiran;
  }

  /**
   * Get statistik kehadiran
   */
  static async getStats(): Promise<KehadiranStats> {
    const [total, hadir, terlambat] = await Promise.all([
      prisma.undangan.count({ where: { statusUndangan: { in: ["AKTIF", "DIGUNAKAN"] } } }),
      prisma.kehadiran.count({ where: { statusKehadiran: "HADIR" } }),
      prisma.kehadiran.count({ where: { statusKehadiran: "TERLAMBAT" } }),
    ]);

    const tidakHadir = total - hadir - terlambat;
    const persentaseKehadiran = total > 0 ? (hadir + terlambat) / total : 0;

    return {
      total,
      hadir,
      tidakHadir: Math.max(0, tidakHadir),
      terlambat,
      persentaseKehadiran,
    };
  }

  /**
   * Get kehadiran by mahasiswa ID
   */
  static async getByMahasiswaId(mahasiswaId: string): Promise<Kehadiran | null> {
    const kehadiran = await prisma.kehadiran.findFirst({
      where: { mahasiswaId },
      include: { mahasiswa: true, undangan: true },
      orderBy: { waktuScan: "desc" },
    });
    return kehadiran as unknown as Kehadiran | null;
  }

  /**
   * Export kehadiran ke format CSV
   */
  static async exportToCsv(): Promise<string> {
    const data = await prisma.kehadiran.findMany({
      include: { mahasiswa: true },
      orderBy: { waktuScan: "asc" },
    });

    const headers = ["NIM", "Nama", "Fakultas", "Prodi", "Status", "Waktu Scan"];
    const rows = data.map((k: { mahasiswa: { nim: string; nama: string; fakultas: string; prodi: string }; statusKehadiran: string; waktuScan: Date }) => [
      k.mahasiswa.nim,
      k.mahasiswa.nama,
      k.mahasiswa.fakultas,
      k.mahasiswa.prodi,
      k.statusKehadiran,
      k.waktuScan.toISOString(),
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }
}
