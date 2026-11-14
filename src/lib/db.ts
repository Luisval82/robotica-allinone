// ════════════════════════════════════════════════════════════════════════
//  BASE DE DATOS SIMULADA
//
//  · Al arrancar carga los usuarios de prueba de src/data/users.json.
//  · Las cuentas nuevas (registro) se guardan EN MEMORIA: se pierden al
//    reiniciar el servidor y, en Vercel, cuando la función se reinicia.
//  · El resto de la aplicación solo usa las funciones exportadas de este
//    archivo. Cuando conectemos una base de datos real (p. ej. Supabase)
//    bastará con reescribir estas funciones: nada más cambia.
// ════════════════════════════════════════════════════════════════════════

import "server-only";
import seed from "@/data/users.json";
import { hashPassword } from "@/lib/password";
import {
  isCourse,
  isRole,
  type Course,
  type DemoCredential,
  type PublicUser,
  type Role,
  type User,
} from "@/lib/types";
import { SCHOOL_EMAIL_SUFFIX, normalizeEmail } from "@/lib/validation";

interface SeedUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  course: Course | null;
  createdAt: string;
}

/** Los usuarios de prueba adoptan el dominio configurado en src/config/site.ts. */
function withSchoolDomain(email: string): string {
  return `${normalizeEmail(email).split("@")[0]}${SCHOOL_EMAIL_SUFFIX}`;
}

function readSeed(): SeedUser[] {
  return seed.users.map((raw) => {
    if (!isRole(raw.role)) {
      throw new Error(`users.json: el rol "${raw.role}" de ${raw.email} no es válido.`);
    }
    return {
      id: raw.id,
      name: raw.name,
      email: withSchoolDomain(raw.email),
      password: raw.password,
      role: raw.role,
      course: isCourse(raw.course) ? raw.course : null,
      createdAt: raw.createdAt,
    };
  });
}

interface Store {
  /** Huella del JSON de origen: si editas users.json, la base se recarga. */
  seedVersion: string;
  users: User[];
}

// Se guarda en globalThis para que sobreviva a las recargas en caliente de `next dev`.
const globalStore = globalThis as typeof globalThis & { __roboticaDb?: Store };

function getStore(): Store {
  const seedVersion = JSON.stringify(seed) + SCHOOL_EMAIL_SUFFIX;
  if (!globalStore.__roboticaDb || globalStore.__roboticaDb.seedVersion !== seedVersion) {
    globalStore.__roboticaDb = {
      seedVersion,
      users: readSeed().map(({ password, ...user }) => ({
        ...user,
        passwordHash: hashPassword(password),
      })),
    };
  }
  return globalStore.__roboticaDb;
}

function toPublic({ passwordHash: _passwordHash, ...user }: User): PublicUser {
  return user;
}

// ── Consultas ────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const target = normalizeEmail(email);
  return getStore().users.find((user) => user.email === target);
}

export async function listUsers(): Promise<PublicUser[]> {
  return getStore().users.map(toPublic);
}

/** Usuarios de prueba con su contraseña en claro, para mostrarlos en el login. */
export async function getDemoCredentials(): Promise<DemoCredential[]> {
  return readSeed().map(({ name, email, password, role, course }) => ({
    name,
    email,
    password,
    role,
    course,
  }));
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
