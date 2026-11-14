// Sesión en el servidor: leer quién ha entrado, exigir un rol, abrir y cerrar sesión.

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOGIN_PATH, ROLE_HOME } from "@/lib/routes";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";
import type { Role, SessionUser } from "@/lib/types";

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

/**
 * Úsalo al principio de cada página protegida. Segunda barrera tras el proxy:
 * sin sesión → login; con un rol que no toca → a su propio panel.
 */
export async function requireRole(allowed: readonly Role[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);
  if (!allowed.includes(session.role)) redirect(ROLE_HOME[session.role]);
  return session;
}

export async function startSession(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
