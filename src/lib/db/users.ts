// Usuarios: consultas, altas y cambio de rol.

import "server-only";
import { getStore, readSeedUsers } from "@/lib/db/store";
import { hashPassword } from "@/lib/password";
import type { Course, DemoCredential, PublicUser, User } from "@/lib/types";
import { normalizeEmail } from "@/lib/validation";

export function toPublicUser({ passwordHash: _passwordHash, ...user }: User): PublicUser {
  return user;
}

// ── Consultas ────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const target = normalizeEmail(email);
  return getStore().users.find((user) => user.email === target);
}

export async function findUserById(id: string): Promise<User | undefined> {
  return getStore().users.find((user) => user.id === id);
}

export async function listUsers(): Promise<PublicUser[]> {
  return getStore().users.map(toPublicUser);
}

/** Usuarios de prueba con su contraseña en claro, para mostrarlos en el login. */
export async function getDemoCredentials(): Promise<DemoCredential[]> {
  return readSeedUsers()
    .filter((user) => user.enLogin)
    .map(({ name, email, password, role, course }) => ({ name, email, password, role, course }));
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
  const user: User = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: normalizeEmail(input.email),
    passwordHash: hashPassword(input.password),
    role: "alumno",
    course: input.course,
    createdAt: new Date().toISOString(),
  };
  getStore().users.push(user);
  return user;
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
  const user = getStore().users.find((candidate) => candidate.id === userId);
  if (!user || user.role === "superadmin") return null;

  if (makeProfesor) {
    user.role = "profesor";
  } else {
    user.role = "alumno";
    user.course = user.course ?? fallbackCourse;
  }
  return toPublicUser(user);
}
