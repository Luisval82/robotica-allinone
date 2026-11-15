// ════════════════════════════════════════════════════════════════════════
//  BASE DE DATOS SIMULADA — almacén en memoria
//
//  · Al arrancar carga los usuarios de src/data/users.json y los datos de
//    prueba del aula de src/data/progreso-demo.json.
//  · Todo lo que cambia después (cuentas nuevas, roles, interruptores de
//    unidades, correcciones) vive EN MEMORIA: se pierde al reiniciar el
//    servidor y, en Vercel, cuando la función se reinicia.
//  · El resto de la aplicación solo usa las funciones de src/lib/db/*.
//    Para pasar a una base de datos real (p. ej. Supabase) basta con
//    reescribir esas funciones.
// ════════════════════════════════════════════════════════════════════════

import "server-only";
import demo from "@/data/progreso-demo.json";
import seed from "@/data/users.json";
import { hashPassword } from "@/lib/password";
import {
  isCourse,
  isRole,
  type Course,
  type Entrega,
  type Role,
  type UnitProgress,
  type User,
} from "@/lib/types";
import { SCHOOL_EMAIL_SUFFIX, normalizeEmail } from "@/lib/validation";

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  course: Course | null;
  enLogin: boolean;
  createdAt: string;
}

/**
 * Interruptores del profesor. Solo se guarda lo que se ha tocado; lo demás
 * sigue la regla por defecto (UD 1 abierta, resto bloqueadas, pruebas cerradas).
 * Claves: "1ESO:3" (curso:unidad) y "idAlumno:3" (alumno:unidad).
 */
export interface AccessRules {
  claseUnidad: Record<string, boolean>;
  clasePrueba: Record<string, boolean>;
  alumnoUnidad: Record<string, boolean>;
  alumnoPrueba: Record<string, boolean>;
}

export interface Store {
  /** Huella de los JSON de origen: si los editas, la base se recarga. */
  seedVersion: string;
  users: User[];
  acceso: AccessRules;
  progreso: UnitProgress[];
  entregas: Entrega[];
}

/** Los usuarios de prueba adoptan el dominio configurado en src/config/site.ts. */
function withSchoolDomain(email: string): string {
  return `${normalizeEmail(email).split("@")[0]}${SCHOOL_EMAIL_SUFFIX}`;
}

export function readSeedUsers(): SeedUser[] {
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
      enLogin: raw.enLogin === true,
      createdAt: raw.createdAt,
    };
  });
}

function buildStore(seedVersion: string): Store {
  return {
    seedVersion,
    users: readSeedUsers().map(({ password, enLogin: _enLogin, ...user }) => ({
      ...user,
      passwordHash: hashPassword(password),
    })),
    acceso: { claseUnidad: {}, clasePrueba: {}, alumnoUnidad: {}, alumnoPrueba: {} },
    progreso: demo.progreso.map((item) => ({
      alumnoId: item.alumnoId,
      unidad: item.unidad,
      teoriaCompletada: item.teoriaCompletada,
      testAciertos: item.testAciertos,
    })),
    entregas: demo.entregas.map((item) => ({
      id: item.id,
      alumnoId: item.alumnoId,
      unidad: item.unidad,
      practica: item.practica === 2 ? 2 : 1,
      texto: item.texto,
      entregadaEn: item.entregadaEn,
      nota: item.nota,
      comentario: item.comentario,
      corregidaEn: item.corregidaEn,
      corregidaPor: item.corregidaPor,
    })),
  };
}

// Se guarda en globalThis para que sobreviva a las recargas en caliente de `next dev`.
const globalStore = globalThis as typeof globalThis & { __roboticaDb?: Store };

export function getStore(): Store {
  const seedVersion = JSON.stringify(seed) + JSON.stringify(demo) + SCHOOL_EMAIL_SUFFIX;
  if (!globalStore.__roboticaDb || globalStore.__roboticaDb.seedVersion !== seedVersion) {
    globalStore.__roboticaDb = buildStore(seedVersion);
  }
  return globalStore.__roboticaDb;
}
