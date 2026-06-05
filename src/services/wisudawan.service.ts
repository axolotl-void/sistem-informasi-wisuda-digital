import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { randomString } from "@/lib/utils";
import type { StatusMahasiswa } from "@prisma/client";
import type {
  CreateWisudawanInput,
  UpdateWisudawanInput,
  ResetPasswordInput,
  VerifyAccountInput,
} from "@/validations/wisudawan.validation";

// --- Types --------------------------------------------------------------------

export interface WisudawanRow {
  id: string;
  nim: string;
  nama: string;
  email: string;
  fakultas: string;
  prodi: string;
  angkatan: number;
  status: string;
  foto: string | null;
  userId: string;
  userName: string;
  password?: string;
  isFirstLogin: boolean;
  hasUndangan: boolean;
  undanganId: string | null;
  undanganKode: string | null;
  undanganStatus: string | null;
  sesiWisuda: string | null;
  gate: string | null;
  kehadiranStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WisudawanFilter {
  search?: string;
  fakultas?: string;
  prodi?: string;
  status?: string;
  session?: string;
}

export interface WisudawanPagination {
  data: WisudawanRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Service ------------------------------------------------------------------

export class WisudawanService {
  /**
   * Get all wisudawan with filters and pagination
   */
  static async getAll(
    filter: WisudawanFilter = {},
    page = 1,
    limit = 10,
  ): Promise<WisudawanPagination> {
    const where: Record<string, unknown> = {};

    if (filter.search) {
      where.OR = [
        { nama: { contains: filter.search, mode: "insensitive" } },
        { nim: { contains: filter.search, mode: "insensitive" } },
        { email: { contains: filter.search, mode: "insensitive" } },
      ];
    }
    if (filter.fakultas) where.fakultas = filter.fakultas;
    if (filter.prodi) where.prodi = filter.prodi;
    if (filter.status) where.status = filter.status;

    const [rawData, total] = await Promise.all([
      prisma.mahasiswa.findMany({
        where,
        include: {
          user: { select: { name: true, id: true } },
          undangan: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { id: true, kode: true, statusUndangan: true, tempatWisuda: true },
          },
          kehadiran: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { statusKehadiran: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.mahasiswa.count({ where }),
    ]);

    const data: WisudawanRow[] = rawData.map((m) => ({
      id: m.id,
      nim: m.nim,
      nama: m.nama,
      email: m.email,
      fakultas: m.fakultas,
      prodi: m.prodi,
      angkatan: m.angkatan,
      status: m.status,
      foto: m.foto,
      userId: m.userId,
      userName: m.user.name,
      isFirstLogin: true, // determined by checking login history in production
      hasUndangan: m.undangan.length > 0,
      undanganId: m.undangan[0]?.id ?? null,
      undanganKode: m.undangan[0]?.kode ?? null,
      undanganStatus: m.undangan[0]?.statusUndangan ?? null,
      sesiWisuda: m.sesiWisuda ?? null,
      gate: m.gate ?? null,
      kehadiranStatus: m.kehadiran[0]?.statusKehadiran ?? null,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single wisudawan by ID
   */
  static async getById(id: string): Promise<WisudawanRow | null> {
    const m = await prisma.mahasiswa.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, id: true, password: true } },
        undangan: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { id: true, kode: true, statusUndangan: true, tempatWisuda: true },
        },
        kehadiran: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { statusKehadiran: true },
        },
      },
    });
    if (!m) return null;

    return {
      id: m.id,
      nim: m.nim,
      nama: m.nama,
      email: m.email,
      fakultas: m.fakultas,
      prodi: m.prodi,
      angkatan: m.angkatan,
      status: m.status,
      foto: m.foto,
      userId: m.userId,
      userName: m.user.name,
      password: m.user.password,
      isFirstLogin: true,
      hasUndangan: m.undangan.length > 0,
      undanganId: m.undangan[0]?.id ?? null,
      undanganKode: m.undangan[0]?.kode ?? null,
      undanganStatus: m.undangan[0]?.statusUndangan ?? null,
      sesiWisuda: m.sesiWisuda ?? null,
      gate: m.gate ?? null,
      kehadiranStatus: m.kehadiran[0]?.statusKehadiran ?? null,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  /**
   * Create wisudawan + user account
   */
  static async create(input: CreateWisudawanInput): Promise<WisudawanRow> {
    // Check duplicate NIM
    const existing = await prisma.mahasiswa.findUnique({
      where: { nim: input.nim },
    });
    if (existing) throw new Error(`NIM ${input.nim} sudah terdaftar`);

    // Check duplicate email
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingEmail) throw new Error(`Email ${input.email} sudah digunakan`);

    const hashedPassword = await bcrypt.hash(input.password, 12);

    // Create user + mahasiswa in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.nama,
          email: input.email,
          password: hashedPassword,
          role: "MAHASISWA",
          fakultas: input.fakultas,
        },
      });

      const mahasiswa = await tx.mahasiswa.create({
        data: {
          nim: input.nim,
          nama: input.nama,
          email: input.email,
          fakultas: input.fakultas,
          prodi: input.prodi,
          angkatan: input.angkatan,
          userId: user.id,
          status: "AKTIF",
          sesiWisuda: input.sesiWisuda ?? null,
          gate: input.gate ?? null,
        },
      });

      return { mahasiswa, user };
    });

    return {
      id: result.mahasiswa.id,
      nim: result.mahasiswa.nim,
      nama: result.mahasiswa.nama,
      email: result.mahasiswa.email,
      fakultas: result.mahasiswa.fakultas,
      prodi: result.mahasiswa.prodi,
      angkatan: result.mahasiswa.angkatan,
      status: result.mahasiswa.status,
      foto: result.mahasiswa.foto,
      userId: result.user.id,
      userName: result.user.name,
      password: result.user.password,
      isFirstLogin: true,
      hasUndangan: false,
      undanganId: null,
      undanganKode: null,
      undanganStatus: null,
      sesiWisuda: result.mahasiswa.sesiWisuda ?? null,
      gate: result.mahasiswa.gate ?? null,
      kehadiranStatus: null,
      createdAt: result.mahasiswa.createdAt,
      updatedAt: result.mahasiswa.updatedAt,
    };
  }

  /**
   * Update wisudawan
   */
  static async update(id: string, input: UpdateWisudawanInput): Promise<WisudawanRow> {
    const m = await prisma.mahasiswa.findUnique({ where: { id } });
    if (!m) throw new Error("Wisudawan tidak ditemukan");

    // Cek duplikat NIM jika berubah
    if (input.nim && input.nim !== m.nim) {
      const nimTaken = await prisma.mahasiswa.findFirst({
        where: { nim: input.nim, NOT: { id } },
      });
      if (nimTaken) throw new Error(`NIM ${input.nim} sudah digunakan`);
    }

    // Hash password jika disertakan
    if (input.password) {
      const hashed = await bcrypt.hash(input.password, 12);
      await prisma.user.update({
        where: { id: m.userId },
        data: { password: hashed },
      });
    }

    // Update email di User juga jika berubah
    if (input.email && input.email !== m.email) {
      const emailTaken = await prisma.user.findFirst({
        where: { email: input.email, NOT: { id: m.userId } },
      });
      if (emailTaken) throw new Error(`Email ${input.email} sudah digunakan`);
      await prisma.user.update({
        where: { id: m.userId },
        data: { email: input.email },
      });
    }

    // Bangun data update — gunakan !== undefined agar nilai falsy tetap tersimpan
    const updateData: Record<string, unknown> = {};
    if (input.nim      !== undefined) updateData.nim      = input.nim;
    if (input.nama     !== undefined) updateData.nama     = input.nama;
    if (input.email    !== undefined) updateData.email    = input.email;
    if (input.fakultas !== undefined) updateData.fakultas = input.fakultas;
    if (input.prodi    !== undefined) updateData.prodi    = input.prodi;
    if (input.angkatan !== undefined) updateData.angkatan = input.angkatan;
    if (input.status   !== undefined) updateData.status   = input.status;
    if (input.foto     !== undefined) updateData.foto     = input.foto;
    // sesiWisuda disimpan langsung di tabel mahasiswa
    if (input.sesiWisuda !== undefined) updateData.sesiWisuda = input.sesiWisuda;
    if (input.gate       !== undefined) updateData.gate       = input.gate;

    const mahasiswa = await prisma.mahasiswa.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { name: true, id: true, password: true } },
        undangan: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { id: true, kode: true, statusUndangan: true, tempatWisuda: true },
        },
        kehadiran: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { statusKehadiran: true },
        },
      },
    });

    return {
      id: mahasiswa.id,
      nim: mahasiswa.nim,
      nama: mahasiswa.nama,
      email: mahasiswa.email,
      fakultas: mahasiswa.fakultas,
      prodi: mahasiswa.prodi,
      angkatan: mahasiswa.angkatan,
      status: mahasiswa.status,
      foto: mahasiswa.foto,
      userId: mahasiswa.userId,
      userName: mahasiswa.user.name,
      password: mahasiswa.user.password,
      isFirstLogin: true,
      hasUndangan: mahasiswa.undangan.length > 0,
      undanganId: mahasiswa.undangan[0]?.id ?? null,
      undanganKode: mahasiswa.undangan[0]?.kode ?? null,
      undanganStatus: mahasiswa.undangan[0]?.statusUndangan ?? null,
      sesiWisuda: mahasiswa.sesiWisuda ?? null,
      gate: mahasiswa.gate ?? null,
      kehadiranStatus: mahasiswa.kehadiran[0]?.statusKehadiran ?? null,
      createdAt: mahasiswa.createdAt,
      updatedAt: mahasiswa.updatedAt,
    };
  }

  /**
   * Delete wisudawan (cascade deletes user)
   */
  static async delete(id: string): Promise<void> {
    const m = await prisma.mahasiswa.findUnique({ where: { id } });
    if (!m) throw new Error("Wisudawan tidak ditemukan");
    // Cascade from User will delete Mahasiswa
    await prisma.user.delete({ where: { id: m.userId } });
  }

  /**
   * Reset password — returns the new password in plaintext for admin to share
   */
  static async resetPassword(
    id: string,
    input: ResetPasswordInput,
  ): Promise<{ newPassword: string }> {
    const m = await prisma.mahasiswa.findUnique({ where: { id } });
    if (!m) throw new Error("Wisudawan tidak ditemukan");

    const newPassword = input.autoGenerate
      ? randomString(10)
      : input.newPassword ?? randomString(10);

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: m.userId },
      data: { password: hashed },
    });

    return { newPassword };
  }

  /**
   * Verify account — approve / reject / request revision
   */
  static async verify(
    id: string,
    input: VerifyAccountInput,
  ): Promise<{ status: string }> {
    const m = await prisma.mahasiswa.findUnique({ where: { id } });
    if (!m) throw new Error("Wisudawan tidak ditemukan");

    const statusMap: Record<string, StatusMahasiswa> = {
      approve: "LULUS",
      reject: "DROPOUT",
      revision: "AKTIF",
    };
    const newStatus = statusMap[input.action] ?? "AKTIF";

    await prisma.mahasiswa.update({
      where: { id },
      data: { status: newStatus },
    });

    return { status: newStatus };
  }

  /**
   * Generate invitation for a verified wisudawan
   */
  static async generateInvitation(id: string): Promise<{ kode: string; qrToken: string }> {
    const m = await prisma.mahasiswa.findUnique({
      where: { id },
      include: { undangan: { where: { statusUndangan: "AKTIF" } } },
    });
    if (!m) throw new Error("Wisudawan tidak ditemukan");
    if (m.undangan.length > 0) throw new Error("Undangan sudah ada");

    const kode = `INV-${new Date().getFullYear()}-${randomString(6)}`;
    const qrToken = `QR-${randomString(16)}`;

    await prisma.undangan.create({
      data: {
        kode,
        qrToken,
        statusUndangan: "AKTIF",
        tanggalWisuda: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        tempatWisuda: "Auditorium Utama",
        mahasiswaId: id,
      },
    });

    return { kode, qrToken };
  }

  /**
   * Delete all wisudawan accounts (and their related user, undangan, and kehadiran records)
   */
  static async deleteAll(): Promise<number> {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Hapus semua kehadiran terlebih dahulu
      await tx.kehadiran.deleteMany({});
      
      // 2. Hapus semua undangan
      await tx.undangan.deleteMany({});
      
      // 3. Ambil semua mahasiswa untuk mendapatkan userId mereka
      const mahasiswaList = await tx.mahasiswa.findMany({
        select: { userId: true },
      });
      const userIds = mahasiswaList.map((m) => m.userId);
      
      // 4. Hapus semua mahasiswa
      await tx.mahasiswa.deleteMany({});
      
      // 5. Hapus semua user dengan role MAHASISWA atau yang ID-nya ada di userIds
      const deleteResult = await tx.user.deleteMany({
        where: {
          OR: [
            { role: "MAHASISWA" },
            { id: { in: userIds } },
          ],
        },
      });
      
      return deleteResult.count;
    });
    
    return result;
  }

  /**
   * Get stats for dashboard cards
   */
  static async getStats() {
    const [total, aktif, lulus, dropout] = await Promise.all([
      prisma.mahasiswa.count(),
      prisma.mahasiswa.count({ where: { status: "AKTIF" } }),
      prisma.mahasiswa.count({ where: { status: "LULUS" } }),
      prisma.mahasiswa.count({ where: { status: "DROPOUT" } }),
    ]);
    const withUndangan = await prisma.undangan.count({ where: { statusUndangan: "AKTIF" } });
    const hadir = await prisma.kehadiran.count({ where: { statusKehadiran: "HADIR" } });

    return { total, aktif, lulus, dropout, withUndangan, hadir };
  }
}
