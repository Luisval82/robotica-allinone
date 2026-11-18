// Consulta de un año académico archivado. Solo lectura: nada de lo que hay
// aquí se puede cambiar, porque ese curso ya terminó.
//
// El curso de cada alumno NO se lee de users.course (eso es su curso de este
// año, que puede ser otro o ninguno), sino de su matrícula de aquel año.

import "server-only";
import { testScore } from "@/lib/db/aula";
import { getMatriculas } from "@/lib/db/anios";
import { assertNoError, supabase } from "@/lib/db/store";
import { COURSES, UNIT_NUMBERS, type Course } from "@/lib/types";

/** Quién era el alumno, con el curso que tenía aquel año. */
export interface AlumnoArchivado {
  id: string;
  name: string;
  email: string;
  course: Course;
}

export interface FilaHistorico {
  alumno: AlumnoArchivado;
  /** Nota del test de cada unidad (posición 0 = UD 1). null = sin entregar. */
  notasTest: (number | null)[];
  mediaTest: number | null;
  entregas: number;
  entregasCorregidas: number;
  /** Media de los puntos de las programaciones corregidas, sobre 1. */
  mediaEntregas: number | null;
}

export interface CursoHistorico {
  course: Course;
  filas: FilaHistorico[];
}

function media(valores: number[]): number | null {
  if (valores.length === 0) return null;
  return Math.round((valores.reduce((total, v) => total + v, 0) / valores.length) * 100) / 100;
}

/** Todo lo que quedó guardado de un año académico, agrupado por curso. */
export async function getHistorico(anio: string): Promise<CursoHistorico[]> {
  const matriculas = await getMatriculas(anio);
  const ids = [...matriculas.keys()];
  if (ids.length === 0) return [];

  const [usuarios, progreso, entregas] = await Promise.all([
    supabase.from("users").select("id, name, email").in("id", ids),
    supabase
      .from("progreso")
      .select("alumno_id, unidad, test_aciertos")
      .eq("anio", anio)
      .in("alumno_id", ids),
    supabase.from("entregas").select("alumno_id, puntos").eq("anio", anio).in("alumno_id", ids),
  ]);
  assertNoError(usuarios.error, "getHistorico:users");
  assertNoError(progreso.error, "getHistorico:progreso");
  assertNoError(entregas.error, "getHistorico:entregas");

  const filasProgreso = (progreso.data ?? []) as {
    alumno_id: string;
    unidad: number;
    test_aciertos: number | null;
  }[];
  const filasEntregas = (entregas.data ?? []) as { alumno_id: string; puntos: number | null }[];

  const filas: FilaHistorico[] = [];
  for (const fila of (usuarios.data ?? []) as { id: string; name: string; email: string }[]) {
    const course = matriculas.get(fila.id);
    if (!course) continue;

    const notasTest = UNIT_NUMBERS.map((unidad) => {
      const item = filasProgreso.find((p) => p.alumno_id === fila.id && p.unidad === unidad);
      return item && item.test_aciertos !== null ? testScore(item.test_aciertos) : null;
    });
    const susEntregas = filasEntregas.filter((e) => e.alumno_id === fila.id);
    const corregidas = susEntregas.filter((e) => e.puntos !== null).map((e) => Number(e.puntos));

    filas.push({
      alumno: { id: fila.id, name: fila.name, email: fila.email, course },
      notasTest,
      mediaTest: media(notasTest.filter((nota): nota is number => nota !== null)),
      entregas: susEntregas.length,
      entregasCorregidas: corregidas.length,
      mediaEntregas: media(corregidas),
    });
  }

  return COURSES.map((course) => ({
    course,
    filas: filas
      .filter((f) => f.alumno.course === course)
      .sort((a, b) => a.alumno.name.localeCompare(b.alumno.name, "es")),
  })).filter((grupo) => grupo.filas.length > 0);
}

export interface ResumenAnio {
  alumnos: number;
  entregas: number;
  tests: number;
}

/** Cuánto hay guardado en cada año académico, para la lista del histórico. */
export async function getResumenDeAnios(): Promise<Map<string, ResumenAnio>> {
  const [matriculas, entregas, progreso] = await Promise.all([
    supabase.from("matriculas").select("anio"),
    supabase.from("entregas").select("anio"),
    supabase.from("progreso").select("anio, test_aciertos"),
  ]);
  assertNoError(matriculas.error, "getResumenDeAnios:matriculas");
  assertNoError(entregas.error, "getResumenDeAnios:entregas");
  assertNoError(progreso.error, "getResumenDeAnios:progreso");

  const resumen = new Map<string, ResumenAnio>();
  const de = (anio: string): ResumenAnio => {
    const actual = resumen.get(anio) ?? { alumnos: 0, entregas: 0, tests: 0 };
    resumen.set(anio, actual);
    return actual;
  };

  for (const fila of (matriculas.data ?? []) as { anio: string }[]) de(fila.anio).alumnos += 1;
  for (const fila of (entregas.data ?? []) as { anio: string }[]) de(fila.anio).entregas += 1;
  for (const fila of (progreso.data ?? []) as { anio: string; test_aciertos: number | null }[]) {
    if (fila.test_aciertos !== null) de(fila.anio).tests += 1;
  }
  return resumen;
}
