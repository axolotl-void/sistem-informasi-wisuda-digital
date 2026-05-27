import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/utils/token";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import type { UserRole } from "@/types/auth.type";

// Route yang tidak perlu auth
const PUBLIC_ROUTES = ["/login", "/api/auth/login", "/api/auth/logout"];

/** Portal mahasiswa — auth di client (Bearer + cookie opsional), jangan redirect loop ke login */
const CLIENT_AUTH_ROUTES = ["/portal"];

// Role-based route access
const ROLE_ROUTES: Record<string, UserRole[]> = {
  "/dashboard": ["SUPER_ADMIN", "ADMIN_FAKULTAS"],
  "/akun": ["SUPER_ADMIN"],
  "/mahasiswa": ["SUPER_ADMIN", "ADMIN_FAKULTAS"],
  "/undangan": ["SUPER_ADMIN", "ADMIN_FAKULTAS"],
  "/kehadiran": ["SUPER_ADMIN", "ADMIN_FAKULTAS"],
  "/scan": ["PETUGAS_SCAN", "SUPER_ADMIN"],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass public routes, static files, dan semua API routes
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    CLIENT_AUTH_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/api/socket") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Redirect ke login jika tidak ada token
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = verifyToken(token);

    // Cek role-based access
    for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(payload.role)) {
        const redirectUrl = getDefaultRouteForRole(payload.role);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }

    // Inject user info ke header untuk server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Token invalid — hapus cookie dan redirect ke login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN_FAKULTAS":
      return "/dashboard";
    case "PETUGAS_SCAN":
      return "/scan";
    case "MAHASISWA":
      return "/portal";
    default:
      return "/login";
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
