// Aula: alumnado, interruptores de unidades y pruebas, progreso, notas y entregas.

import "server-only";
import { getStore, type AccessRules } from "@/lib/db/store";
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

function classMap(acceso: AccessRules, kind: AccessKind): Record<string, boolean> {
  return kind === "unidad" ? acceso.claseUnidad : acceso.clasePrueba;
}

function studentMap(acceso: AccessRules, kind: AccessKind): Record<string, boolean> {
  return kind === "unidad" ? acceso.alumnoUnidad : acceso.alumnoPrueba;
}

function classValue(acceso: AccessRules, kind: AccessKind, course: Course, unidad: number): boolean {
  return classMap(acceso, kind)[`${course}:${unidad}`] ?? defaultOpen(kind, unidad);
}

/** Nota del test sobre 10 a partir de los aciertos (8 preguntas). */
export function testScore(aciertos: number): number {
  return Math.round((aciertos / TEST_QUESTIONS) * 1000) / 100;
}

// ── Alumnado ─────────────────────────────────────────────────────────────

export async function listStudents(course?: Course): Promise<PublicUser[]> {
  return getStore()
    .users.filter((user) => user.role === "alumno" && (course ? user.course === course : true))
    .map(toPublicUser)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

// ── Interruptores: unidades y PRUEBA UD-X ────────────────────────────────

export async function getClassAccess(course: Course): Promise<ClassUnitAccess[]> {
  const { acceso } = getStore();
  return UNIT_NUMBERS.map((unidad) => ({
    unidad,
    abierta: classValue(acceso, "unidad", course, unidad),
    pruebaInterruptor: classValue(acceso, "prueba", course, unidad),
  }));
}

export async function getStudentAccess(student: {
  id: string;
  course: Course;
}): Promise<StudentUnitAccess[]> {
  const { acceso, progreso } = getStore();

  return UNIT_NUMBERS.map((unidad) => {
    const key = `${student.id}:${unidad}`;
    const unidadPropia = acceso.alumnoUnidad[key];
    const pruebaPropia = acceso.alumnoPrueba[key];

    const abierta = unidadPropia ?? classValue(acceso, "unidad", student.course, unidad);
    const pruebaInterruptor = pruebaPropia ?? classValue(acceso, "prueba", student.course, unidad);
    const teoriaCompletada = progreso.some(
      (item) =>
        item.alumnoId === student.id && item.unidad === unidad && item.pasosTeoria >= THEORY_STEPS,
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
  const { acceso, users } = getStore();
  classMap(acceso, kind)[`${course}:${unidad}`] = abierta;

  const overrides = studentMap(acceso, kind);
  for (const user of users) {
    if (user.course === course) delete overrides[`${user.id}:${unidad}`];
  }
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
  const { acceso, users } = getStore();
  const student = users.find((user) => user.id === studentId && user.role === "alumno");
  if (!student || !student.course) return false;

  const overrides = studentMap(acceso, kind);
  const key = `${student.id}:${unidad}`;
  if (abierta === classValue(acceso, kind, student.course, unidad)) {
    delete overrides[key];
  } else {
    overrides[key] = abierta;
  }
  return true;
}

// ── Progreso y notas de los tests ────────────────────────────────────────

export async function getProgress(studentId: string): Promise<UnitProgress[]> {
  return getStore().progreso.filter((item) => item.alumnoId === studentId);
}

/** Avance de un alumno en una unidad (a cero si todavía no la ha empezado). */
export async function getUnitProgress(studentId: string, unidad: number): Promise<UnitProgress> {
  return (
    getStore().progreso.find((item) => item.alumnoId === studentId && item.unidad === unidad) ?? {
      alumnoId: studentId,
      unidad,
      pasosTeoria: 0,
      testAciertos: null,
      testRespuestas: null,
    }
  );
}

function ensureProgress(studentId: string, unidad: number): UnitProgress {
  const store = getStore();
  let item = store.progreso.find((p) => p.alumnoId === studentId && p.unidad === unidad);
  if (!item) {
    item = { alumnoId: studentId, unidad, pasosTeoria: 0, testAciertos: null, testRespuestas: null };
    store.progreso.push(item);
  }
  return item;
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
  const item = ensureProgress(studentId, unidad);
  if (paso !== item.pasosTeoria + 1 || paso > THEORY_STEPS) return false;
  item.pasosTeoria = paso;
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
  const item = ensureProgress(studentId, unidad);
  if (item.testAciertos !== null) return false;
  item.testAciertos = aciertos;
  item.testRespuestas = respuestas;
  return true;
}

export async function getStudentSummary(student: {
  id: string;
  course: Course;
}): Promise<StudentSummary> {
  const store = getStore();
  const progreso = store.progreso.filter((item) => item.alumnoId === student.id);
  const entregas = store.entregas.filter((item) => item.alumnoId === student.id);
  const acceso = await getStudentAccess(student);

  const tests = progreso.filter((item) => item.testAciertos !== null);
  const hitos =
    progreso.filter((item) => item.pasosTeoria >= THEORY_STEPS).length +
    tests.length +
    entregas.length;
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
  const { progreso } = getStore();
  const students = await listStudents(course);

  return students.map((alumno) => {
    const notas = UNIT_NUMBERS.map((unidad) => {
      const item = progreso.find((p) => p.alumnoId === alumno.id && p.unidad === unidad);
      return item && item.testAciertos !== null ? testScore(item.testAciertos) : null;
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
  const store = getStore();
  const students = await listStudents(filter.course);
  const byId = new Map(students.map((alumno) => [alumno.id, alumno]));

  const result: EntregaConAlumno[] = [];
  for (const entrega of store.entregas) {
    const alumno = byId.get(entrega.alumnoId);
    const corregida = entrega.nota !== null;
    if (alumno && corregida === (filter.estado === "corregidas")) result.push({ entrega, alumno });
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
  return getStore().entregas.find(
    (item) => item.alumnoId === studentId && item.unidad === unidad && item.practica === practica,
  );
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
  const store = getStore();
  const previa = store.entregas.find(
    (item) =>
      item.alumnoId === studentId && item.unidad === input.unidad && item.practica === input.practica,
  );
  if (previa?.nota != null) return "corregida";

  const ahora = new Date().toISOString();
  if (previa) {
    previa.bloques = input.bloques;
    previa.explicacion = input.explicacion;
    previa.entregadaEn = ahora;
  } else {
    store.entregas.push({
      id: crypto.randomUUID(),
      alumnoId: studentId,
      unidad: input.unidad,
      practica: input.practica,
      bloques: input.bloques,
      explicacion: input.explicacion,
      entregadaEn: ahora,
      nota: null,
      comentario: "",
      corregidaEn: null,
      corregidaPor: null,
    });
  }
  return "guardada";
}

/** Guarda la nota y el comentario del profesor. Devuelve false si la entrega no existe. */
export async function gradeEntrega(
  entregaId: string,
  correccion: { nota: number; comentario: string; profesor: string },
): Promise<boolean> {
  const entrega = getStore().entregas.find((item) => item.id === entregaId);
  if (!entrega) return false;

  entrega.nota = correccion.nota;
  entrega.comentario = correccion.comentario;
  entrega.corregidaEn = new Date().toISOString();
  entrega.corregidaPor = correccion.profesor;
  return true;
}
