import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Format tanggal ke format Indonesia
 * @example formatDate(new Date()) => "19 Mei 2026"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "-";
  return format(parsed, "dd MMMM yyyy", { locale: id });
}

/**
 * Format tanggal dan waktu ke format Indonesia
 * @example formatDateTime(new Date()) => "19 Mei 2026, 10:30"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "-";
  return format(parsed, "dd MMMM yyyy, HH:mm", { locale: id });
}

/**
 * Format waktu relatif
 * @example formatRelativeTime(new Date()) => "beberapa detik yang lalu"
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "-";
  return formatDistanceToNow(parsed, { addSuffix: true, locale: id });
}

/**
 * Format angka ke format ribuan Indonesia
 * @example formatNumber(1000000) => "1.000.000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

/**
 * Format persentase
 * @example formatPercent(0.75) => "75%"
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Truncate string dengan ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format NIM mahasiswa
 * @example formatNim("12345678") => "1234.5678"
 */
export function formatNim(nim: string): string {
  if (nim.length !== 8) return nim;
  return `${nim.slice(0, 4)}.${nim.slice(4)}`;
}
