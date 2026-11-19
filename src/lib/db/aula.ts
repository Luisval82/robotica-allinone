// Aula: alumnado, interruptores de unidades y pruebas, progreso, notas y
// entregas. Todo contra Supabase (tablas class_access, student_access,
// progreso y entregas — ver supabase/schema.sql).

import "server-only";
import { getAnioActivo } from "@/lib/db/anios";
import {
  assertNoError,
  entregaFromRow,
  progresoFromRow,
  supabase,
  userFromRow,
  type EntregaRow,
  type ProgresoRow,
  type UserRow,
} from "@/lib/db/store";
import { toPublicUser } from "@/lib/db/users";
import { getPracticasIntermediasDeUnidad } from "@/lib/contenido";
import { nivelDeParecido, parecidoDeProgramas, type Nivel } from "@/lib/parecido";
import {
  TEST_QUESTIONS,
  THEORY_STEPS,
  UNIT_NUMBERS,
  type AccessKind,
  type ClassUnitAccess,
  type Course,
  type Entrega,
  type ProgramRow,
  type PublicUser,
  type StudentUnitAccess,
  type UnitProgress,
} from "@/lib/types";

/** Hitos que cuentan para el progreso de cada unidad: teoría, test y 2 entregas. */
const MILESTONES_PER_UNIT = 4;

// ── Reglas por defecto ───────────────────────────────────────────────────
// Por defecto solo la UD 1 está abierta y todas las PRUEBAS están cerradas.

function defaultOpen(kind: AccessKind, unidad: number): boolean {
  return kind === "unidad" ? unidad === 1 : false;
}

/** Nota del test sobre 10 a partir de los aciertos (8 preguntas). */
export function testScore(aciertos: number): number {
  return Math.round((aciertos / TEST_QUESTIONS) * 1000) / 100;
}

// ── Alumnado ─────────────────────────────────────────────────────────────

/**
 * Alumnado. Con `course` se limita a un curso; con una lista de cursos, a
 * esos (es lo que necesita el panel de un profesor, que ve solo los suyos).
 * Una lista vacía no devuelve a nadie.
 */
export async function listStudents(course?: Course | readonly Course[]): Promise<PublicUser[]> {
  let query = supabase.from("users").select("*").eq("role", "alumno");
  if (Array.isArray(course)) {
    if (course.length === 0) return [];
    query = query.in("course", course as string[]);
  } else if (typeof course === "string") {
    query = query.eq("course", course);
  }
  const { data, error } = await query;
  assertNoError(error, "listStudents");
  const rows = (data ?? []) as UserRow[];
  return rows.map((row) => toPublicUser(userFromRow(row))).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

// ── Interruptores: unidades y PRUEBA UD-X ────────────────────────────────

export async function getClassAccess(course: Course): Promise<ClassUnitAccess[]> {
  const { data, error } = await supabase
    .from("class_access")
    .select("unidad, kind, abierta")
    .eq("anio", await getAnioActivo())
    .eq("course", course);
  assertNoError(error, "getClassAccess");

  const map = new Map<string, boolean>();
  for (const row of data ?? []) map.set(`${row.kind}:${row.unidad}`, row.abierta);

  return UNIT_NUMBERS.map((unidad) => ({
    unidad,
    abierta: map.get(`unidad:${unidad}`) ?? defaultOpen("unidad", unidad),
    pruebaInterruptor: map.get(`prueba:${unidad}`) ?? defaultOpen("prueba", unidad),
  }));
}

export async function getStudentAccess(student: {
  id: string;
  course: Course;
}): Promise<StudentUnitAccess[]> {
  const anio = await getAnioActivo();
  const [classResult, studentResult, progresoResult] = await Promise.all([
    supabase
      .from("class_access")
      .select("unidad, kind, abierta")
      .eq("anio", anio)
      .eq("course", student.course),
    supabase
      .from("student_access")
      .select("unidad, kind, abierta")
      .eq("anio", anio)
      .eq("student_id", student.id),
    supabase
      .from("progreso")
      .select("unidad, pasos_teoria")
      .eq("anio", anio)
      .eq("alumno_id", student.id),
  ]);
  assertNoError(classResult.error, "getStudentAccess:class_access");
  assertNoError(studentResult.error, "getStudentAccess:student_access");
  assertNoError(progresoResult.error, "getStudentAccess:progreso");

  const classMap = new Map<string, boolean>();
  for (const row of classResult.data ?? []) classMap.set(`${row.kind}:${row.unidad}`, row.abierta);
  const studentMap = new Map<string, boolean>();
  for (const row of studentResult.data ?? []) studentMap.set(`${row.kind}:${row.unidad}`, row.abierta);
  const progresoRows = (progresoResult.data ?? []) as Pick<ProgresoRow, "unidad" | "pasos_teoria">[];

  function classValue(kind: AccessKind, unidad: number): boolean {
    return classMap.get(`${kind}:${unidad}`) ?? defaultOpen(kind, unidad);
  }

  return UNIT_NUMBERS.map((unidad) => {
    const unidadPropia = studentMap.get(`unidad:${unidad}`);
    const pruebaPropia = studentMap.get(`prueba:${unidad}`);

    const abierta = unidadPropia ?? classValue("unidad", unidad);
    const pruebaInterruptor = pruebaPropia ?? classValue("prueba", unidad);
    const teoriaCompletada = progresoRows.some(
      (item) => item.unidad === unidad && item.pasos_teoria >= THEORY_STEPS,
    );

    return {
      unidad,
      abierta,
      // La PRUEBA se abre al terminar la teoría, o antes si el profesor la abre.
      pruebaAbierta: abierta && (pruebaInterruptor || teoriaCompletada),
      pruebaInterruptor,
      pruebaPorTeoria: abierta && teoriaCompletada && !pruebaInterruptor,
      unidadIndividual: unidadPropia !== undefined,
      pruebaIndividual: pruebaPropia !== undefined,
    };
  });
}

/**
 * Interruptor GLOBAL: abre o cierra para toda la clase. Borra los ajustes
 * individuales de esa unidad, de modo que todo el curso queda igual.
 */
export async function setClassAccess(
  course: Course,
  unidad: number,
  kind: AccessKind,
  abierta: boolean,
): Promise<void> {
  const anio = await getAnioActivo();
  const { error: upsertError } = await supabase
    .from("class_access")
    .upsert({ anio, course, unidad, kind, abierta }, { onConflict: "anio,course,unidad,kind" });
  assertNoError(upsertError, "setClassAccess:upsert");

  const { data: students, error: studentsError } = await supabase
    .from("users")
    .select("id")
    .eq("role", "alumno")
    .eq("course", course);
  assertNoError(studentsError, "setClassAccess:students");

  const studentRows = (students ?? []) as { id: string }[];
  const ids = studentRows.map((row) => row.id);
  if (ids.length === 0) return;

  const { error: deleteError } = await supabase
    .from("student_access")
    .delete()
    .eq("anio", anio)
    .eq("unidad", unidad)
    .eq("kind", kind)
    .in("student_id", ids);
  assertNoError(deleteError, "setClassAccess:delete");
}

/**
 * Interruptor INDIVIDUAL: abre o cierra para un solo alumno. Si el valor
 * coincide con el de su clase, se quita el ajuste propio (vuelve a seguirla).
 * Devuelve false si el alumno no existe.
 */
export async function setStudentAccess(
  studentId: string,
  unidad: number,
  kind: AccessKind,
  abierta: boolean,
): Promise<boolean> {
  const anio = await getAnioActivo();
  const { data: student, error: studentError } = await supabase
    .from("users")
    .select("id, course")
    .eq("id", studentId)
    .eq("role", "alumno")
    .maybeSingle();
  assertNoError(studentError, "setStudentAccess:lookup");
  const alumno = student as { id: string; course: Course | null } | null;
  if (!alumno || !alumno.course) return false;

  const { data: classRow, error: classError } = await supabase
    .from("class_access")
    .select("abierta")
    .eq("anio", anio)
    .eq("course", alumno.course)
    .eq("unidad", unidad)
    .eq("kind", kind)
    .maybeSingle();
  assertNoError(classError, "setStudentAccess:class_access");
  const valorClase = (classRow as { abierta: boolean } | null)?.abierta ?? defaultOpen(kind, unidad);

  if (abierta === valorClase) {
    const { error } = await supabase
      .from("student_access")
      .delete()
      .eq("anio", anio)
      .eq("student_id", studentId)
      .eq("unidad", unidad)
      .eq("kind", kind);
    assertNoError(error, "setStudentAccess:delete");
  } else {
    const { error } = await supabase
      .from("student_access")
      .upsert(
        { anio, student_id: studentId, unidad, kind, abierta },
        { onConflict: "anio,student_id,unidad,kind" },
      );
    assertNoError(error, "setStudentAccess:upsert");
  }
  return true;
}

// ── Progreso y notas de los tests ────────────────────────────────────────

export async function getProgress(studentId: string): Promise<UnitProgress[]> {
  const { data, error } = await supabase
    .from("progreso")
    .select("*")
    .eq("anio", await getAnioActivo())
    .eq("alumno_id", studentId);
  assertNoError(error, "getProgress");
  const rows = (data ?? []) as ProgresoRow[];
  return rows.map((row) => progresoFromRow(row));
}

/** Avance de un alumno en una unidad (a cero si todavía no la ha empezado). */
export async function getUnitProgress(studentId: string, unidad: number): Promise<UnitProgress> {
  const { data, error } = await supabase
    .from("progreso")
    .select("*")
    .eq("anio", await getAnioActivo())
    .eq("alumno_id", studentId)
    .eq("unidad", unidad)
    .maybeSingle();
  assertNoError(error, "getUnitProgress");
  return data
    ? progresoFromRow(data as ProgresoRow)
    : { alumnoId: studentId, unidad, pasosTeoria: 0, testAciertos: null, testRespuestas: null };
}

/**
 * Marca como terminado un paso de teoría. Los pasos van en orden: solo se
 * acepta el siguiente al último terminado. Devuelve false si no tocaba ese paso.
 */
export async function completeTheoryStep(
  studentId: string,
  unidad: number,
  paso: number,
): Promise<boolean> {
  const actual = await getUnitProgress(studentId, unidad);
  if (paso !== actual.pasosTeoria + 1 || paso > THEORY_STEPS) return false;

  const { error } = await supabase.from("progreso").upsert(
    {
      anio: await getAnioActivo(),
      alumno_id: studentId,
      unidad,
      pasos_teoria: paso,
      test_aciertos: actual.testAciertos,
      test_respuestas: actual.testRespuestas,
    },
    { onConflict: "anio,alumno_id,unidad" },
  );
  assertNoError(error, "completeTheoryStep");
  return true;
}

/**
 * Guarda el resultado del test. Solo hay un intento: devuelve false si el
 * alumno ya lo había entregado.
 */
export async function saveTestResult(
  studentId: string,
  unidad: number,
  respuestas: number[],
  aciertos: number,
): Promise<boolean> {
  const actual = await getUnitProgress(studentId, unidad);
  if (actual.testAciertos !== null) return false;

  // Una nota sin sus respuestas no se puede desglosar después: si no vienen
  // todas, no se guarda nada y el alumno puede volver a entregar.
  if (respuestas.length !== TEST_QUESTIONS || respuestas.some((r) => r < 0)) {
    throw new Error(
      `saveTestResult: se esperaban ${TEST_QUESTIONS} respuestas y llegaron ${respuestas.length}.`,
    );
  }

  const { error } = await supabase.from("progreso").upsert(
    {
      anio: await getAnioActivo(),
      alumno_id: studentId,
      unidad,
      pasos_teoria: actual.pasosTeoria,
      test_aciertos: aciertos,
      test_respuestas: respuestas,
    },
    { onConflict: "anio,alumno_id,unidad" },
  );
  assertNoError(error, "saveTestResult");
  return true;
}

export interface NotaPrueba {
  unidad: number;
  /** Aciertos del test, de 0 a 8. Cada acierto vale 1 punto. null = sin entregar. */
  aciertos: number | null;
  /** Lo que el profesor da a cada programación: de 0 a 1 punto. null = sin corregir. */
  practicas: (number | null)[];
  /** Cuántas de las 2 programaciones ha entregado el alumno. */
  entregadas: number;
  /**
   * Lo que suma hasta ahora, sobre 10. Es null solo cuando no hay nada:
   * ni test entregado ni ninguna programación corregida.
   */
  final: number | null;
  /** Están el test y las dos programaciones corregidas: la nota es definitiva. */
  completa: boolean;
}

/**
 * La nota de una PRUEBA a partir de sus tres partes.
 *
 * La PRUEBA son 10 puntos de 1: las 8 preguntas del test, que se corrigen
 * solas al entregar, y las 2 programaciones que corrige el profesor. Por eso
 * aquí no se pondera nada: se suma.
 */
function construirNotaPrueba(
  unidad: number,
  aciertos: number | null,
  practicas: (number | null)[],
  entregadas: number,
): NotaPrueba {
  const corregidas = practicas.filter((p): p is number => p !== null);
  const hayAlgo = aciertos !== null || corregidas.length > 0;
  const suma = (aciertos ?? 0) + corregidas.reduce((total, p) => total + p, 0);

  return {
    unidad,
    aciertos,
    practicas,
    entregadas,
    final: hayAlgo ? Math.round(suma * 100) / 100 : null,
    completa: aciertos !== null && corregidas.length === 2,
  };
}

/** Una unidad de un alumno en la matriz de seguimiento. */
export interface CeldaUnidad {
  unidad: number;
  /** Pasos de teoría leídos, de THEORY_STEPS. */
  teoria: number;
  /**
   * Las 4 prácticas de programación de la unidad. El nivel sale de comparar
   * el programa del alumno con la solución oficial (src/lib/parecido.ts);
   * NO es una nota, y la pantalla lo avisa.
   */
  practicas: { practica: number; nivel: Nivel; parecido: number | null; comprobada: boolean }[];
  prueba: NotaPrueba;
}

export interface FilaMatriz {
  alumno: PublicUser;
  unidades: CeldaUnidad[];
  /** De 0 a 100: teoría, test y las 2 entregas de cada unidad. */
  porcentaje: number;
  /** Media de las pruebas completas. Las que están a medias no cuentan. */
  media: number | null;
  /** Programaciones de PRUEBA entregadas que el profesor no ha corregido. */
  porCorregir: number;
}

/**
 * Todo el seguimiento de un curso en una sola consulta por tabla.
 *
 * Antes esto eran tres pantallas con tres consultas que se pisaban: el
 * progreso, las notas de las pruebas y las prácticas. Al juntarlas en una
 * matriz, la consulta también se junta: tres SELECT para todo el curso en
 * lugar de tres por alumno.
 */
export async function getMatrizSeguimiento(course: Course): Promise<FilaMatriz[]> {
  const students = await listStudents(course);
  const ids = students.map((alumno) => alumno.id);
  if (ids.length === 0) return [];

  const anio = await getAnioActivo();

  type ProgresoFila = {
    alumno_id: string;
    unidad: number;
    pasos_teoria: number;
    test_aciertos: number | null;
  };
  type EntregaFila = {
    alumno_id: string;
    unidad: number;
    practica: number;
    puntos: number | null;
  };
  type IntermediaFila = {
    alumno_id: string;
    unidad: number;
    practica: number;
    bloques: ProgramRow[] | null;
    comprobada_en: string | null;
  };

  const [progreso, entregas, intermedias] = await Promise.all([
    supabase
      .from("progreso")
      .select("alumno_id, unidad, pasos_teoria, test_aciertos")
      .eq("anio", anio)
      .in("alumno_id", ids),
    supabase
      .from("entregas")
      .select("alumno_id, unidad, practica, puntos")
      .eq("anio", anio)
      .in("alumno_id", ids),
    supabase
      .from("practicas_intermedias")
      .select("alumno_id, unidad, practica, bloques, comprobada_en")
      .eq("anio", anio)
      .in("alumno_id", ids),
  ]);
  assertNoError(progreso.error, "getMatrizSeguimiento/progreso");
  assertNoError(entregas.error, "getMatrizSeguimiento/entregas");
  assertNoError(intermedias.error, "getMatrizSeguimiento/intermedias");

  const filasProgreso = (progreso.data ?? []) as ProgresoFila[];
  const filasEntregas = (entregas.data ?? []) as EntregaFila[];
  const filasIntermedias = (intermedias.data ?? []) as IntermediaFila[];

  // Las soluciones oficiales son contenido del repositorio, no de la base de
  // datos: se leen una vez por unidad y valen para todo el curso.
  const soluciones = new Map(
    UNIT_NUMBERS.map((unidad) => [unidad, getPracticasIntermediasDeUnidad(course, unidad)]),
  );

  return students.map((alumno) => {
    const unidades = UNIT_NUMBERS.map((unidad): CeldaUnidad => {
      const suProgreso = filasProgreso.find(
        (f) => f.alumno_id === alumno.id && f.unidad === unidad,
      );

      const puntos = [1, 2].map((numero) => {
        const fila = filasEntregas.find(
          (f) => f.alumno_id === alumno.id && f.unidad === unidad && f.practica === numero,
        );
        return fila?.puntos === null || fila?.puntos === undefined ? null : Number(fila.puntos);
      });
      const entregadas = filasEntregas.filter(
        (f) => f.alumno_id === alumno.id && f.unidad === unidad,
      ).length;

      const practicas = [1, 2, 3, 4].map((numero) => {
        const suya = filasIntermedias.find(
          (f) => f.alumno_id === alumno.id && f.unidad === unidad && f.practica === numero,
        );
        const oficial = soluciones.get(unidad)?.find((p) => p.practica === numero);
        const parecido =
          suya && oficial ? parecidoDeProgramas(suya.bloques ?? [], oficial.solucion) : null;
        return {
          practica: numero,
          parecido,
          nivel: nivelDeParecido(parecido),
          comprobada: suya?.comprobada_en != null,
        };
      });

      return {
        unidad,
        teoria: suProgreso?.pasos_teoria ?? 0,
        practicas,
        prueba: construirNotaPrueba(unidad, suProgreso?.test_aciertos ?? null, puntos, entregadas),
      };
    });

    // El mismo porcentaje de siempre: teoría, test y las 2 entregas por unidad.
    const hitos = unidades.reduce(
      (total, celda) =>
        total +
        (celda.teoria >= THEORY_STEPS ? 1 : 0) +
        (celda.prueba.aciertos !== null ? 1 : 0) +
        celda.prueba.entregadas,
      0,
    );
    const completas = unidades.filter((c) => c.prueba.completa).map((c) => c.prueba.final ?? 0);

    return {
      alumno,
      unidades,
      porcentaje: Math.round((hitos / (UNIT_NUMBERS.length * MILESTONES_PER_UNIT)) * 100),
      media:
        completas.length > 0
          ? Math.round((completas.reduce((t, n) => t + n, 0) / completas.length) * 100) / 100
          : null,
      porCorregir: unidades.reduce(
        (total, celda) =>
          total +
          (celda.prueba.entregadas - celda.prueba.practicas.filter((p) => p !== null).length),
        0,
      ),
    };
  });
}


// ── Entregas de programación ─────────────────────────────────────────────

export interface EntregaConAlumno {
  entrega: Entrega;
  alumno: PublicUser;
}

export type EntregaEstado = "pendientes" | "corregidas";

/**
 * Entregas de los alumnos actuales. Pendientes: primero la más antigua.
 * Corregidas: primero la corregida más recientemente.
 */
export async function listEntregas(filter: {
  estado: EntregaEstado;
  course?: Course | readonly Course[];
}): Promise<EntregaConAlumno[]> {
  const students = await listStudents(filter.course);
  const byId = new Map(students.map((alumno) => [alumno.id, alumno]));
  const ids = students.map((alumno) => alumno.id);
  if (ids.length === 0) return [];

  let query = supabase
    .from("entregas")
    .select("*")
    .eq("anio", await getAnioActivo())
    .in("alumno_id", ids);
  query =
    filter.estado === "corregidas"
      ? query.not("puntos", "is", null)
      : query.is("puntos", null);
  const { data, error } = await query;
  assertNoError(error, "listEntregas");

  const result: EntregaConAlumno[] = [];
  for (const row of (data ?? []) as EntregaRow[]) {
    const alumno = byId.get(row.alumno_id);
    if (alumno) result.push({ entrega: entregaFromRow(row), alumno });
  }

  return result.sort((a, b) =>
    filter.estado === "pendientes"
      ? a.entrega.entregadaEn.localeCompare(b.entrega.entregadaEn)
      : (b.entrega.corregidaEn ?? "").localeCompare(a.entrega.corregidaEn ?? ""),
  );
}

export async function getEntrega(
  studentId: string,
  unidad: number,
  practica: 1 | 2,
): Promise<Entrega | undefined> {
  const { data, error } = await supabase
    .from("entregas")
    .select("*")
    .eq("anio", await getAnioActivo())
    .eq("alumno_id", studentId)
    .eq("unidad", unidad)
    .eq("practica", practica)
    .maybeSingle();
  assertNoError(error, "getEntrega");
  return data ? entregaFromRow(data as EntregaRow) : undefined;
}

/**
 * Guarda la entrega de un alumno de la PRUEBA.
 *
 * Es definitiva: la PRUEBA se entrega una sola vez. Si ya hay una entrega,
 * esta función no escribe nada y devuelve "entregada". Se comprueba aquí, en
 * el servidor, porque el formulario se puede reenviar a mano.
 */
export async function saveEntrega(
  studentId: string,
  input: { unidad: number; practica: 1 | 2; bloques: ProgramRow[]; explicacion: string },
): Promise<"guardada" | "entregada" | "corregida"> {
  const previa = await getEntrega(studentId, input.unidad, input.practica);
  if (previa?.puntos != null) return "corregida";
  if (previa) return "entregada";

  const { error } = await supabase.from("entregas").upsert(
    {
      // Aquí no hay entrega previa: si la hubiera, ya habríamos salido arriba.
      id: crypto.randomUUID(),
      anio: await getAnioActivo(),
      alumno_id: studentId,
      unidad: input.unidad,
      practica: input.practica,
      bloques: input.bloques,
      explicacion: input.explicacion,
      entregada_en: new Date().toISOString(),
      puntos: null,
      comentario: "",
      corregida_en: null,
      corregida_por: null,
    },
    { onConflict: "anio,alumno_id,unidad,practica" },
  );
  assertNoError(error, "saveEntrega");
  return "guardada";
}

/**
 * De qué curso es una entrega, para comprobar si quien va a corregirla
 * imparte ese curso. Devuelve null si la entrega no existe.
 */
export async function getCursoDeEntrega(entregaId: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from("entregas")
    .select("alumno_id")
    .eq("id", entregaId)
    .maybeSingle();
  assertNoError(error, "getCursoDeEntrega:entrega");

  const fila = data as { alumno_id: string } | null;
  if (!fila) return null;

  const { data: alumno, error: errorAlumno } = await supabase
    .from("users")
    .select("course")
    .eq("id", fila.alumno_id)
    .maybeSingle();
  assertNoError(errorAlumno, "getCursoDeEntrega:alumno");
  return ((alumno as { course: Course | null } | null)?.course) ?? null;
}

/** Guarda la nota y el comentario del profesor. Devuelve false si la entrega no existe. */
export async function gradeEntrega(
  entregaId: string,
  correccion: { puntos: number; comentario: string; profesor: string },
): Promise<boolean> {
  const { data, error } = await supabase
    .from("entregas")
    .update({
      puntos: correccion.puntos,
      comentario: correccion.comentario,
      corregida_en: new Date().toISOString(),
      corregida_por: correccion.profesor,
    })
    .eq("id", entregaId)
    .select("id")
    .maybeSingle();
  assertNoError(error, "gradeEntrega");
  return data !== null;
}

// ── Prácticas intermedias ────────────────────────────────────────────────
// Los 4 retos cortos de cada unidad. No llevan nota: el alumno los monta, los
// guarda y los prueba en el Hub con la app del iPad.

export interface PracticaIntermediaEntrega {
  practica: number;
  bloques: ProgramRow[];
  explicacion: string;
  entregadaEn: string;
  /** Con fecha, el alumno la dio por terminada y ya no se puede cambiar. */
  comprobadaEn: string | null;
}

/** Lo que el alumno lleva guardado de las prácticas intermedias de una unidad. */
export async function getPracticasIntermedias(
  studentId: string,
  unidad: number,
): Promise<PracticaIntermediaEntrega[]> {
  const { data, error } = await supabase
    .from("practicas_intermedias")
    .select("practica, bloques, explicacion, entregada_en, comprobada_en")
    .eq("anio", await getAnioActivo())
    .eq("alumno_id", studentId)
    .eq("unidad", unidad)
    .order("practica");
  assertNoError(error, "getPracticasIntermedias");

  return (data ?? []).map((fila) => ({
    practica: fila.practica as number,
    bloques: (fila.bloques ?? []) as ProgramRow[],
    explicacion: (fila.explicacion ?? "") as string,
    entregadaEn: fila.entregada_en as string,
    comprobadaEn: (fila.comprobada_en ?? null) as string | null,
  }));
}

/** Cuántas prácticas intermedias lleva guardadas el alumno en cada unidad. */
export async function getPracticasIntermediasCount(
  studentId: string,
): Promise<Map<number, number>> {
  const { data, error } = await supabase
    .from("practicas_intermedias")
    .select("unidad")
    .eq("anio", await getAnioActivo())
    .eq("alumno_id", studentId);
  assertNoError(error, "getPracticasIntermediasCount");

  const porUnidad = new Map<number, number>();
  for (const fila of (data ?? []) as { unidad: number }[]) {
    porUnidad.set(fila.unidad, (porUnidad.get(fila.unidad) ?? 0) + 1);
  }
  return porUnidad;
}

/**
 * Guarda una práctica intermedia.
 *
 * Con `comprobar`, el alumno da la práctica por terminada: se queda con fecha
 * en `comprobada_en` y a partir de ahí NO se puede volver a tocar. El cierre
 * se comprueba aquí, en el servidor: si ya estaba comprobada, esta función no
 * escribe nada y devuelve "cerrada". Deshabilitar los campos en pantalla no
 * basta, porque el formulario se puede reenviar a mano.
 */
export async function savePracticaIntermedia(
  studentId: string,
  input: {
    unidad: number;
    practica: number;
    bloques: ProgramRow[];
    explicacion: string;
    comprobar: boolean;
  },
): Promise<"guardada" | "comprobada" | "cerrada"> {
  const anio = await getAnioActivo();

  const { data: previa, error: errorPrevia } = await supabase
    .from("practicas_intermedias")
    .select("comprobada_en")
    .eq("anio", anio)
    .eq("alumno_id", studentId)
    .eq("unidad", input.unidad)
    .eq("practica", input.practica)
    .maybeSingle();
  assertNoError(errorPrevia, "savePracticaIntermedia:previa");
  if ((previa as { comprobada_en: string | null } | null)?.comprobada_en) return "cerrada";

  const ahora = new Date().toISOString();
  const { error } = await supabase.from("practicas_intermedias").upsert(
    {
      anio,
      alumno_id: studentId,
      unidad: input.unidad,
      practica: input.practica,
      bloques: input.bloques,
      explicacion: input.explicacion,
      entregada_en: ahora,
      comprobada_en: input.comprobar ? ahora : null,
    },
    { onConflict: "anio,alumno_id,unidad,practica" },
  );
  assertNoError(error, "savePracticaIntermedia");
  return input.comprobar ? "comprobada" : "guardada";
}

/**
 * El profesor reabre una práctica que el alumno comprobó por error. Se queda
 * el programa que había guardado; solo vuelve a poder cambiarlo.
 */
export async function reabrirPracticaIntermedia(
  alumnoId: string,
  unidad: number,
  practica: number,
): Promise<void> {
  const { error } = await supabase
    .from("practicas_intermedias")
    .update({ comprobada_en: null })
    .eq("anio", await getAnioActivo())
    .eq("alumno_id", alumnoId)
    .eq("unidad", unidad)
    .eq("practica", practica);
  assertNoError(error, "reabrirPracticaIntermedia");
}
