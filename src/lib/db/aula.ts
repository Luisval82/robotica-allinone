// Aula: alumnado, interruptores de unidades y pruebas, progreso, notas y
// entregas. Todo contra Supabase (tablas class_access, student_access,
// progreso y entregas — ver supabase/schema.sql).

import "server-only";
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
  type StudentSummary,
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

export async function listStudents(course?: Course): Promise<PublicUser[]> {
  let query = supabase.from("users").select("*").eq("role", "alumno");
  if (course) query = query.eq("course", course);
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
  const [classResult, studentResult, progresoResult] = await Promise.all([
    supabase.from("class_access").select("unidad, kind, abierta").eq("course", student.course),
    supabase.from("student_access").select("unidad, kind, abierta").eq("student_id", student.id),
    supabase.from("progreso").select("unidad, pasos_teoria").eq("alumno_id", student.id),
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
  const { error: upsertError } = await supabase
    .from("class_access")
    .upsert({ course, unidad, kind, abierta }, { onConflict: "course,unidad,kind" });
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
      .eq("student_id", studentId)
      .eq("unidad", unidad)
      .eq("kind", kind);
    assertNoError(error, "setStudentAccess:delete");
  } else {
    const { error } = await supabase
      .from("student_access")
      .upsert(
        { student_id: studentId, unidad, kind, abierta },
        { onConflict: "student_id,unidad,kind" },
      );
    assertNoError(error, "setStudentAccess:upsert");
  }
  return true;
}

// ── Progreso y notas de los tests ────────────────────────────────────────

export async function getProgress(studentId: string): Promise<UnitProgress[]> {
  const { data, error } = await supabase.from("progreso").select("*").eq("alumno_id", studentId);
  assertNoError(error, "getProgress");
  const rows = (data ?? []) as ProgresoRow[];
  return rows.map((row) => progresoFromRow(row));
}

/** Avance de un alumno en una unidad (a cero si todavía no la ha empezado). */
export async function getUnitProgress(studentId: string, unidad: number): Promise<UnitProgress> {
  const { data, error } = await supabase
    .from("progreso")
    .select("*")
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
      alumno_id: studentId,
      unidad,
      pasos_teoria: paso,
      test_aciertos: actual.testAciertos,
      test_respuestas: actual.testRespuestas,
    },
    { onConflict: "alumno_id,unidad" },
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

  const { error } = await supabase.from("progreso").upsert(
    {
      alumno_id: studentId,
      unidad,
      pasos_teoria: actual.pasosTeoria,
      test_aciertos: aciertos,
      test_respuestas: respuestas,
    },
    { onConflict: "alumno_id,unidad" },
  );
  assertNoError(error, "saveTestResult");
  return true;
}

export async function getStudentSummary(student: {
  id: string;
  course: Course;
}): Promise<StudentSummary> {
  async function getEntregaNotas(): Promise<{ nota: number | null }[]> {
    const { data, error } = await supabase.from("entregas").select("nota").eq("alumno_id", student.id);
    assertNoError(error, "getStudentSummary:entregas");
    return (data ?? []) as { nota: number | null }[];
  }

  const [progreso, acceso, entregas] = await Promise.all([
    getProgress(student.id),
    getStudentAccess(student),
    getEntregaNotas(),
  ]);

  const tests = progreso.filter((item) => item.testAciertos !== null);
  const hitos =
    progreso.filter((item) => item.pasosTeoria >= THEORY_STEPS).length + tests.length + entregas.length;
  const sumaNotas = tests.reduce((total, item) => total + testScore(item.testAciertos ?? 0), 0);

  return {
    porcentaje: Math.round((hitos / (UNIT_NUMBERS.length * MILESTONES_PER_UNIT)) * 100),
    unidadesAbiertas: acceso.filter((item) => item.abierta).length,
    testsHechos: tests.length,
    mediaTests: tests.length > 0 ? Math.round((sumaNotas / tests.length) * 100) / 100 : null,
    entregasPorCorregir: entregas.filter((item) => item.nota === null).length,
  };
}

export interface StudentWithSummary {
  alumno: PublicUser;
  resumen: StudentSummary;
}

export async function listStudentsWithSummary(course: Course): Promise<StudentWithSummary[]> {
  const students = await listStudents(course);
  return Promise.all(
    students.map(async (alumno) => ({
      alumno,
      resumen: await getStudentSummary({ id: alumno.id, course }),
    })),
  );
}

export interface StudentTestScores {
  alumno: PublicUser;
  /** Nota sobre 10 de cada unidad (posición 0 = UD 1). null = test sin entregar. */
  notas: (number | null)[];
  media: number | null;
}

/** Notas automáticas de los tests de un curso: una fila por alumno. */
export async function getTestScores(course: Course): Promise<StudentTestScores[]> {
  const students = await listStudents(course);
  const ids = students.map((alumno) => alumno.id);

  type ScoreRow = { alumno_id: string; unidad: number; test_aciertos: number | null };
  let rows: ScoreRow[] = [];
  if (ids.length > 0) {
    const { data, error } = await supabase
      .from("progreso")
      .select("alumno_id, unidad, test_aciertos")
      .in("alumno_id", ids);
    assertNoError(error, "getTestScores");
    rows = (data ?? []) as ScoreRow[];
  }

  return students.map((alumno) => {
    const notas = UNIT_NUMBERS.map((unidad) => {
      const item = rows.find((p) => p.alumno_id === alumno.id && p.unidad === unidad);
      return item && item.test_aciertos !== null ? testScore(item.test_aciertos) : null;
    });
    const hechas = notas.filter((nota): nota is number => nota !== null);
    const media =
      hechas.length > 0
        ? Math.round((hechas.reduce((total, nota) => total + nota, 0) / hechas.length) * 100) / 100
        : null;
    return { alumno, notas, media };
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
  course?: Course;
}): Promise<EntregaConAlumno[]> {
  const students = await listStudents(filter.course);
  const byId = new Map(students.map((alumno) => [alumno.id, alumno]));
  const ids = students.map((alumno) => alumno.id);
  if (ids.length === 0) return [];

  let query = supabase.from("entregas").select("*").in("alumno_id", ids);
  query = filter.estado === "corregidas" ? query.not("nota", "is", null) : query.is("nota", null);
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
    .eq("alumno_id", studentId)
    .eq("unidad", unidad)
    .eq("practica", practica)
    .maybeSingle();
  assertNoError(error, "getEntrega");
  return data ? entregaFromRow(data as EntregaRow) : undefined;
}

/**
 * Guarda la entrega de un alumno. Mientras el profesor no la haya corregido,
 * una entrega nueva sustituye a la anterior. Devuelve "corregida" si ya tiene
 * nota y, por tanto, no se puede cambiar.
 */
export async function saveEntrega(
  studentId: string,
  input: { unidad: number; practica: 1 | 2; bloques: ProgramRow[]; explicacion: string },
): Promise<"guardada" | "corregida"> {
  const previa = await getEntrega(studentId, input.unidad, input.practica);
  if (previa?.nota != null) return "corregida";

  const { error } = await supabase.from("entregas").upsert(
    {
      id: previa?.id ?? crypto.randomUUID(),
      alumno_id: studentId,
      unidad: input.unidad,
      practica: input.practica,
      bloques: input.bloques,
      explicacion: input.explicacion,
      entregada_en: new Date().toISOString(),
      nota: null,
      comentario: "",
      corregida_en: null,
      corregida_por: null,
    },
    { onConflict: "alumno_id,unidad,practica" },
  );
  assertNoError(error, "saveEntrega");
  return "guardada";
}

/** Guarda la nota y el comentario del profesor. Devuelve false si la entrega no existe. */
export async function gradeEntrega(
  entregaId: string,
  correccion: { nota: number; comentario: string; profesor: string },
): Promise<boolean> {
  const { data, error } = await supabase
    .from("entregas")
    .update({
      nota: correccion.nota,
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
