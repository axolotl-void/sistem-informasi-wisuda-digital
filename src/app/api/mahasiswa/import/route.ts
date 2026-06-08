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
  
  // Normalisasi nama bulan bahasa Indonesia ke bahasa Inggris
  let normalized = dateStr.trim().toLowerCase();
  const indonesianMonths: Record<string, string> = {
    januari: "january",
    februari: "february",
    maret: "march",
    april: "april",
    mei: "may",
    juni: "june",
    juli: "july",
    agustus: "august",
    september: "september",
    oktober: "october",
    november: "november",
    desember: "december",
    // Singkatan
    jan: "january",
    feb: "february",
    mar: "march",
    apr: "april",
    jun: "june",
    jul: "july",
    agu: "august",
    sep: "september",
    okt: "october",
    nov: "november",
    des: "december"
  };

  for (const [idMonth, enMonth] of Object.entries(indonesianMonths)) {
    if (normalized.includes(idMonth)) {
      normalized = normalized.replace(idMonth, enMonth);
      break;
    }
  }

  const parsed = new Date(normalized);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Fallback ke pemisah / atau -
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
    const toUpdate: ImportRow[] = [];
    let skippedDuplicateDB = 0;

    for (const row of uniqueIncoming) {
      const nim = row.nim;
      const email = row.email as string;

      if (existingNims.has(nim)) {
        if (isCumlaudeImport) {
          toUpdate.push(row);
        } else {
          skippedLogs.push(`NIM sudah terdaftar di database: NIM ${nim} (${row.nama})`);
          skippedDuplicateDB++;
        }
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

    // -- 4.5. Reset status cumlaude untuk mahasiswa di fakultas terkait jika ini import cumlaude
    if (isCumlaudeImport) {
      const uniqueFaculties = Array.from(
        new Set(
          uniqueIncoming
            .map((r) => r.fakultas?.trim())
            .filter(Boolean)
        )
      );

      const resetWhere: Record<string, any> = {};
      if (payload.role === "ADMIN_FAKULTAS") {
        // Ambil fakultas dari database karena tidak disimpan di JWT payload
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          select: { fakultas: true },
        });
        if (user?.fakultas) {
          resetWhere.fakultas = user.fakultas;
        }
      } else if (uniqueFaculties.length > 0) {
        resetWhere.fakultas = { in: uniqueFaculties };
      }

      await prisma.mahasiswa.updateMany({
        where: resetWhere,
        data: { isCumlaude: false },
      });
    }

    // -- 5. Jalankan update/pemadanan data mahasiswa jika cumlaude -------------
    let updated = 0;
    let skippedError = 0;
    const chunkSize = 50;

    if (toUpdate.length > 0) {
      for (let i = 0; i < toUpdate.length; i += chunkSize) {
        const chunk = toUpdate.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (row) => {
            try {
              // Pemadanan data: Update status isCumlaude, IPK, tahunLulus, dan tanggalLulus
              await prisma.mahasiswa.update({
                where: { nim: row.nim },
                data: {
                  isCumlaude: true, // Otomatis diset true karena ini import khusus cumlaude
                  tahunLulus: row.tahunLulus !== undefined && row.tahunLulus !== null ? row.tahunLulus : undefined,
                  ipk: row.ipk !== undefined && row.ipk !== null ? row.ipk : undefined,
                  tanggalLulus: row.tanggalLulus ? parseDateString(row.tanggalLulus) : undefined,
                },
              });
              updated++;
            } catch (err) {
              const errMsg = err instanceof Error ? err.message : "Error tidak diketahui";
              skippedLogs.push(`Gagal memproses/pemadanan NIM ${row.nim} (${row.nama}): ${errMsg}`);
              skippedError++;
            }
          })
        );
      }
    }

    // -- 6. Insert data baru ke database secara batch (chunked concurrency) --------------
    let created = 0;

    if (toInsertWithHash.length > 0) {
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
    }

    const totalSkipped = skippedDuplicateFile + skippedDuplicateDB + skippedError;

    return apiSuccess(
      {
        created,
        updated,
        skipped:          totalSkipped,
        skippedDuplicate: skippedDuplicateFile + skippedDuplicateDB,
        skippedError,
        skippedLogs:      skippedLogs.length > 0 ? skippedLogs : undefined,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      },
      `Import selesai: ${created} ditambahkan, ${updated} diupdate, ${totalSkipped} dilewati`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal import data";
    return apiError(message, 500);
  }
}
