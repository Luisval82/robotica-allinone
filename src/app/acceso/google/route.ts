import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { googleConfigurado, urlDeGoogle } from "@/lib/google";
import { LOGIN_PATH } from "@/lib/routes";

/** Empieza el acceso con Google: manda al alumno a elegir su cuenta. */
export async function GET(request: NextRequest) {
  if (!googleConfigurado()) {
    return NextResponse.redirect(new URL(`${LOGIN_PATH}?error=google`, request.url));
  }

  // Un valor al azar que viaja a Google y vuelve: así se comprueba que la
  // vuelta es de esta misma persona y no de un enlace colado desde fuera.
  const estado = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("google-estado", estado, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(urlDeGoogle(request.nextUrl.origin, estado));
}
