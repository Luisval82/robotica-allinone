// Qué cursos imparte cada docente, año académico por año académico, y qué
// alcance tiene por tanto su panel.

import "server-only";
import { getAnioActivo } from "@/lib/db/anios";
import { assertNoError, supabase } from "@/lib/db/store";
import { COURSES, isCourse, type Course, type Role } from "@/lib/types";

/** Cursos asignados a un docente en un año académico. */
export async function getCursosDocente(docenteId: string, anio?: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from("docente_cursos")
    .select("course")
    .eq("docente_id", docenteId)
    .eq("anio", anio ?? (await getAnioActivo()));
  assertNoError(error, "getCursosDocente");

  const asignados = new Set(((data ?? []) as { course: Course }[]).map((fila) => fila.course));
  return COURSES.filter((course) => asignados.has(course));
}

/** Los cursos de todos los docentes de un año, para pintar la tabla de una vez. */
export async function getCursosDeDocentes(anio?: string): Promise<Map<string, Course[]>> {
  const { data, error } = await supabase
    .from("docente_cursos")
    .select("docente_id, course")
    .eq("anio", anio ?? (await getAnioActivo()));
  assertNoError(error, "getCursosDeDocentes");

  const porDocente = new Map<string, Set<Course>>();
  for (const fila of (data ?? []) as { docente_id: string; course: Course }[]) {
    const cursos = porDocente.get(fila.docente_id) ?? new Set<Course>();
    cursos.add(fila.course);
    porDocente.set(fila.docente_id, cursos);
  }

  const resultado = new Map<string, Course[]>();
  for (const [docenteId, cursos] of porDocente) {
    resultado.set(
      docenteId,
      COURSES.filter((course) => cursos.has(course)),
    );
  }
  return resultado;
}

/**
 * Fija de una vez los cursos que imparte un docente este año: borra los que
 * ya no están y añade los nuevos. Una lista vacía deja al docente sin cursos
 * asignados (y, por tanto, viendo todos con un aviso).
 */
export async function setCursosDocente(docenteId: string, cursos: Course[]): Promise<void> {
  const anio = await getAnioActivo();
  const unicos = COURSES.filter((course) => cursos.includes(course));

  const { error: errorBorrado } = await supabase
    .from("docente_cursos")
    .delete()
    .eq("docente_id", docenteId)
    .eq("anio", anio);
  assertNoError(errorBorrado, "setCursosDocente:borrar");

  if (unicos.length === 0) return;

  const { error } = await supabase.from("docente_cursos").upsert(
    unicos.map((course) => ({ docente_id: docenteId, anio, course })),
    { onConflict: "docente_id,anio,course" },
  );
  assertNoError(error, "setCursosDocente:guardar");
}

/**
 * Qué cursos puede ver quien está dentro del panel de profesor.
 *
 *  · "todos"       → superadministrador: visibilidad global, siempre.
 *  · "asignados"   → profesor con cursos asignados: solo esos.
 *  · "sin-asignar" → profesor sin ninguna asignación: se le enseñan todos con
 *                    un aviso, para que un profesor nuevo no se encuentre el
 *                    panel vacío sin entender por qué.
 */
export type AlcanceDocente = "todos" | "asignados" | "sin-asignar";

export interface CursosVisibles {
  cursos: Course[];
  alcance: AlcanceDocente;
}

export async function getCursosVisibles(docente: {
  id: string;
  role: Role;
}): Promise<CursosVisibles> {
  if (docente.role === "superadmin") return { cursos: [...COURSES], alcance: "todos" };

  const asignados = await getCursosDocente(docente.id);
  return asignados.length > 0
    ? { cursos: asignados, alcance: "asignados" }
    : { cursos: [...COURSES], alcance: "sin-asignar" };
}

/** ¿Puede este docente ver este curso? */
export function puedeVerCurso(visibles: CursosVisibles, course: Course | null): boolean {
  return course !== null && visibles.cursos.includes(course);
}

/**
 * El curso del parámetro ?curso= de la página, si quien mira puede verlo. Si
 * no (o si no viene), el primero de los suyos. Nunca devuelve un curso ajeno,
 * así que vale igual para una dirección escrita a mano.
 */
export function cursoDeLaUrl(visibles: CursosVisibles, valor: string | undefined): Course {
  return isCourse(valor) && visibles.cursos.includes(valor) ? valor : visibles.cursos[0];
}
