import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

// --- Schema validasi per-baris ------------------------------------------------

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

    // -- 1. Validasi schema tiap baris -----------------------------------------
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

    // -- 2. Filter duplikat di dalam file Excel itu sendiri (internal deduplication) --
    const uniqueIncoming: ImportRow[] = [];
    const seenNimsInFile = new Set<string>();
    const seenEmailsInFile = new Set<string>();
    const skippedLogs: string[] = [];
    let skippedDuplicateFile = 0;

    for (const row of valid) {
      const nim = row.nim.trim();
      const email = row.email.trim().toLowerCase();

      let isDuplicate = false;
      if (seenNimsInFile.has(nim)) {
        skippedLogs.push(`NIM Duplikat dalam file Excel: NIM ${nim} (${row.nama})`);
        isDuplicate = true;
      }
      if (seenEmailsInFile.has(email)) {
        skippedLogs.push(`Email Duplikat dalam file Excel: Email ${row.email} (${row.nama})`);
        isDuplicate = true;
      }

      if (isDuplicate) {
        skippedDuplicateFile++;
      } else {
        seenNimsInFile.add(nim);
        seenEmailsInFile.add(email);
        uniqueIncoming.push({
          ...row,
          nim,
          email,
        });
      }
    }

    // -- 3. Cek duplikat terhadap database (batch query) -------------------
    const incomingNims   = uniqueIncoming.map((r) => r.nim);
    const incomingEmails = uniqueIncoming.map((r) => r.email);

    const [existingByNim, existingByEmail] = await Promise.all([
      prisma.mahasiswa.findMany({
        where: { nim: { in: incomingNims } },
        select: { nim: true, nama: true },
      }),
      prisma.user.findMany({
        where: { email: { in: incomingEmails } },
        select: { email: true, name: true },
      }),
    ]);

    const existingNims   = new Set(existingByNim.map((m) => m.nim));
    const existingEmails = new Set(existingByEmail.map((u) => u.email.toLowerCase()));

    const toInsert: ImportRow[] = [];
    let skippedDuplicateDB = 0;

    for (const row of uniqueIncoming) {
      const nim = row.nim;
      const email = row.email;

      if (existingNims.has(nim)) {
        skippedLogs.push(`NIM sudah terdaftar di database: NIM ${nim} (${row.nama})`);
        skippedDuplicateDB++;
      } else if (existingEmails.has(email)) {
        skippedLogs.push(`Email sudah terdaftar di database: Email ${row.email} (${row.nama})`);
        skippedDuplicateDB++;
      } else {
        toInsert.push(row);
      }
    }

    // -- 4. Hashing password secara cepat (rounds = 6) -------------------------
    // Gunakan salt rounds 6 karena default password adalah NIM yang sementara dan akan diubah mahasiswa.
    // Ini menghemat waktu proses hashing CPU-bound dari ~50 detik menjadi ~1.5 detik untuk 700 akun.
    const toInsertWithHash = await Promise.all(
      toInsert.map(async (row) => {
        const hashedPassword = await bcrypt.hash(row.nim, 6);
        return { ...row, hashedPassword };
      })
    );

    // -- 5. Insert ke database secara batch (chunked concurrency) --------------
    let created = 0;
    let skippedError = 0;
    const chunkSize = 50;

    for (let i = 0; i < toInsertWithHash.length; i += chunkSize) {
      const chunk = toInsertWithHash.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (row) => {
          try {
            await prisma.$transaction(async (tx) => {
              const user = await tx.user.create({
                data: {
                  name:     row.nama,
                  email:    row.email,
                  password: row.hashedPassword,
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
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Error tidak diketahui";
            skippedLogs.push(`Gagal memproses NIM ${row.nim} (${row.nama}): ${errMsg}`);
            skippedError++;
          }
        })
      );
    }

    const totalSkipped = skippedDuplicateFile + skippedDuplicateDB + skippedError;

    return apiSuccess(
      {
        created,
        skipped:          totalSkipped,
        skippedDuplicate: skippedDuplicateFile + skippedDuplicateDB,
        skippedError,
        skippedLogs:      skippedLogs.length > 0 ? skippedLogs : undefined,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      },
      `Import selesai: ${created} ditambahkan, ${totalSkipped} dilewati`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal import data";
    return apiError(message, 500);
  }
}
