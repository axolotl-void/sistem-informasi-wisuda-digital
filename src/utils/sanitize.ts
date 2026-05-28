/**
 * Membersihkan string dari potensi injeksi script berbahaya (XSS)
 * Menghapus tag <script>, event handler inline (onload, onerror, dll), dan javascript: URIs.
 */
export function sanitizeString(val: string): string {
  if (typeof val !== "string") return val;

  return val
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "") // Hapus tag <script>...</script>
    .replace(/<[^>]*>/g, "") // Hapus semua tag HTML lainnya
    .replace(/javascript:/gi, "") // Blokir skema URI javascript:
    .replace(/on\w+\s*=/gi, "") // Hapus attribute event handler inline (onload, onerror, onclick, dll)
    .trim();
}
