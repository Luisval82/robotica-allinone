// Tipos compartidos por toda la plataforma (servidor y cliente).

export const ROLES = ["superadmin", "profesor", "alumno"] as const;
export type Role = (typeof ROLES)[number];

export const COURSES = ["1ESO", "2ESO", "3ESO"] as const;
export type Course = (typeof COURSES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  superadmin: "Superadmin",
  profesor: "Profesor",
  alumno: "Alumno",
};

export const COURSE_LABEL: Record<Course, string> = {
  "1ESO": "1º ESO",
  "2ESO": "2º ESO",
  "3ESO": "3º ESO",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isCourse(value: unknown): value is Course {
  return typeof value === "string" && (COURSES as readonly string[]).includes(value);
}

/** Usuario tal y como se guarda en la base de datos (nunca se envía al navegador). */
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  /**
   * Curso del alumno. Quien se registra y luego recibe el rol de Profesor
   * conserva su curso guardado (se usa si algún día vuelve a ser alumno).
   */
  course: Course | null;
  createdAt: string;
}

/** Usuario sin datos sensibles: lo que sí puede mostrarse en pantalla. */
export type PublicUser = Omit<User, "passwordHash">;

/** Datos mínimos de quien ha iniciado sesión (van dentro de la cookie firmada). */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  course: Course | null;
}

/** Usuario de prueba que se enseña en la pantalla de login. */
export interface DemoCredential {
  name: string;
  email: string;
  password: string;
  role: Role;
  course: Course | null;
}

/** Unidad didáctica del temario (src/data/unidades.json). */
export interface Unidad {
  curso: Course;
  numero: number;
  titulo: string;
  hardware: string;
  modelo: string;
}

// ── Aula: acceso a unidades, progreso y entregas ──────────────────────────

export const UNIT_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/** Cada test de «PRUEBA UD-X» tiene 8 preguntas; la nota es sobre 10. */
export const TEST_QUESTIONS = 8;

/** Qué abre o cierra un interruptor: la unidad entera o su PRUEBA final. */
export type AccessKind = "unidad" | "prueba";

/** Estado de una unidad para TODA la clase (un curso). */
export interface ClassUnitAccess {
  unidad: number;
  abierta: boolean;
  /** Interruptor del profesor para la PRUEBA UD-X de toda la clase. */
  pruebaInterruptor: boolean;
}

/** Estado de una unidad para UN alumno, ya combinado con el de su clase. */
export interface StudentUnitAccess {
  unidad: number;
  abierta: boolean;
  /** La PRUEBA está realmente accesible (unidad abierta + interruptor o teoría terminada). */
  pruebaAbierta: boolean;
  /** Interruptor del profesor para la PRUEBA (de la clase o individual). */
  pruebaInterruptor: boolean;
  /** La PRUEBA se abrió sola porque el alumno terminó la teoría. */
  pruebaPorTeoria: boolean;
  /** Este alumno tiene un ajuste propio, distinto al de su clase. */
  unidadIndividual: boolean;
  pruebaIndividual: boolean;
}

/** Avance de un alumno en una unidad. */
export interface UnitProgress {
  alumnoId: string;
  unidad: number;
  teoriaCompletada: boolean;
  /** Aciertos del test (0–8). null = todavía no lo ha entregado. */
  testAciertos: number | null;
}

/** Entrega de programación de un alumno (2 por unidad), que corrige el profesor. */
export interface Entrega {
  id: string;
  alumnoId: string;
  unidad: number;
  practica: 1 | 2;
  /** Lo que entrega el alumno: su programa de bloques de palabras, descrito. */
  texto: string;
  entregadaEn: string;
  /** Nota del profesor (0–10). null = pendiente de corregir. */
  nota: number | null;
  comentario: string;
  corregidaEn: string | null;
  corregidaPor: string | null;
}

/** Resumen de un alumno para el listado del profesor. */
export interface StudentSummary {
  /** Porcentaje del curso completado (teoría, test y 2 entregas de cada unidad). */
  porcentaje: number;
  unidadesAbiertas: number;
  testsHechos: number;
  /** Media de los tests entregados, sobre 10. null = ninguno todavía. */
  mediaTests: number | null;
  entregasPorCorregir: number;
}

/** Un bloque de palabras dentro de una solución oficial. */
export interface SolutionBlock {
  categoria: string;
  texto: string;
  /** Sangría: 0 = pila principal, 1 = dentro de un bucle o condición… */
  nivel: number;
}

/** Práctica de programación de una unidad, con su solución oficial (solo profesorado). */
export interface Practica {
  curso: Course;
  unidad: number;
  practica: 1 | 2;
  titulo: string;
  enunciado: string;
  solucion: SolutionBlock[];
  notas?: string;
}

/** Respuesta del formulario de corrección de una entrega. */
export interface GradeFormState {
  ok?: boolean;
  error?: string;
}
