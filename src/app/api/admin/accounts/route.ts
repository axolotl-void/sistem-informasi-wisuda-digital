import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { AuthService } from "@/services/auth.service";
import { createStaffAccountSchema } from "@/validations/account.validation";

export async function GET(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "SUPER_ADMIN") {
    return forbiddenResponse("Hanya super admin yang dapat mengelola akun admin/pengawas");
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN_FAKULTAS", "PETUGAS_SCAN"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        fakultas: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data akun";
    return apiError(message, 500);
  }
}

export async function POST(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "SUPER_ADMIN") {
    return forbiddenResponse("Hanya super admin yang dapat menambahkan akun");
  }

  try {
    const body = await request.json();
    const parsed = createStaffAccountSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("Email sudah terdaftar", 409);
    }

    const hashedPassword = await AuthService.hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        password: hashedPassword,
        role: parsed.data.role,
        fakultas: parsed.data.fakultas?.trim() || null,
      },
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

    return apiSuccess(user, "Akun berhasil ditambahkan", 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menambahkan akun";
    return apiError(message, 400);
  }
}
