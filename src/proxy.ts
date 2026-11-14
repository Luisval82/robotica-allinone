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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

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
