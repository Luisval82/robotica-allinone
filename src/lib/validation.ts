// Validación de formularios. Se usa igual en el navegador (aviso inmediato)
// y en el servidor (comprobación obligatoria que no se puede saltar).

import { SCHOOL_EMAIL_DOMAIN } from "@/config/site";
import { isCourse } from "@/lib/types";

/** "@colegiovaldeserra.com" — se calcula a partir de src/config/site.ts. */
export const SCHOOL_EMAIL_SUFFIX = `@${SCHOOL_EMAIL_DOMAIN.trim().replace(/^@/, "").toLowerCase()}`;

export const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const MAX_NAME_LENGTH = 60;

export type AuthField = "name" | "email" | "password" | "course";
export type FieldErrors = Partial<Record<AuthField, string>>;

/** Estado que devuelven las acciones de login y registro al formulario. */
export interface AuthFormState {
  error?: string;
  fieldErrors?: FieldErrors;
}

export const EMPTY_AUTH_STATE: AuthFormState = {};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** true solo si el correo pertenece al dominio corporativo del colegio. */
export function isSchoolEmail(email: string): boolean {
  const value = normalizeEmail(email);
  if (!value.endsWith(SCHOOL_EMAIL_SUFFIX)) return false;
  const localPart = value.slice(0, -SCHOOL_EMAIL_SUFFIX.length);
  return /^[a-z0-9]+([._+-][a-z0-9]+)*$/.test(localPart);
}

export function validateEmail(email: string): string | undefined {
  if (normalizeEmail(email) === "") return "Escribe tu correo del colegio.";
  if (!isSchoolEmail(email)) {
    return `Usa tu correo del colegio: tiene que terminar en ${SCHOOL_EMAIL_SUFFIX}`;
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña necesita al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `La contraseña no puede pasar de ${MAX_PASSWORD_LENGTH} caracteres.`;
  }
  return undefined;
}

export function validateName(name: string): string | undefined {
  const value = name.trim();
  if (value.length < 2) return "Escribe tu nombre y apellidos.";
  if (value.length > MAX_NAME_LENGTH) return `El nombre no puede pasar de ${MAX_NAME_LENGTH} caracteres.`;
  return undefined;
}

function compact(errors: Record<string, string | undefined>): FieldErrors {
  const result: FieldErrors = {};
  for (const [field, message] of Object.entries(errors)) {
    if (message) result[field as AuthField] = message;
  }
  return result;
}

export function validateLogin(input: { email: string; password: string }): FieldErrors {
  return compact({
    email: validateEmail(input.email),
    password: input.password === "" ? "Escribe tu contraseña." : undefined,
  });
}

export function validateRegistration(input: {
  name: string;
  email: string;
  password: string;
  course: string;
}): FieldErrors {
  return compact({
    name: validateName(input.name),
    email: validateEmail(input.email),
    password: validatePassword(input.password),
    course: isCourse(input.course) ? undefined : "Elige tu curso.",
  });
}
