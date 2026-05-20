import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

// ─── Schema validasi per-baris ────────────────────────────────────────────────

const rowSchema = z.object({
  nim:      z.string().min(1, "NIM wajib diisi").max(20),
  nama:     z.string().min(2, "Nama minimal 2 karakter").max(100),
  email:    z.string().email("Format email tidak valid"),
  fakultas: z.string().min(2, "Fakultas wajib diisi"),
  prodi:    z.string().min(2, "Prodi wajib diisi"),
  angkatan: z.coerce.number().int().min(2000, "Angkatan tidak valid").max(2100, "Angkatan tidak valid"),
});

type ImportRow = z.infer<typeof rowSchema>;

/**
 * POST /api/mahasiswa/import
 *
 * Terima array JSON hasil parsing Excel dari client,
 * validasi tiap baris, lalu insert ke database.
 * - NIM duplikat → di-skip
 * - Email duplikat → di-skip
 * - Baris invalid → dikumpulkan di `errors`, tidak menghentikan proses
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
      return apiError("Body harus berupa array data mahasiswa yang tidak kosong", 422);
    }
    if (body.length > 1000) {
      return apiError("Maksimal 1000 baris per sekali import", 422);
    }

    // ── 1. Validasi schema tiap baris ─────────────────────────────────────────
    const valid: ImportRow[] = [];
    const validationErrors: string[] = [];

    for (let i = 0; i < body.length; i++) {
      const result = rowSchema.safeParse(body[i]);
      if (result.success) {
        valid.push(result.data);
      } else {
        const msg = result.error.issues.map((issue) => issue.message).join(", ");
        validationErrors.push(`Baris ${i + 2}: ${msg}`); // +2 = header di baris 1
      }
    }

    if (valid.length === 0) {
      return apiError("Tidak ada data valid untuk diimport", 422, {
        errors: validationErrors,
      });
    }

    // ── 2. Cek duplikat NIM & Email sekaligus (batch query) ───────────────────
    const incomingNims   = valid.map((r) => r.nim);
    const incomingEmails = valid.map((r) => r.email);

    const [existingByNim, existingByEmail] = await Promise.all([
      prisma.mahasiswa.findMany({
        where: { nim: { in: incomingNims } },
        select: { nim: true },
      }),
      prisma.user.findMany({
        where: { email: { in: incomingEmails } },
        select: { email: true },
      }),
    ]);

    const existingNims   = new Set(existingByNim.map((m) => m.nim));
    const existingEmails = new Set(existingByEmail.map((u) => u.email));

    const toInsert = valid.filter(
      (r) => !existingNims.has(r.nim) && !existingEmails.has(r.email)
    );
    const skippedDuplicate = valid.length - toInsert.length;

    // ── 3. Insert ke database ─────────────────────────────────────────────────
    let created = 0;
    let skippedError = 0;

    // Password placeholder — admin wajib reset via fitur Reset Password
    // Hash statis agar tidak perlu bcrypt per-row (lebih cepat untuk bulk)
    const placeholderHash = await bcrypt.hash("ChangeMe123!", 10);

    for (const row of toInsert) {
      try {
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              name:     row.nama,
              email:    row.email,
              password: placeholderHash,
              role:     "MAHASISWA",
              fakultas: row.fakultas,
            },
          });

          await tx.mahasiswa.create({
            data: {
              nim:      row.nim,
              nama:     row.nama,
              email:    row.email,
              fakultas: row.fakultas,
              prodi:    row.prodi,
              angkatan: row.angkatan,
              status:   "AKTIF",
              userId:   user.id,
            },
          });
        });

        created++;
      } catch {
        // Race condition atau constraint lain — skip baris ini
        skippedError++;
      }
    }

    const totalSkipped = skippedDuplicate + skippedError;

    return apiSuccess(
      {
        created,
        skipped:          totalSkipped,
        skippedDuplicate,
        skippedError,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      },
      `Import selesai: ${created} ditambahkan, ${totalSkipped} dilewati`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal import data";
    return apiError(message, 500);
  }
}
