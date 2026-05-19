import { z } from "zod";

// ─── Create Account ──────────────────────────────────────────────────────────

export const createWisudawanSchema = z.object({
  nama: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  nim: z
    .string()
    .min(8, "NIM minimal 8 karakter")
    .max(20, "NIM maksimal 20 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(64, "Password maksimal 64 karakter"),
  fakultas: z.string().min(2, "Fakultas wajib diisi"),
  prodi: z.string().min(2, "Program studi wajib diisi"),
  angkatan: z
    .number()
    .int()
    .min(2000, "Tahun angkatan tidak valid")
    .max(2100, "Tahun angkatan tidak valid"),
});

export type CreateWisudawanInput = z.infer<typeof createWisudawanSchema>;

// ─── Update Account ──────────────────────────────────────────────────────────

export const updateWisudawanSchema = z.object({
  nama: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  fakultas: z.string().min(2).optional(),
  prodi: z.string().min(2).optional(),
  angkatan: z.number().int().min(2000).max(2100).optional(),
  status: z.enum(["AKTIF", "LULUS", "CUTI", "DROPOUT"]).optional(),
  foto: z.string().url().optional().nullable(),
});

export type UpdateWisudawanInput = z.infer<typeof updateWisudawanSchema>;

// ─── Reset Password ──────────────────────────────────────────────────────────

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(64, "Password maksimal 64 karakter")
    .optional(),
  autoGenerate: z.boolean().optional().default(true),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─── Verify Account ──────────────────────────────────────────────────────────

export const verifyAccountSchema = z.object({
  action: z.enum(["approve", "reject", "revision"], {
    error: "Action wajib diisi",
  }),
  note: z.string().max(500).optional(),
});

export type VerifyAccountInput = z.infer<typeof verifyAccountSchema>;
