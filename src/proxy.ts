// ════════════════════════════════════════════════════════════════════════
//  RUTAS PROTEGIDAS
//
//  En Next.js 16 este archivo (proxy.ts) sustituye al antiguo middleware.ts.
//  Se ejecuta ANTES de cargar cualquier página de la lista `matcher`:
//
//   · Sin sesión      → /dashboard/* redirige a /login.
//   · Con sesión      → /, /login, /registro y /dashboard redirigen a su panel:
//                         superadmin → /dashboard/admin
//                         profesor   → /dashboard/profesor
//                         alumno     → /dashboard/alumno
//   · Rol equivocado  → si un alumno escribe /dashboard/admin, vuelve a su panel.
// ════════════════════════════════════════════════════════════════════════

import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_PATH, ROLE_HOME, canAccess, isAuthPath, isDashboardPath } from "@/lib/routes";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { isUuid } from "@/lib/types";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawSession = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  // Una cookie de antes de migrar a Supabase (o corrupta) tiene un id que no
  // es un UUID: aquí se trata como «sin sesión», igual que en getSession()
  // (src/lib/auth.ts). Si no, este proxy la daba por válida y mandaba a la
  // persona a su panel, pero la página sí la rechazaba y la devolvía a
  // /login, que este proxy volvía a mandar a su panel: bucle de redirecciones.
  const session = rawSession && isUuid(rawSession.id) ? rawSession : null;

  if (!session) {
    if (pathname === "/" || isDashboardPath(pathname)) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }
    return NextResponse.next();
  }

  const home = ROLE_HOME[session.role];
  const goesHome =
    pathname === "/" ||
    pathname === "/dashboard" ||
    isAuthPath(pathname) ||
    !canAccess(session.role, pathname);

  if (goesHome && pathname !== home) {
    return NextResponse.redirect(new URL(home, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/registro", "/dashboard/:path*"],
};
