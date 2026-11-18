// Entrar con la cuenta de Google del colegio (OpenID Connect).
//
// No hace falta ninguna biblioteca: son dos llamadas a Google. El id_token se
// recoge hablando directamente con el servidor de Google por HTTPS y con el
// secreto de cliente, así que llega por un canal de confianza y no hace falta
// comprobar su firma (lo permite el propio OpenID Connect, apartado 3.1.3.7).
// Aun así se comprueba de quién es (aud), quién lo emite (iss) y que el
// correo esté verificado y sea del colegio.

import "server-only";
import { SCHOOL_EMAIL_SUFFIX } from "@/lib/validation";

const AUTORIZAR = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";
const EMISORES = ["https://accounts.google.com", "accounts.google.com"];

/** El dominio del colegio, sin la arroba: para pedírselo ya a Google. */
const DOMINIO = SCHOOL_EMAIL_SUFFIX.replace(/^@/, "");

export interface CuentaGoogle {
  sub: string;
  email: string;
  /** Nombre completo tal y como lo tiene Google ("name"). Puede venir vacío. */
  nombre: string;
  /** Nombre de pila que da Google ("given_name"): el respaldo para saludar. */
  nombrePila: string;
}

/** ¿Están puestas las credenciales? Sin ellas, el botón no se enseña. */
export function googleConfigurado(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function credenciales(): { id: string; secreto: string } {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secreto = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !secreto) {
    throw new Error("Faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET.");
  }
  return { id, secreto };
}

/** La dirección a la que Google devuelve al alumno después de identificarse. */
export function urlDeVuelta(origen: string): string {
  return new URL("/acceso/google/callback", origen).toString();
}

/** La página de Google donde elige su cuenta del colegio. */
export function urlDeGoogle(origen: string, estado: string): string {
  const { id } = credenciales();
  const parametros = new URLSearchParams({
    client_id: id,
    redirect_uri: urlDeVuelta(origen),
    response_type: "code",
    scope: "openid email profile",
    state: estado,
    // Que Google ofrezca directamente las cuentas del colegio.
    hd: DOMINIO,
    prompt: "select_account",
  });
  return `${AUTORIZAR}?${parametros.toString()}`;
}

function leerCarga(idToken: string): Record<string, unknown> {
  const carga = idToken.split(".")[1];
  if (!carga) throw new Error("El id_token de Google no tiene el formato esperado.");
  return JSON.parse(Buffer.from(carga, "base64url").toString("utf8")) as Record<string, unknown>;
}

/**
 * Cambia el código que trae Google por los datos de la cuenta. Devuelve null
 * si algo no cuadra: otro dominio, correo sin verificar o respuesta rara.
 */
export async function cuentaDesdeCodigo(
  codigo: string,
  origen: string,
): Promise<CuentaGoogle | null> {
  const { id, secreto } = credenciales();

  const respuesta = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: codigo,
      client_id: id,
      client_secret: secreto,
      redirect_uri: urlDeVuelta(origen),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!respuesta.ok) return null;

  const datos = (await respuesta.json()) as { id_token?: string };
  if (!datos.id_token) return null;

  const carga = leerCarga(datos.id_token);
  const sub = typeof carga.sub === "string" ? carga.sub : "";
  const email = typeof carga.email === "string" ? carga.email.toLowerCase() : "";
  const nombre = typeof carga.name === "string" ? carga.name.trim() : "";
  // Google manda también el nombre de pila por separado: se guarda para
  // cuando «name» viene vacío y no sabríamos cómo llamar a esa persona.
  const nombrePila = typeof carga.given_name === "string" ? carga.given_name.trim() : "";
  const aud = carga.aud;
  const iss = typeof carga.iss === "string" ? carga.iss : "";

  if (aud !== id || !EMISORES.includes(iss)) return null;
  if (carga.email_verified !== true) return null;
  if (!sub || !email.endsWith(SCHOOL_EMAIL_SUFFIX)) return null;

  return { sub, email, nombre, nombrePila };
}
