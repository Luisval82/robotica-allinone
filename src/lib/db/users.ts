// Usuarios: consultas, altas y cambio de rol. Todo contra Supabase.

import "server-only";
import { assertNoError, supabase, userFromRow, type UserRow } from "@/lib/db/store";
import { SCHOOL_EMAIL_SUFFIX, normalizeEmail } from "@/lib/validation";
import { hashPassword } from "@/lib/password";
import type { Course, DemoCredential, PublicUser, User } from "@/lib/types";

export function toPublicUser({ passwordHash: _passwordHash, ...user }: User): PublicUser {
  return user;
}

// ── Consultas ────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  assertNoError(error, "findUserByEmail");
  return data ? userFromRow(data as UserRow) : undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  assertNoError(error, "findUserById");
  return data ? userFromRow(data as UserRow) : undefined;
}

export async function listUsers(): Promise<PublicUser[]> {
  const { data, error } = await supabase.from("users").select("*");
  assertNoError(error, "listUsers");
  const rows = (data ?? []) as UserRow[];
  return rows.map((row) => toPublicUser(userFromRow(row))).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/**
 * Usuarios de prueba que se enseñan en la pantalla de login. Las contraseñas
 * se guardan cifradas en la base de datos (scrypt: no se pueden leer), así
 * que aquí se repiten en claro SOLO para mostrarlas en pantalla. Si cambias
 * alguna de estas cuentas de demostración, cambia también su fila en
 * supabase/schema.sql para que coincidan.
 */
function demoEmail(localPart: string): string {
  return `${localPart}${SCHOOL_EMAIL_SUFFIX}`;
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  { name: "Superadmin Demo", email: demoEmail("superadmin"), password: "Admin1234", role: "superadmin", course: null },
  { name: "Profe Demo", email: demoEmail("profesor"), password: "Profe1234", role: "profesor", course: null },
  { name: "Alumno Demo Primero", email: demoEmail("alumno1"), password: "Alumno1234", role: "alumno", course: "1ESO" },
  { name: "Alumna Demo Segundo", email: demoEmail("alumno2"), password: "Alumno1234", role: "alumno", course: "2ESO" },
  { name: "Alumno Demo Tercero", email: demoEmail("alumno3"), password: "Alumno1234", role: "alumno", course: "3ESO" },
];

export async function getDemoCredentials(): Promise<DemoCredential[]> {
  return DEMO_CREDENTIALS;
}

// ── Altas ────────────────────────────────────────────────────────────────

/**
 * Crea una cuenta nueva. Todo el que se registra entra como ALUMNO:
 * el rol de Profesor solo lo concede el superadministrador.
 */
export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  course: Course;
}): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      name: input.name.trim(),
      email: normalizeEmail(input.email),
      password_hash: hashPassword(input.password),
      role: "alumno",
      course: input.course,
    })
    .select("*")
    .single();
  assertNoError(error, "createUser");
  return userFromRow(data as UserRow);
}

// ── Roles ────────────────────────────────────────────────────────────────

/**
 * Da o quita el rol de Profesor. Nunca toca a un superadministrador.
 * Al quitar el rol, la cuenta vuelve a ser de alumno: conserva el curso con
 * el que se registró o, si no tenía, usa `fallbackCourse`.
 * Devuelve el usuario actualizado, o null si no se pudo cambiar.
 */
export async function setProfesorRole(
  userId: string,
  makeProfesor: boolean,
  fallbackCourse: Course = "1ESO",
): Promise<PublicUser | null> {
  const current = await findUserById(userId);
  if (!current || current.role === "superadmin") return null;

  const updates = makeProfesor
    ? { role: "profesor" as const }
    : { role: "alumno" as const, course: current.course ?? fallbackCourse };

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .maybeSingle();
  assertNoError(error, "setProfesorRole");
  return data ? toPublicUser(userFromRow(data as UserRow)) : null;
}
