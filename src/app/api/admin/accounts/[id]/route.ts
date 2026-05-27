import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { AuthService } from "@/services/auth.service";
import { updateStaffAccountSchema } from "@/validations/account.validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "SUPER_ADMIN") {
    return forbiddenResponse("Hanya super admin yang dapat mengubah akun");
  }

  const { id } = await params;

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!target) return apiError("Akun tidak ditemukan", 404);
    if (target.role === "SUPER_ADMIN") {
      return apiError("Akun super admin tidak dapat diubah", 400);
    }

    const body = await request.json();
    const parsed = updateStaffAccountSchema.safeParse(body);
    if (!parsed.success) return apiError("Validasi gagal", 422, parsed.error.flatten());

    const email = parsed.data.email.toLowerCase().trim();
    const duplicate = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
      select: { id: true },
    });
    if (duplicate) return apiError("Email sudah dipakai akun lain", 409);

    const nextPassword = parsed.data.password?.trim();
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        email,
        role: parsed.data.role,
        fakultas: parsed.data.fakultas?.trim() || null,
        ...(nextPassword ? { password: await AuthService.hashPassword(nextPassword) } : {}),
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

    return apiSuccess(updated, "Akun berhasil diperbarui");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengubah akun";
    return apiError(message, 400);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "SUPER_ADMIN") {
    return forbiddenResponse("Hanya super admin yang dapat menghapus akun");
  }

  const { id } = await params;

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!target) return apiError("Akun tidak ditemukan", 404);
    if (target.role === "SUPER_ADMIN") {
      return apiError("Akun super admin tidak dapat dihapus", 400);
    }
    if (target.id === payload.sub) {
      return apiError("Tidak dapat menghapus akun sendiri", 400);
    }

    await prisma.user.delete({ where: { id } });
    return apiSuccess({ id }, "Akun berhasil dihapus");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus akun";
    return apiError(message, 400);
  }
}
