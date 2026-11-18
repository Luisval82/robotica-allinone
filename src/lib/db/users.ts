// Usuarios: consultas, altas y cambio de rol. Todo contra Supabase.

import "server-only";
import { assertNoError, supabase, userFromRow, type UserRow } from "@/lib/db/store";
import { SCHOOL_EMAIL_SUFFIX, normalizeEmail } from "@/lib/validation";
import { hashPassword } from "@/lib/password";
import type { Course, DemoCredential, PublicUser, Role, User } from "@/lib/types";

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

/** Cuántas cuentas de superadministrador hay ahora mismo. */
async function contarSuperadmins(): Promise<number> {
  const { count, error } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "superadmin");
  assertNoError(error, "contarSuperadmins");
  return count ?? 0;
}

export type CambioDeRol =
  | { ok: true; user: PublicUser }
  | { ok: false; motivo: "no-existe" | "tu-cuenta" | "ultimo-superadmin" };

/**
 * Cambia el rol de una cuenta: Alumno, Profesor o Superadministrador.
 *
 * Dos seguros para no quedarse fuera de la plataforma:
 *  · nadie se cambia el rol a sí mismo (`actorId`);
 *  · nunca se queda el sistema sin ningún superadministrador.
 *
 * Al pasar a alumno conserva el curso que tuviera guardado o, si no tenía,
 * usa `fallbackCourse`. Al salir de alumno se marca el perfil como completo:
 * un docente no tiene que pasar por la pantalla de curso.
 */
export async function setUserRole(
  userId: string,
  role: Role,
  opciones: { actorId: string; fallbackCourse?: Course },
): Promise<CambioDeRol> {
  if (userId === opciones.actorId) return { ok: false, motivo: "tu-cuenta" };

  const current = await findUserById(userId);
  if (!current) return { ok: false, motivo: "no-existe" };
  if (current.role === role) return { ok: true, user: toPublicUser(current) };

  if (current.role === "superadmin" && (await contarSuperadmins()) <= 1) {
    return { ok: false, motivo: "ultimo-superadmin" };
  }

  const updates =
    role === "alumno"
      ? { role, course: current.course ?? opciones.fallbackCourse ?? "1ESO" }
      : { role, perfil_completo: true };

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .maybeSingle();
  assertNoError(error, "setUserRole");
  return data
    ? { ok: true, user: toPublicUser(userFromRow(data as UserRow)) }
    : { ok: false, motivo: "no-existe" };
}

/**
 * Correos del colegio que entran ya con su rol la primera vez, sin que nadie
 * se lo tenga que dar a mano. Se ponen en Vercel separados por comas:
 *
 *   SUPERADMIN_EMAILS=luis@colegiovaldeserra.com
 *   PROFESOR_EMAILS=ana@colegiovaldeserra.com, juan@colegiovaldeserra.com
 *
 * Ojo: mandan sobre el panel. Mientras un correo esté en la lista, su cuenta
 * recupera ese rol cada vez que entra, aunque se le haya cambiado a alumno.
 */
function rolDeEntrada(email: string): Role | null {
  const lista = (variable: string): string[] =>
    (process.env[variable] ?? "")
      .split(",")
      .map((valor) => normalizeEmail(valor))
      .filter((valor) => valor !== "");

  if (lista("SUPERADMIN_EMAILS").includes(email)) return "superadmin";
  if (lista("PROFESOR_EMAILS").includes(email)) return "profesor";
  return null;
}

/**
 * Si el correo está en SUPERADMIN_EMAILS o PROFESOR_EMAILS y la cuenta figura
 * como alumno, le devuelve el rol que le toca. Nunca degrada a nadie: a un
 * profesor o superadministrador ya dado de alta no le toca el rol.
 */
async function aplicarRolDeEntrada(user: User): Promise<User> {
  const rol = rolDeEntrada(user.email);
  if (!rol || user.role !== "alumno" || rol === user.role) return user;

  const { error } = await supabase
    .from("users")
    .update({ role: rol, perfil_completo: true })
    .eq("id", user.id);
  assertNoError(error, "aplicarRolDeEntrada");
  return { ...user, role: rol, perfilCompleto: true };
}

/**
 * Encuentra —o crea— al usuario que acaba de entrar con Google.
 *
 * Se reconoce por el identificador de Google, que no cambia aunque el colegio
 * le cambie el correo. Si ya existía con ese correo (por ejemplo, un profesor
 * dado de alta con contraseña), se le enlaza la cuenta de Google en vez de
 * duplicarlo. Quien entra por primera vez nace como alumno y sin perfil: lo
 * completa en la pantalla de bienvenida.
 */
export async function findOrCreateGoogleUser(cuenta: {
  sub: string;
  email: string;
  nombre: string;
}): Promise<User> {
  const email = normalizeEmail(cuenta.email);

  const { data: porSub, error: errorSub } = await supabase
    .from("users")
    .select("*")
    .eq("google_sub", cuenta.sub)
    .maybeSingle();
  assertNoError(errorSub, "findOrCreateGoogleUser (por google_sub)");
  if (porSub) {
    // El colegio puede haberle cambiado el correo: se deja al día.
    const fila = porSub as UserRow;
    if (fila.email !== email) {
      const { error } = await supabase.from("users").update({ email }).eq("id", fila.id);
      assertNoError(error, "findOrCreateGoogleUser (correo nuevo)");
      fila.email = email;
    }
    return aplicarRolDeEntrada(userFromRow(fila));
  }

  // Ya tenía cuenta con ese correo (por ejemplo, un profesor o el propio
  // superadministrador dados de alta con contraseña): se le enlaza Google y
  // CONSERVA SU ROL. No se le crea un perfil de alumno ni se le pide curso.
  const existente = await findUserByEmail(email);
  if (existente) {
    const { error } = await supabase
      .from("users")
      .update({ google_sub: cuenta.sub })
      .eq("id", existente.id);
    assertNoError(error, "findOrCreateGoogleUser (enlazar)");
    return aplicarRolDeEntrada({ ...existente, googleSub: cuenta.sub });
  }

  // Cuenta nueva: alumno, salvo que el correo esté en las listas de docentes.
  const rol = rolDeEntrada(email) ?? "alumno";

  const { data, error } = await supabase
    .from("users")
    .insert({
      name: cuenta.nombre || email.split("@")[0],
      email,
      password_hash: null,
      google_sub: cuenta.sub,
      perfil_completo: rol !== "alumno",
      role: rol,
      course: null,
    })
    .select("*")
    .single();
  assertNoError(error, "findOrCreateGoogleUser (alta)");
  return userFromRow(data as UserRow);
}

/** Guarda el nombre y el curso que el alumno elige en su primera entrada. */
export async function completarPerfil(
  userId: string,
  datos: { name: string; course: Course },
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ name: datos.name, course: datos.course, perfil_completo: true })
    .eq("id", userId);
  assertNoError(error, "completarPerfil");
}

/** Cambios que hacen el profesor y el superadmin sobre un alumno. */
export async function actualizarAlumno(
  userId: string,
  datos: { name?: string; course?: Course },
): Promise<void> {
  const cambios: Record<string, string> = {};
  if (datos.name !== undefined) cambios.name = datos.name;
  if (datos.course !== undefined) cambios.course = datos.course;
  if (Object.keys(cambios).length === 0) return;

  const { error } = await supabase.from("users").update(cambios).eq("id", userId).eq("role", "alumno");
  assertNoError(error, "actualizarAlumno");
}
