import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { startSession } from "@/lib/auth";
import { findOrCreateGoogleUser } from "@/lib/db";
import { cuentaDesdeCodigo } from "@/lib/google";
import { BIENVENIDA_PATH, LOGIN_PATH, ROLE_HOME } from "@/lib/routes";

/** La vuelta de Google: comprueba quién es, lo da de alta si hace falta y abre su sesión. */
export async function GET(request: NextRequest) {
  const alLogin = (motivo: string) =>
    NextResponse.redirect(new URL(`${LOGIN_PATH}?error=${motivo}`, request.url));

  const cookieStore = await cookies();
  const esperado = cookieStore.get("google-estado")?.value;
  cookieStore.delete("google-estado");

  const codigo = request.nextUrl.searchParams.get("code");
  const estado = request.nextUrl.searchParams.get("state");
  if (!codigo || !estado || !esperado || estado !== esperado) return alLogin("google");

  const cuenta = await cuentaDesdeCodigo(codigo, request.nextUrl.origin);
  // Sin cuenta válida casi siempre significa que ha entrado con un correo que
  // no es del colegio, que es lo que conviene decirle.
  if (!cuenta) return alLogin("dominio");

  const user = await findOrCreateGoogleUser(cuenta);
  await startSession(user);

  const destino = user.perfilCompleto ? ROLE_HOME[user.role] : BIENVENIDA_PATH;
  return NextResponse.redirect(new URL(destino, request.url));
}
