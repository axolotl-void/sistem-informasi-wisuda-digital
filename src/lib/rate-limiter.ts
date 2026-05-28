import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class InMemoryRateLimiter {
  private static store = new Map<string, RateLimitRecord>();

  /**
   * Cek apakah key melampaui batas request dan naikkan counter jika diizinkan.
   */
  static check(
    key: string,
    limit: number,
    windowMs: number
  ): {
    success: boolean;
    remaining: number;
    resetTime: number;
    count: number;
  } {
    const now = Date.now();
    let record = this.store.get(key);

    // Reset jika window waktu sudah lewat
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      this.store.set(key, record);
    }

    if (record.count >= limit) {
      return {
        success: false,
        remaining: 0,
        resetTime: record.resetTime,
        count: record.count,
      };
    }

    record.count += 1;
    this.store.set(key, record);

    return {
      success: true,
      remaining: limit - record.count,
      resetTime: record.resetTime,
      count: record.count,
    };
  }

  /**
   * Cek apakah key saat ini terblokir (tanpa menaikkan counter).
   * Berguna untuk pengecekan login lockout sebelum melakukan upaya autentikasi.
   */
  static isBlocked(
    key: string,
    limit: number
  ): { blocked: boolean; resetTime: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (record && now < record.resetTime && record.count >= limit) {
      return { blocked: true, resetTime: record.resetTime };
    }

    // Jika record kadaluarsa, hapus dari memori
    if (record && now > record.resetTime) {
      this.store.delete(key);
    }

    return { blocked: false, resetTime: 0 };
  }

  /**
   * Naikkan counter kegagalan secara manual.
   */
  static increment(key: string, windowMs: number): void {
    const now = Date.now();
    let record = this.store.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    record.count += 1;
    this.store.set(key, record);
  }

  /**
   * Reset rate limit untuk key tertentu (misal setelah sukses login).
   */
  static reset(key: string): void {
    this.store.delete(key);
  }
}

/**
 * Mendapatkan IP klien secara aman dari HTTP headers
 */
export function getClientIp(request: NextRequest): string {
  if ((request as any).ip) return (request as any).ip;

  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    return ips[0];
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  return "127.0.0.1";
}
