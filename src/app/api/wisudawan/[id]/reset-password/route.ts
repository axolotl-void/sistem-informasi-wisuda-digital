import { NextRequest } from "next/server";
import { WisudawanService } from "@/services/wisudawan.service";
import { resetPasswordSchema } from "@/validations/wisudawan.validation";
import {
  getTokenFromRequest,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/wisudawan/:id/reset-password
 */
export async function POST(request: NextRequest, { params }: Params) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    const result = await WisudawanService.resetPassword(id, parsed.data);
    return apiSuccess(result, "Password berhasil direset");
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal mereset password";
    return apiError(msg, 400);
  }
}
