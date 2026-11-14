// Cookie de sesión firmada (HMAC-SHA256 con Web Crypto).
//
// La cookie guarda quién eres y tu rol. Va firmada con SESSION_SECRET, así que
// nadie puede cambiarse el rol editándola en el navegador: si se toca, la firma
// deja de coincidir y la sesión se descarta.
//
// Este archivo no depende de Node ni de Next: lo usan tanto el proxy como las
// páginas y acciones de servidor.

import { isCourse, isRole, type SessionUser } from "@/lib/types";

export const SESSION_COOKIE = "ra_session";

// 8 horas: una jornada escolar. En ordenadores compartidos del aula conviene
// que la sesión no se quede abierta de un día para otro.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export interface SessionPayload extends SessionUser {
  /** Momento de caducidad en milisegundos (Date.now()). */
  exp: number;
}

const DEV_FALLBACK_SECRET = "robotica-allinone-clave-solo-para-desarrollo";
let warnedAboutSecret = false;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production" && !warnedAboutSecret) {
    warnedAboutSecret = true;
    console.warn(
      "[sesión] Falta SESSION_SECRET (mínimo 16 caracteres). Se está usando una clave pública de desarrollo: defínela en Vercel antes de usar la plataforma con alumnado.",
    );
  }
  return DEV_FALLBACK_SECRET;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const payload: SessionPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    course: user.course,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Devuelve la sesión si la cookie es auténtica y no ha caducado; si no, null. */
export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [body, signature] = parts;

  try {
    const authentic = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      fromBase64Url(signature),
      encoder.encode(body),
    );
    if (!authentic) return null;

    const data = JSON.parse(decoder.decode(fromBase64Url(body))) as Partial<SessionPayload>;
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    if (typeof data.id !== "string" || typeof data.name !== "string" || typeof data.email !== "string") {
      return null;
    }
    if (!isRole(data.role)) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      course: isCourse(data.course) ? data.course : null,
      exp: data.exp,
    };
  } catch {
    return null;
  }
}
