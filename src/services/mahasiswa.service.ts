import prisma from "@/lib/prisma";
import type {
  Mahasiswa,
  CreateMahasiswaDto,
  UpdateMahasiswaDto,
  MahasiswaFilter,
  MahasiswaPagination,
} from "@/types/mahasiswa.type";

export class MahasiswaService {
  /**
   * Get semua mahasiswa dengan filter dan pagination
   */
  static async getAll(
    filter: MahasiswaFilter = {},
    page = 1,
    limit = 10
  ): Promise<MahasiswaPagination> {
    const where = {
      ...(filter.fakultas && { fakultas: filter.fakultas }),
      ...(filter.prodi && { prodi: filter.prodi }),
      ...(filter.angkatan && { angkatan: filter.angkatan }),
      ...(filter.status && { status: filter.status }),
      ...(filter.search && {
        OR: [
          { nama: { contains: filter.search, mode: "insensitive" as const } },
          { nim: { contains: filter.search, mode: "insensitive" as const } },
          { email: { contains: filter.search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.mahasiswa.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.mahasiswa.count({ where }),
    ]);

    return {
      data: data as unknown as Mahasiswa[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get mahasiswa by ID
   */
  static async getById(id: string): Promise<Mahasiswa | null> {
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { id },
    });
    return mahasiswa as unknown as Mahasiswa | null;
  }

  /**
   * Get mahasiswa by NIM
   */
  static async getByNim(nim: string): Promise<Mahasiswa | null> {
    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { nim },
    });
    return mahasiswa as unknown as Mahasiswa | null;
  }

  /**
   * Create mahasiswa baru
   */
  static async create(dto: CreateMahasiswaDto): Promise<Mahasiswa> {
    const existing = await prisma.mahasiswa.findUnique({
      where: { nim: dto.nim },
    });
    if (existing) throw new Error(`NIM ${dto.nim} sudah terdaftar`);

    const mahasiswa = await prisma.mahasiswa.create({
      data: { ...dto, status: "AKTIF" },
    });
    return mahasiswa as unknown as Mahasiswa;
  }

  /**
   * Update mahasiswa
   */
  static async update(id: string, dto: UpdateMahasiswaDto): Promise<Mahasiswa> {
    const mahasiswa = await prisma.mahasiswa.update({
      where: { id },
      data: dto,
    });
    return mahasiswa as unknown as Mahasiswa;
  }

  /**
   * Delete mahasiswa
   */
  static async delete(id: string): Promise<void> {
    await prisma.mahasiswa.delete({ where: { id } });
  }

  /**
   * Bulk import mahasiswa dari CSV/Excel
   */
  static async bulkCreate(data: CreateMahasiswaDto[]): Promise<{ created: number; skipped: number }> {
    let created = 0;
    let skipped = 0;

    for (const dto of data) {
      const existing = await prisma.mahasiswa.findUnique({
        where: { nim: dto.nim },
      });
      if (existing) {
        skipped++;
        continue;
      }
      await prisma.mahasiswa.create({ data: { ...dto, status: "AKTIF" } });
      created++;
    }

    return { created, skipped };
  }
}
