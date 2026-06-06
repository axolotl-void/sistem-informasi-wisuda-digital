import { z } from "zod";
import { sanitizeString } from "@/utils/sanitize";

// --- Create Account ----------------------------------------------------------

export const createWisudawanSchema = z.object({
  nama: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .transform(sanitizeString),
  nim: z
    .string()
    .min(8, "NIM minimal 8 karakter")
    .max(20, "NIM maksimal 20 karakter")
    .transform(sanitizeString),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal(""))
    .nullable(),
  password: z
    .string()
    .max(64, "Password maksimal 64 karakter")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val))
    .refine((val) => !val || val.length >= 8, {
      message: "Password minimal 8 karakter",
    }),
  fakultas: z
    .string()
    .min(2, "Fakultas wajib diisi")
    .transform(sanitizeString),
  prodi: z
    .string()
    .min(2, "Program studi wajib diisi")
    .transform(sanitizeString),
  angkatan: z
    .number()
    .int()
    .min(2000, "Tahun angkatan tidak valid")
    .max(2100, "Tahun angkatan tidak valid"),
  sesiWisuda: z.string().optional().nullable(),
  gate: z.string().optional().nullable(),
  ukuranToga: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]).optional().nullable(),
  nomorUrut: z.number().int().optional().nullable(),
  isCumlaude: z.boolean().optional().nullable(),
  tahunLulus: z.number().int().min(1900).max(2100).optional().nullable(),
  ipk: z.number().min(0).max(4).optional().nullable(),
  tanggalLulus: z.string().optional().nullable(),
});

export type CreateWisudawanInput = z.infer<typeof createWisudawanSchema>;

// --- Update Account ----------------------------------------------------------

export const updateWisudawanSchema = z.object({
  nim: z
    .string()
    .min(8, "NIM minimal 8 karakter")
    .max(20, "NIM maksimal 20 karakter")
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
  nama: z
    .string()
    .min(2)
    .max(100)
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
  email: z.string().email().optional(),
  password: z.string().min(8).max(64).optional(), // kosong = tidak diubah
  fakultas: z
    .string()
    .min(2)
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
  prodi: z
    .string()
    .min(2)
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
  angkatan: z.number().int().min(2000).max(2100).optional(),
  status: z.enum(["AKTIF", "LULUS", "CUTI", "DROPOUT"]).optional(),
  foto: z.string().url().optional().nullable(),
  sesiWisuda: z.string().optional().nullable(),
  gate: z.string().optional().nullable(),
  ukuranToga: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]).optional().nullable(),
  nomorUrut: z.number().int().optional().nullable(),
  isCumlaude: z.boolean().optional().nullable(),
  tahunLulus: z.number().int().min(1900).max(2100).optional().nullable(),
  ipk: z.number().min(0).max(4).optional().nullable(),
  tanggalLulus: z.string().optional().nullable(),
});

export type UpdateWisudawanInput = z.infer<typeof updateWisudawanSchema>;

// --- Reset Password ----------------------------------------------------------

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(64, "Password maksimal 64 karakter")
    .optional(),
  autoGenerate: z.boolean().optional().default(true),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// --- Verify Account ----------------------------------------------------------

export const verifyAccountSchema = z.object({
  action: z.enum(["approve", "reject", "revision"], {
    error: "Action wajib diisi",
  }),
  note: z
    .string()
    .max(500)
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
});

export type VerifyAccountInput = z.infer<typeof verifyAccountSchema>;
