import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { apiSuccess } from "@/lib/utils";

export async function POST() {
  const response = apiSuccess(null, "Logout berhasil");
  const cookieResponse = new Response(response.body, response);
  cookieResponse.headers.set(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0`
  );
  return cookieResponse;
}
