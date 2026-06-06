import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";

// --- Schema validasi per-baris ------------------------------------------------

const rowSchema = z.object({
  nomorUrut: z.coerce.number().int().min(1, "Nomor urut tidak valid").optional().nullable(),
  isCumlaude: z.boolean().optional().nullable(),
  nim:      z.string().min(1, "NIM wajib diisi").max(20),
  nama:     z.string().min(2, "Nama minimal 2 karakter").max(100),
  email:    z.string().email("Format email tidak valid").optional().or(z.literal("")).nullable(),
  fakultas: z.string().min(2, "Fakultas wajib diisi"),
  prodi:    z.string().min(2, "Prodi wajib diisi"),
  angkatan: z.coerce.number().int().min(2000, "Angkatan tidak valid").max(2100, "Angkatan tidak valid"),
  tahunLulus: z.coerce.number().int().min(1900, "Tahun lulus tidak valid").max(2100, "Tahun lulus tidak valid").optional().nullable(),
  ipk:      z.coerce.number().min(0, "IPK tidak boleh negatif").max(4, "IPK maksimal 4").optional().nullable(),
  tanggalLulus: z.string().optional().nullable(),
});

type ImportRow = z.infer<typeof rowSchema>;

function parseDateString(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    if (y > 1000 && m >= 0 && m < 12 && d > 0 && d <= 31) {
      const customDate = new Date(y, m, d);
      if (!isNaN(customDate.getTime())) {
        return customDate;
      }
    }
  }
  return null;
}

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

  const sp = request.nextUrl.searchParams;
  const isCumlaudeImport = sp.get("cumlaude") === "true";

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
        const rawRow = body[i] as Record<string, unknown> | undefined;
        const nimStr = rawRow?.nim ? `NIM ${rawRow.nim}` : "NIM kosong";
        const namaStr = rawRow?.nama ? `(${rawRow.nama})` : "(Nama kosong)";
        validationErrors.push(`Baris ${i + 2}: ${nimStr} ${namaStr} - ${msg}`); // +2 = header di baris 1
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
      const email = row.email && row.email.trim() ? row.email.trim().toLowerCase() : `${nim}@temp-wisuda.id`;

      let isDuplicate = false;
      if (seenNimsInFile.has(nim)) {
        skippedLogs.push(`NIM Duplikat dalam file Excel: NIM ${nim} (${row.nama})`);
        isDuplicate = true;
      }
      if (seenEmailsInFile.has(email)) {
        skippedLogs.push(`Email Duplikat dalam file Excel: Email ${email} (${row.nama})`);
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
    const incomingEmails = uniqueIncoming.map((r) => r.email as string);

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
      const email = row.email as string;

      if (existingNims.has(nim)) {
        skippedLogs.push(`NIM sudah terdaftar di database: NIM ${nim} (${row.nama})`);
        skippedDuplicateDB++;
      } else if (existingEmails.has(email)) {
        skippedLogs.push(`Email sudah terdaftar di database: Email ${email} (${row.nama})`);
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
                  email:    row.email as string,
                  password: row.hashedPassword,
                  role:     "MAHASISWA",
                  fakultas: row.fakultas,
                },
              });

              await tx.mahasiswa.create({
                data: {
                  nomorUrut: row.nomorUrut ?? null,
                  isCumlaude: isCumlaudeImport || row.isCumlaude || false,
                  nim:      row.nim,
                  nama:     row.nama,
                  email:    row.email as string,
                  fakultas: row.fakultas,
                  prodi:    row.prodi,
                  angkatan: row.angkatan,
                  status:   "AKTIF",
                  userId:   user.id,
                  tahunLulus: row.tahunLulus ?? null,
                  ipk:      row.ipk ?? null,
                  tanggalLulus: row.tanggalLulus ? parseDateString(row.tanggalLulus) : null,
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
