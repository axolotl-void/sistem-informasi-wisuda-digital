import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

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
