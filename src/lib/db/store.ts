// ════════════════════════════════════════════════════════════════════════
//  BASE DE DATOS REAL — Supabase (PostgreSQL)
//
//  Este archivo ya no guarda nada en memoria. Expone el cliente de Supabase
//  y los ayudantes que usan src/lib/db/users.ts y src/lib/db/aula.ts para
//  traducir entre las filas de la base de datos (snake_case, ver
//  supabase/schema.sql) y los tipos de la aplicación (camelCase, ver
//  src/lib/types.ts).
// ════════════════════════════════════════════════════════════════════════

import "server-only";
import { supabase } from "@/lib/supabase";
import type { Course, Entrega, ProgramRow, Role, UnitProgress, User } from "@/lib/types";

export { supabase };

/** Lanza un error legible si Supabase devuelve un fallo al consultar o escribir. */
export function assertNoError(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`Supabase (${context}): ${error.message}`);
}

// ── users ──────────────────────────────────────────────────────────────

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  google_sub: string | null;
  perfil_completo: boolean;
  activa: boolean;
  role: Role;
  course: Course | null;
  created_at: string;
}

export function userFromRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    googleSub: row.google_sub ?? null,
    perfilCompleto: row.perfil_completo ?? true,
    // Una base anterior a la columna «activa» no la trae: se da por activa.
    activa: row.activa ?? true,
    role: row.role,
    course: row.course,
    createdAt: row.created_at,
  };
}

// ── progreso ───────────────────────────────────────────────────────────

export interface ProgresoRow {
  alumno_id: string;
  unidad: number;
  pasos_teoria: number;
  test_aciertos: number | null;
  test_respuestas: number[] | null;
}

export function progresoFromRow(row: ProgresoRow): UnitProgress {
  return {
    alumnoId: row.alumno_id,
    unidad: row.unidad,
    pasosTeoria: row.pasos_teoria,
    testAciertos: row.test_aciertos,
    testRespuestas: row.test_respuestas,
  };
}

// ── entregas ───────────────────────────────────────────────────────────

export interface EntregaRow {
  id: string;
  alumno_id: string;
  unidad: number;
  practica: 1 | 2;
  bloques: ProgramRow[];
  explicacion: string;
  entregada_en: string;
  puntos: number | null;
  comentario: string;
  corregida_en: string | null;
  corregida_por: string | null;
}

export function entregaFromRow(row: EntregaRow): Entrega {
  return {
    id: row.id,
    alumnoId: row.alumno_id,
    unidad: row.unidad,
    practica: row.practica,
    bloques: row.bloques,
    explicacion: row.explicacion,
    entregadaEn: row.entregada_en,
    puntos: row.puntos,
    comentario: row.comentario,
    corregidaEn: row.corregida_en,
    corregidaPor: row.corregida_por,
  };
}
