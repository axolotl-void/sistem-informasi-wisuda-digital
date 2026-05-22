import prisma from "@/lib/prisma";
import { generateQrToken, generateQrDataUrl } from "@/utils/qr";
import type {
  Undangan,
  CreateUndanganDto,
  UpdateUndanganDto,
  UndanganFilter,
  UndanganPagination,
} from "@/types/undangan.type";

export class UndanganService {
  /**
   * Get semua undangan dengan filter dan pagination
   */
  static async getAll(
    filter: UndanganFilter = {},
    page = 1,
    limit = 10
  ): Promise<UndanganPagination> {
    const where = {
      ...(filter.statusUndangan && { statusUndangan: filter.statusUndangan }),
      ...(filter.mahasiswaId && { mahasiswaId: filter.mahasiswaId }),
      ...(filter.tanggalWisuda && { tanggalWisuda: filter.tanggalWisuda }),
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
      prisma.undangan.findMany({
        where,
        include: { 
          mahasiswa: true,
          kehadiran: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.undangan.count({ where }),
    ]);

    return {
      data: data as unknown as Undangan[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get undangan by ID
   */
  static async getById(id: string): Promise<Undangan | null> {
    const undangan = await prisma.undangan.findUnique({
      where: { id },
      include: { mahasiswa: true },
    });
    return undangan as unknown as Undangan | null;
  }

  /**
   * Get undangan by mahasiswa ID
   */
  static async getByMahasiswaId(mahasiswaId: string): Promise<Undangan | null> {
    const undangan = await prisma.undangan.findFirst({
      where: { mahasiswaId },
      include: { mahasiswa: true },
      orderBy: { createdAt: "desc" },
    });
    return undangan as unknown as Undangan | null;
  }

  /**
   * Get undangan by QR token
   */
  static async getByQrToken(qrToken: string): Promise<Undangan | null> {
    const undangan = await prisma.undangan.findFirst({
      where: { qrToken },
      include: { mahasiswa: true },
    });
    return undangan as unknown as Undangan | null;
  }

  /**
   * Generate undangan baru dengan QR code
   */
  static async generate(dto: CreateUndanganDto): Promise<Undangan> {
    const existing = await prisma.undangan.findFirst({
      where: { mahasiswaId: dto.mahasiswaId, statusUndangan: "AKTIF" },
    });
    if (existing) throw new Error("Mahasiswa sudah memiliki undangan aktif");

    const kode = `UND-${Date.now().toString(36).toUpperCase()}`;
    const undanganId = crypto.randomUUID();
    const qrToken = generateQrToken(dto.mahasiswaId, undanganId);
    const qrImageUrl = await generateQrDataUrl(qrToken);

    const undangan = await prisma.undangan.create({
      data: {
        id: undanganId,
        kode,
        mahasiswaId: dto.mahasiswaId,
        qrToken,
        qrImageUrl,
        statusUndangan: "AKTIF",
        tanggalWisuda: dto.tanggalWisuda,
        tempatWisuda: dto.tempatWisuda,
        kuotaTamu: dto.kuotaTamu,
      },
      include: { mahasiswa: true },
    });

    return undangan as unknown as Undangan;
  }

  /**
   * Update undangan
   */
  static async update(id: string, dto: UpdateUndanganDto): Promise<Undangan> {
    const undangan = await prisma.undangan.update({
      where: { id },
      data: dto,
      include: { mahasiswa: true },
    });
    return undangan as unknown as Undangan;
  }

  /**
   * Bulk generate undangan untuk semua mahasiswa lulus
   */
  static async bulkGenerate(
    tanggalWisuda: Date,
    tempatWisuda: string,
    kuotaTamu: number,
    sesi?: string
  ): Promise<{ generated: number; skipped: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = { status: "LULUS" };
    if (sesi && sesi !== "all") {
      const sessionKeyword = sesi.replace("Sesi ", "");
      whereClause.sesiWisuda = {
        contains: sessionKeyword,
        mode: "insensitive",
      };
    }
    const mahasiswaList = await prisma.mahasiswa.findMany({
      where: whereClause,
    });

    let generated = 0;
    let skipped = 0;

    for (const mahasiswa of mahasiswaList) {
      const existing = await prisma.undangan.findFirst({
        where: { mahasiswaId: mahasiswa.id, statusUndangan: "AKTIF" },
      });
      if (existing) { skipped++; continue; }

      await this.generate({
        mahasiswaId: mahasiswa.id,
        tanggalWisuda,
        tempatWisuda,
        kuotaTamu,
      });
      generated++;
    }

    return { generated, skipped };
  }

  /**
   * Delete undangan by ID (hapus kehadiran terkait dulu karena ada FK constraint)
   */
  static async delete(id: string): Promise<void> {
    // Hapus kehadiran yang terkait dengan undangan ini terlebih dahulu
    await prisma.kehadiran.deleteMany({ where: { undanganId: id } });
    // Baru hapus undangan
    await prisma.undangan.delete({ where: { id } });
  }

  /**
   * Delete all undangan (hapus kehadiran terkait dulu karena ada FK constraint)
   */
  static async deleteAll(): Promise<number> {
    // Hapus semua kehadiran yang terkait dengan undangan terlebih dahulu
    await prisma.kehadiran.deleteMany({});
    // Baru hapus semua undangan
    const result = await prisma.undangan.deleteMany({});
    return result.count;
  }
}
