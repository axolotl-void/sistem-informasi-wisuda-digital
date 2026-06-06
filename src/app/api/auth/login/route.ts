import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthService } from "@/services/auth.service";
import { apiError } from "@/lib/utils";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { InMemoryRateLimiter, getClientIp } from "@/lib/rate-limiter";

const loginSchema = z.object({
  email: z.string().min(1, "Email atau NIM tidak boleh kosong"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(request: NextRequest) {
  let email: string | undefined;

  try {
    const ip = getClientIp(request);

    // 1. IP Rate Limiting: Maksimal 60 request per 15 menit per IP (mencegah spam DDoS skala kecil)
    const ipLimitKey = `rate:login:ip:${ip}`;
    const ipCheck = InMemoryRateLimiter.check(ipLimitKey, 60, 15 * 60 * 1000);
    if (!ipCheck.success) {
      return apiError("Terlalu banyak percobaan akses dari perangkat Anda. Silakan coba lagi nanti.", 429);
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    const rawId = parsed.data.email.trim();
    email = rawId.includes("@") ? rawId.toLowerCase() : rawId;
    const failedKey = `lockout:login:email:${email}`;

    // 2. Email Lockout: Maksimal 5 kali gagal login per email/NIM dalam 15 menit (mencegah brute-force akun)
    const lockoutCheck = InMemoryRateLimiter.isBlocked(failedKey, 5);
    if (lockoutCheck.blocked) {
      const remainingMinutes = Math.ceil((lockoutCheck.resetTime - Date.now()) / 1000 / 60);
      return apiError(
        `Akun ditangguhkan sementara karena terlalu banyak kegagalan kata sandi. Silakan coba lagi dalam ${remainingMinutes} menit.`,
        429
      );
    }

    const result = await AuthService.login(parsed.data);

    // Login Sukses: Reset counter kegagalan untuk email ini
    InMemoryRateLimiter.reset(failedKey);

    const response = NextResponse.json(
      { success: true, message: "Login berhasil", data: result },
      { status: 200 }
    );
    response.cookies.set(AUTH_COOKIE_NAME, result.token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    // Login Gagal: Naikkan counter kegagalan untuk email ini
    if (email) {
      const failedKey = `lockout:login:email:${email}`;
      InMemoryRateLimiter.increment(failedKey, 15 * 60 * 1000);
    }

    const message = error instanceof Error ? error.message : "Login gagal";
    return apiError(message, 401);
  }
}
