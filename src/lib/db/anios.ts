// Años académicos: cuál es el activo, cuáles están archivados y el cierre de
// curso. Todo dato de trabajo (interruptores, progreso, entregas, prácticas)
// lleva el año en el que se hizo, así que cambiar el año activo es lo que
// convierte el curso que termina en histórico, sin borrar nada.

import "server-only";
import { cache } from "react";
import { assertNoError, supabase } from "@/lib/db/store";
import type { CierreDeAnio, Course } from "@/lib/types";

export interface AnioAcademico {
  anio: string;
  activo: boolean;
  abiertoEn: string;
  cerradoEn: string | null;
}

interface AnioRow {
  anio: string;
  activo: boolean;
  abierto_en: string;
  cerrado_en: string | null;
}

function anioFromRow(row: AnioRow): AnioAcademico {
  return {
    anio: row.anio,
    activo: row.activo,
    abiertoEn: row.abierto_en,
    cerradoEn: row.cerrado_en,
  };
}

/** Así se escribe un año académico: 2026-2027. */
export const ANIO_RE = /^\d{4}-\d{4}$/;

export function esAnioValido(valor: unknown): valor is string {
  return typeof valor === "string" && ANIO_RE.test(valor.trim());
}

/**
 * El año académico que corresponde a una fecha: de septiembre a diciembre es
 * el que empieza; de enero a agosto, el que acaba. Solo se usa para proponer
 * el año siguiente en el formulario de cierre.
 */
export function anioDeLaFecha(fecha = new Date()): string {
  const mes = fecha.getMonth(); // 0 = enero
  const inicio = mes >= 8 ? fecha.getFullYear() : fecha.getFullYear() - 1;
  return `${inicio}-${inicio + 1}`;
}

/** El año siguiente a uno dado: "2026-2027" → "2027-2028". */
export function anioSiguiente(anio: string): string {
  const inicio = Number(anio.slice(0, 4));
  return Number.isFinite(inicio) ? `${inicio + 1}-${inicio + 2}` : anioDeLaFecha();
}

/**
 * El año en el que se está trabajando. Lo piden casi todas las consultas, así
 * que se envuelve en cache() de React: se pregunta una sola vez por petición.
 */
export const getAnioActivo = cache(async (): Promise<string> => {
  const { data, error } = await supabase
    .from("anios_academicos")
    .select("anio")
    .eq("activo", true)
    .maybeSingle();
  assertNoError(error, "getAnioActivo");

  const fila = data as { anio: string } | null;
  if (fila) return fila.anio;

  // Base de datos recién creada o sin año activo: se abre el que toca por
  // calendario, para que la plataforma pueda funcionar.
  const anio = anioDeLaFecha();
  const { error: errorAlta } = await supabase
    .from("anios_academicos")
    .upsert({ anio, activo: true }, { onConflict: "anio" });
  assertNoError(errorAlta, "getAnioActivo:alta");
  return anio;
});

/** Todos los años: primero el activo, después los archivados de más reciente a más antiguo. */
export async function listAnios(): Promise<AnioAcademico[]> {
  const { data, error } = await supabase
    .from("anios_academicos")
    .select("*")
    .order("anio", { ascending: false });
  assertNoError(error, "listAnios");

  const anios = ((data ?? []) as AnioRow[]).map(anioFromRow);
  return anios.sort((a, b) => Number(b.activo) - Number(a.activo) || b.anio.localeCompare(a.anio));
}

/**
 * Cierra el año activo y abre el siguiente. Lo hace la base de datos en una
 * sola operación (función cerrar_anio_academico de supabase/schema.sql): o se
 * hace todo, o no se hace nada. Nada se borra: el progreso y las entregas se
 * quedan guardados con el año en el que se hicieron.
 */
export async function cerrarAnioAcademico(
  anioNuevo: string,
  opciones: { copiarAsignacionesDocentes: boolean },
): Promise<CierreDeAnio> {
  const { data, error } = await supabase.rpc("cerrar_anio_academico", {
    p_anio_nuevo: anioNuevo.trim(),
    p_copiar_docentes: opciones.copiarAsignacionesDocentes,
  });
  assertNoError(error, "cerrarAnioAcademico");
  return data as CierreDeAnio;
}

// ── Matrículas ───────────────────────────────────────────────────────────

/** Deja constancia del curso en el que está un alumno este año académico. */
export async function matricular(alumnoId: string, course: Course, anio?: string): Promise<void> {
  const { error } = await supabase
    .from("matriculas")
    .upsert(
      { alumno_id: alumnoId, anio: anio ?? (await getAnioActivo()), course },
      { onConflict: "alumno_id,anio" },
    );
  assertNoError(error, "matricular");
}

/**
 * La última matrícula de un alumno. Sirve para saber si entra por primera vez
 * o si es alguien que ya estuvo y vuelve a matricularse en un curso nuevo.
 */
export async function getUltimaMatricula(
  alumnoId: string,
): Promise<{ anio: string; course: Course } | null> {
  const { data, error } = await supabase
    .from("matriculas")
    .select("anio, course")
    .eq("alumno_id", alumnoId)
    .order("anio", { ascending: false })
    .limit(1)
    .maybeSingle();
  assertNoError(error, "getUltimaMatricula");
  return (data as { anio: string; course: Course } | null) ?? null;
}

/** En qué curso estuvo cada alumno en un año académico. */
export async function getMatriculas(anio: string): Promise<Map<string, Course>> {
  const { data, error } = await supabase
    .from("matriculas")
    .select("alumno_id, course")
    .eq("anio", anio);
  assertNoError(error, "getMatriculas");

  const porAlumno = new Map<string, Course>();
  for (const fila of (data ?? []) as { alumno_id: string; course: Course }[]) {
    porAlumno.set(fila.alumno_id, fila.course);
  }
  return porAlumno;
}
