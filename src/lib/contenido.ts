// Contenido redactado de las unidades (src/data/contenido/*.json).
//
// SOLO EN EL SERVIDOR. Estos archivos incluyen las respuestas correctas de los
// tests y las soluciones de las prácticas. Al alumno solo se le envía lo que
// devuelven las funciones «ForStudent»: nunca la respuesta ni la solución.

import "server-only";
import { CONTENIDOS } from "@/data/contenido";
import { isCourse, type Course, type Practica, type ProgramRow } from "@/lib/types";

export interface VideoScene {
  plano: string;
  locucion: string;
}

export interface BlockExplanation {
  texto: string;
  explicacion: string;
}

export interface BuildStep {
  titulo: string;
  texto: string;
}

interface TestQuestion {
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

interface RawPractica {
  titulo: string;
  enunciado: string;
  solucion: ProgramRow[];
  notas?: string;
}

export interface UnitContent {
  curso: Course;
  unidad: number;
  reto: string;
  video: {
    titulo: string;
    duracion: string;
    url?: string;
    enlaceOficial?: { titulo: string; url: string };
    escenas: VideoScene[];
  };
  bloques: BlockExplanation[];
  construccion: { piezas: string; pasos: BuildStep[] };
  test: TestQuestion[];
  practicas: RawPractica[];
}

const contenidos = (CONTENIDOS as { curso?: unknown }[]).filter((item): item is UnitContent =>
  isCourse(item.curso),
);

export function getContenido(curso: Course, unidad: number): UnitContent | null {
  return contenidos.find((item) => item.curso === curso && item.unidad === unidad) ?? null;
}

// ── Test ─────────────────────────────────────────────────────────────────

export interface StudentQuestion {
  pregunta: string;
  opciones: string[];
}

/** Preguntas del test SIN la respuesta correcta ni la explicación. */
export function getTestForStudent(curso: Course, unidad: number): StudentQuestion[] {
  return (getContenido(curso, unidad)?.test ?? []).map(({ pregunta, opciones }) => ({
    pregunta,
    opciones,
  }));
}

/** Corrige un test: devuelve el número de aciertos. */
export function gradeTest(curso: Course, unidad: number, respuestas: number[]): number {
  const test = getContenido(curso, unidad)?.test ?? [];
  return test.filter((pregunta, index) => respuestas[index] === pregunta.correcta).length;
}

export interface QuestionReview {
  elegida: number;
  correcta: number;
  explicacion: string;
}

/** Corrección pregunta a pregunta. Solo se usa cuando el alumno YA ha entregado. */
export function getTestReview(curso: Course, unidad: number, respuestas: number[]): QuestionReview[] {
  return (getContenido(curso, unidad)?.test ?? []).map((pregunta, index) => ({
    elegida: respuestas[index] ?? -1,
    correcta: pregunta.correcta,
    explicacion: pregunta.explicacion,
  }));
}

// ── Prácticas ────────────────────────────────────────────────────────────

export interface StudentPractica {
  practica: 1 | 2;
  titulo: string;
  enunciado: string;
}

/** Enunciados de las prácticas SIN la solución. */
export function getPracticasForStudent(curso: Course, unidad: number): StudentPractica[] {
  return (getContenido(curso, unidad)?.practicas ?? []).slice(0, 2).map((item, index) => ({
    practica: index === 0 ? 1 : 2,
    titulo: item.titulo,
    enunciado: item.enunciado,
  }));
}

/** Práctica completa, con solución oficial. Solo para el panel del profesor. */
export function getPractica(curso: Course, unidad: number, practica: 1 | 2): Practica | null {
  const item = getContenido(curso, unidad)?.practicas[practica - 1];
  return item ? { curso, unidad, practica, ...item } : null;
}

/** Cuántas de las 2 soluciones de una unidad están ya redactadas. */
export function countSoluciones(curso: Course, unidad: number): number {
  return Math.min(getContenido(curso, unidad)?.practicas.length ?? 0, 2);
}
