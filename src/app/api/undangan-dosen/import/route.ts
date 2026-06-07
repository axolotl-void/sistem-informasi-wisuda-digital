import { NextRequest } from "next/server";
import { z } from "zod";
import { UndanganDosenService } from "@/services/undangan-dosen.service";
import {
  getTokenFromRequest,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

const rowSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter").max(100),
  jabatan: z.string().min(2, "Jabatan wajib diisi").max(100),
  nidn: z.string().optional().or(z.literal("")),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  noWa: z.string().optional().or(z.literal("")),
});

type ImportRow = z.infer<typeof rowSchema>;

/**
 * POST /api/undangan-dosen/import — Import lecturer invitations from Excel json data
 */
export async function POST(request: NextRequest) {
  const payload = await getTokenFromRequest(request);
  if (!payload) return unauthorizedResponse();
  if (!["SUPER_ADMIN", "ADMIN_FAKULTAS"].includes(payload.role)) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json();

    if (!Array.isArray(body) || body.length === 0) {
      return apiError("Body harus berupa array data dosen yang tidak kosong", 422);
    }
    if (body.length > 1000) {
      return apiError("Maksimal 1000 baris per sekali import", 422);
    }

    const valid: ImportRow[] = [];
    const validationErrors: string[] = [];

    for (let i = 0; i < body.length; i++) {
      const result = rowSchema.safeParse(body[i]);
      if (result.success) {
        valid.push(result.data);
      } else {
        const msg = result.error.issues.map((issue) => issue.message).join(", ");
        validationErrors.push(`Baris ${i + 2}: ${msg}`);
      }
    }

    if (valid.length === 0) {
      return apiError("Tidak ada data valid untuk diimport", 422, {
        errors: validationErrors,
      });
    }

    const result = await UndanganDosenService.importExcel(valid);

    return apiSuccess(
      {
        created: result.created,
        skipped: result.skipped,
        skippedDuplicate: result.skipped, // Mapped for stats comparison
        skippedError: 0,
        skippedLogs: result.skippedLogs.length > 0 ? result.skippedLogs : undefined,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      },
      `Import selesai: ${result.created} ditambahkan, ${result.skipped} dilewati`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal import data";
    return apiError(message, 500);
  }
}
