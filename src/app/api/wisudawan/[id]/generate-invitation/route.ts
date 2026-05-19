import { NextRequest } from "next/server";
import { WisudawanService } from "@/services/wisudawan.service";
import {
  getTokenFromRequest,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/wisudawan/:id/generate-invitation
 */
export async function POST(request: NextRequest, { params }: Params) {
  const payload = getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  const { id } = await params;

  try {
    const result = await WisudawanService.generateInvitation(id);
    return apiSuccess(result, "Undangan berhasil digenerate", 201);
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Gagal generate undangan";
    return apiError(msg, 400);
  }
}
