import { NextRequest } from "next/server";
import { z } from "zod";
import { AuthService } from "@/services/auth.service";
import { apiSuccess, apiError } from "@/lib/utils";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validasi gagal", 422, parsed.error.flatten());
    }

    const result = await AuthService.login(parsed.data);

    const response = apiSuccess(result, "Login berhasil");

    // Set HTTP-only cookie
    const cookieResponse = new Response(response.body, response);
    cookieResponse.headers.set(
      "Set-Cookie",
      `${AUTH_COOKIE_NAME}=${result.token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
    );

    return cookieResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login gagal";
    return apiError(message, 401);
  }
}
