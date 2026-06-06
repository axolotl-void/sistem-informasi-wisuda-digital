import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/utils/token";
import type { LoginCredentials, AuthResponse, User } from "@/types/auth.type";

export class AuthService {
  /**
   * Login dengan email/NIM dan password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email: identifier, password } = credentials;

    const isEmail = identifier.includes("@");
    let user;

    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: identifier.toLowerCase().trim() },
      });
    } else {
      // Cari mahasiswa berdasarkan NIM, lalu dapatkan akun user-nya
      const mahasiswa = await prisma.mahasiswa.findUnique({
        where: { nim: identifier.trim() },
        include: { user: true },
      });
      user = mahasiswa?.user;
    }

    if (!user) {
      throw new Error(isEmail ? "Email atau password salah" : "NIM atau password salah");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error(isEmail ? "Email atau password salah" : "NIM atau password salah");
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role as User["role"],
    });

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 hari

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as User["role"],
        fakultas: user.fakultas ?? undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
      expiresAt,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        fakultas: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      role: user.role as User["role"],
      fakultas: user.fakultas ?? undefined,
    };
  }

  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User tidak ditemukan");

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) throw new Error("Password lama tidak sesuai");

    const hashed = await this.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  }
}
