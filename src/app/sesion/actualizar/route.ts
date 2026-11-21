// Renueva la cookie de sesión con el rol y el curso actuales de la base de datos
// y lleva a la persona a su panel. Se llega aquí desde requireRole() cuando el
// superadministrador ha cambiado un rol mientras esa persona tenía la sesión abierta.
//
// Y también cuando le ha DESACTIVADO la cuenta: entonces no se renueva nada,
// se le borra la cookie y se le manda al login con el aviso. Esto es lo que
// hace que desactivar una cuenta eche de verdad a quien ya estaba dentro, y no
// solo le impida volver a entrar.

import { NextResponse } from "next/server";
import { getSession, sessionCookieOptions } from "@/lib/auth";
import { findUserById } from "@/lib/db";
import { LOGIN_PATH, ROLE_HOME } from "@/lib/routes";
import { SESSION_COOKIE, createSessionToken } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL(LOGIN_PATH, request.url));

  const current = await findUserById(session.id);
  if (!current) return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));

  if (!current.activa) {
    const fuera = NextResponse.redirect(new URL(`${LOGIN_PATH}?error=inactiva`, request.url));
    fuera.cookies.delete(SESSION_COOKIE);
    return fuera;
  }

  const response = NextResponse.redirect(new URL(ROLE_HOME[current.role], request.url));
  response.cookies.set(SESSION_COOKIE, await createSessionToken(current), sessionCookieOptions());
  return response;
}
