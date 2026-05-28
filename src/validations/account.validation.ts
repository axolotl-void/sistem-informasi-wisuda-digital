import { z } from "zod";
import { sanitizeString } from "@/utils/sanitize";

export const createStaffAccountSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .transform(sanitizeString),
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(64, "Password maksimal 64 karakter"),
  role: z.enum(["ADMIN_FAKULTAS", "PETUGAS_SCAN"]),
  fakultas: z
    .string()
    .max(120)
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
});

export type CreateStaffAccountInput = z.infer<typeof createStaffAccountSchema>;

export const updateStaffAccountSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .transform(sanitizeString),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["ADMIN_FAKULTAS", "PETUGAS_SCAN"]),
  fakultas: z
    .string()
    .max(120)
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(64, "Password maksimal 64 karakter")
    .optional()
    .or(z.literal("")),
});

export type UpdateStaffAccountInput = z.infer<typeof updateStaffAccountSchema>;
