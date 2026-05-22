import prisma from "@/lib/prisma";
import { emitScanResult, emitStatsUpdate } from "@/lib/socket";
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
    const where: any = {
      statusUndangan: { in: ["AKTIF", "DIGUNAKAN"] },
    };

    const mahasiswaWhere: any = {};
    let hasMahasiswaWhere = false;

    if (filter.search) {
      mahasiswaWhere.OR = [
        { nama: { contains: filter.search, mode: "insensitive" } },
        { nim: { contains: filter.search, mode: "insensitive" } },
      ];
      hasMahasiswaWhere = true;
    }

    if (filter.fakultas) {
      mahasiswaWhere.fakultas = filter.fakultas;
      hasMahasiswaWhere = true;
    }

    if (filter.sesiWisuda) {
      mahasiswaWhere.sesiWisuda = filter.sesiWisuda;
      hasMahasiswaWhere = true;
    }

    if (hasMahasiswaWhere) {
      where.mahasiswa = mahasiswaWhere;
    }

    if (filter.statusKehadiran) {
      if (filter.statusKehadiran === "TIDAK_HADIR") {
        where.kehadiran = null;
      } else {
        where.kehadiran = {
          statusKehadiran: filter.statusKehadiran,
        };
      }
    }

    const [undanganData, total] = await Promise.all([
      prisma.undangan.findMany({
        where,
        include: {
          mahasiswa: true,
          kehadiran: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { kehadiran: { waktuScan: "desc" } },
          { createdAt: "desc" },
        ],
      }),
      prisma.undangan.count({ where }),
    ]);

    const formattedData = undanganData.map((u) => ({
      id: u.kehadiran?.id ?? `virtual-${u.id}`,
      undanganId: u.id,
      mahasiswaId: u.mahasiswaId,
      statusKehadiran: (u.kehadiran?.statusKehadiran ?? "TIDAK_HADIR") as any,
      waktuScan: u.kehadiran?.waktuScan ?? null,
      catatan: u.kehadiran?.catatan ?? null,
      petugasId: u.kehadiran?.petugasId ?? null,
      createdAt: u.kehadiran?.createdAt ?? u.createdAt,
      mahasiswa: u.mahasiswa as any,
      undangan: u as any,
    }));

    return {
      data: formattedData as unknown as Kehadiran[],
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
   * Manual override kehadiran (Tandai Hadir Manual atau Reset Kehadiran)
   */
  static async manualOverride(
    mahasiswaId: string,
    statusKehadiran: "HADIR" | "TERLAMBAT" | "TIDAK_HADIR",
    petugasId: string,
    catatan?: string
  ): Promise<Kehadiran | null> {
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { id: mahasiswaId },
      include: {
        undangan: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!mahasiswa) {
      throw new Error("Mahasiswa tidak ditemukan");
    }

    const undangan = mahasiswa.undangan[0];
    if (!undangan) {
      throw new Error("Undangan untuk mahasiswa ini tidak ditemukan");
    }

    if (statusKehadiran === "TIDAK_HADIR") {
      // Revert / Reset Kehadiran: Hapus record kehadiran (jika ada) dan kembalikan status undangan ke AKTIF
      await prisma.$transaction([
        prisma.kehadiran.deleteMany({
          where: { undanganId: undangan.id },
        }),
        prisma.undangan.update({
          where: { id: undangan.id },
          data: { statusUndangan: "AKTIF" },
        }),
      ]);

      // Emit stats update
      const stats = await this.getStats();
      emitStatsUpdate(stats as unknown as Record<string, unknown>);

      return null;
    } else {
      // Tandai Hadir / Terlambat: Buat/update record kehadiran dan ubah status undangan ke DIGUNAKAN
      const kehadiran = await prisma.$transaction(async (tx) => {
        // Cek apakah sudah ada kehadiran
        const existing = await tx.kehadiran.findFirst({
          where: { undanganId: undangan.id },
        });

        let record;
        if (existing) {
          record = await tx.kehadiran.update({
            where: { id: existing.id },
            data: {
              statusKehadiran,
              waktuScan: new Date(),
              petugasId,
              catatan: catatan || "Diberi kehadiran manual oleh admin",
            },
            include: { mahasiswa: true, undangan: true },
          });
        } else {
          record = await tx.kehadiran.create({
            data: {
              undanganId: undangan.id,
              mahasiswaId,
              petugasId,
              statusKehadiran,
              waktuScan: new Date(),
              catatan: catatan || "Hadir manual",
            },
            include: { mahasiswa: true, undangan: true },
          });
        }

        await tx.undangan.update({
          where: { id: undangan.id },
          data: { statusUndangan: "DIGUNAKAN" },
        });

        return record;
      });

      // Emit realtime update
      const result = {
        success: true,
        message: `${mahasiswa.nama} ditandai hadir manual`,
        kehadiran: kehadiran as never,
        mahasiswa: mahasiswa as never,
      };
      emitScanResult(result);

      // Emit stats update
      const stats = await this.getStats();
      emitStatsUpdate(stats as unknown as Record<string, unknown>);

      return kehadiran as unknown as Kehadiran;
    }
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
    const data = await prisma.undangan.findMany({
      where: { statusUndangan: { in: ["AKTIF", "DIGUNAKAN"] } },
      include: {
        mahasiswa: true,
        kehadiran: true,
      },
      orderBy: [
        { kehadiran: { waktuScan: "asc" } },
        { mahasiswa: { nama: "asc" } },
      ],
    });

    const headers = ["NIM", "Nama", "Fakultas", "Prodi", "Sesi Wisuda", "Status Kehadiran", "Waktu Scan"];
    const rows = data.map((u) => [
      u.mahasiswa.nim,
      u.mahasiswa.nama,
      u.mahasiswa.fakultas,
      u.mahasiswa.prodi,
      u.mahasiswa.sesiWisuda || "Sesi Utama",
      u.kehadiran?.statusKehadiran ?? "TIDAK_HADIR",
      u.kehadiran?.waktuScan ? u.kehadiran.waktuScan.toISOString() : "-",
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }
}
