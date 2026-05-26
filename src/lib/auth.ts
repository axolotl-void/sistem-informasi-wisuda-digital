import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, extractBearerToken } from "@/utils/token";
import type { JwtPayload, UserRole } from "@/types/auth.type";
import { ROUTES } from "@/utils/constants";

export const AUTH_COOKIE_NAME = "wisuda_token";

/**
 * Ambil session dari cookie (Server Component / Route Handler)
 */
export async function getServerSession(): Promise<JwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Require auth — redirect ke login jika tidak ada session
 */
export async function requireAuth(): Promise<JwtPayload> {
  const session = await getServerSession();
  if (!session) redirect(ROUTES.LOGIN);
  return session;
}

/**
 * Require role tertentu — redirect jika role tidak sesuai
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<JwtPayload> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    redirect(ROUTES.HOME);
  }
  return session;
}

/**
 * Ambil token dari request header atau cookie (API Route)
 * Mendukung dua cara: Authorization Bearer header (untuk mobile/IP access)
 * dan HTTP-only cookie (untuk desktop/localhost)
 */
export async function getTokenFromRequest(request: Request): Promise<JwtPayload | null> {
  try {
    // 1. Coba dari Authorization header dulu (mobile via IP, atau explicit token)
    const authHeader = request.headers.get("Authorization");
    const bearerToken = extractBearerToken(authHeader);
    if (bearerToken) {
      try {
        return verifyToken(bearerToken);
      } catch {
        // Bearer kadaluarsa/invalid — lanjut cek cookie (hindari loop redirect di mobile)
      }
    }

    // 2. Fallback ke cookie (desktop/localhost)
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (cookieToken) {
      return verifyToken(cookieToken);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Unauthorized response helper
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return Response.json({ success: false, message }, { status: 401 });
}

/**
 * Forbidden response helper
 */
export function forbiddenResponse(message = "Forbidden") {
  return Response.json({ success: false, message }, { status: 403 });
}
