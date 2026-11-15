// Prácticas y soluciones oficiales (src/data/practicas.json).
// Solo en el servidor y solo para el profesorado: nunca se importa en la zona de alumno.

import "server-only";
import data from "@/data/practicas.json";
import { isCourse, type Course, type Practica, type SolutionBlock } from "@/lib/types";

interface RawPractica {
  curso: string;
  unidad: number;
  practica: number;
  titulo: string;
  enunciado: string;
  solucion: SolutionBlock[];
  notas?: string;
}

function toPractica(raw: RawPractica): Practica | null {
  if (!isCourse(raw.curso)) return null;
  return {
    curso: raw.curso,
    unidad: raw.unidad,
    practica: raw.practica === 2 ? 2 : 1,
    titulo: raw.titulo,
    enunciado: raw.enunciado,
    solucion: raw.solucion,
    notas: raw.notas,
  };
}

const practicas: Practica[] = (data.practicas as RawPractica[])
  .map(toPractica)
  .filter((item): item is Practica => item !== null);

export function getPractica(curso: Course, unidad: number, practica: 1 | 2): Practica | null {
  return (
    practicas.find(
      (item) => item.curso === curso && item.unidad === unidad && item.practica === practica,
    ) ?? null
  );
}

/** Cuántas de las 2 soluciones de una unidad están ya redactadas. */
export function countSoluciones(curso: Course, unidad: number): number {
  return practicas.filter((item) => item.curso === curso && item.unidad === unidad).length;
}
