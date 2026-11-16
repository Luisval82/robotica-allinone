// Sesión en el servidor: leer quién ha entrado, exigir un rol, abrir y cerrar sesión.

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserById } from "@/lib/db";
import { LOGIN_PATH, REFRESH_SESSION_PATH, ROLE_HOME } from "@/lib/routes";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";
import { isUuid, type Role, type SessionUser } from "@/lib/types";

/**
 * Lee la sesión de la cookie. Si el id no es un UUID (cookie de antes de
 * migrar a Supabase, o corrupta), se trata como «sin sesión»: así ninguna
 * consulta llega a Supabase con un id que no puede interpretar, que antes
 * tumbaba la página con un error 500. (No se borra aquí la cookie: esta
 * función se usa también desde páginas, donde Next no permite tocar
 * cookies; se sobrescribe sola en el próximo inicio de sesión. endSession()
 * sí la borra si se llama desde una Server Action o Route Handler.)
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  return session && isUuid(session.id) ? session : null;
}

/**
 * Úsalo al principio de cada página protegida y de cada acción de servidor.
 * Segunda barrera tras el proxy: sin sesión → login; con un rol que no toca →
 * a su propio panel.
 *
 * La base de datos manda sobre la cookie: si el superadministrador le ha
 * cambiado el rol a alguien mientras tenía la sesión abierta, se le envía a
 * renovar la cookie y entra ya con su rol nuevo, sin volver a iniciar sesión.
 */
export async function requireRole(allowed: readonly Role[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);

  const current = await findUserById(session.id);
  if (current && (current.role !== session.role || current.course !== session.course)) {
    redirect(REFRESH_SESSION_PATH);
  }

  if (!allowed.includes(session.role)) redirect(ROLE_HOME[session.role]);
  return session;
}

/** Opciones de la cookie de sesión (las comparte la ruta que la renueva). */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function startSession(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
