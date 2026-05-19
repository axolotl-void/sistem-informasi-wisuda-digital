import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes dengan clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * API response helper — success
 */
export function apiSuccess<T>(data: T, message = "Success", status = 200) {
  return Response.json({ success: true, message, data }, { status });
}

/**
 * API response helper — error
 */
export function apiError(message: string, status = 400, errors?: unknown) {
  return Response.json({ success: false, message, errors }, { status });
}

/**
 * Sleep utility untuk testing/delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * Generate random string
 */
export function randomString(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();
}
