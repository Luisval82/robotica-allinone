// Las calificaciones tal y como las ve el alumno: en qué estado está cada
// PRUEBA, qué se le puede enseñar de cada una y cuánto llevan de media sus
// evaluaciones.
//
// Aquí no se consulta nada ni se decide cuánto vale una prueba: la nota llega
// hecha de getCalificacionesDelAlumno, que la construye con la misma función
// que la matriz del profesor. Esto solo la ordena y decide qué se muestra.

import type { PruebaDelAlumno } from "@/lib/db";
import { mediaDeNotas } from "@/lib/informes";
import { testScore, type Course } from "@/lib/types";
import { getUnidadesDeCurso } from "@/lib/unidades";

/** Las 2 programaciones de la PRUEBA. */
export const PROGRAMACIONES_POR_PRUEBA = 2;

/**
 * El estado de una PRUEBA. Son los cuatro que el alumno necesita distinguir:
 *
 * - `corregida`   el profesor ha puntuado las dos programaciones: nota firme.
 * - `pendiente`   está entregada entera y espera la revisión del profesor.
 * - `sin-entregar` está disponible pero falta algo por entregar.
 * - `bloqueada`   todavía no la tiene abierta.
 */
export type EstadoPrueba = "corregida" | "pendiente" | "sin-entregar" | "bloqueada";

export interface PruebaCalificada {
  unidad: number;
  titulo: string;
  evaluacion: number | null;
  estado: EstadoPrueba;
  /**
   * La nota de la PRUEBA sobre 10. Solo tiene valor cuando está corregida:
   * mientras falte una programación por puntuar no hay nota que dar, y una
   * suma a medias presentada como nota sería engañarle.
   */
  nota: number | null;
  /**
   * El test sobre 10, que se corrige solo al entregarlo. Se puede enseñar en
   * cuanto existe —el alumno ya lo vio al entregar— aunque la prueba entera
   * siga pendiente del profesor.
   */
  test: number | null;
  aciertos: number | null;
  /** Lo que el profesor ha dado a cada programación, de 0 a 1. */
  programaciones: {
    practica: number;
    puntos: number | null;
    comentario: string;
    entregadaEn: string | null;
    corregidaEn: string | null;
  }[];
  /** Cuántas de las 2 programaciones ha entregado. */
  entregadas: number;
  /** Qué le falta por entregar, para poder decírselo en vez de callarlo. */
  falta: string[];
  /**
   * Si ahora mismo puede entrar a hacerla. Lo que falta se le dice igual
   * aunque esté cerrada, pero mandarle a la unidad solo si está abierta.
   */
  disponible: boolean;
}

export interface EvaluacionCalificada {
  numero: number;
  pruebas: PruebaCalificada[];
  /** Media de las pruebas CORREGIDAS de la evaluación. null si no hay ninguna. */
  media: number | null;
  corregidas: number;
  pendientes: number;
}

export interface Calificaciones {
  evaluaciones: EvaluacionCalificada[];
  /** Media de todas las pruebas corregidas del curso. */
  media: number | null;
  corregidas: number;
  pendientes: number;
  /** Las 9 pruebas del curso. */
  totales: number;
}

/**
 * El estado de una prueba.
 *
 * El orden importa, y no es el obvio: lo ya hecho va ANTES del bloqueo. Un
 * profesor puede cerrar una unidad cuando termina la evaluación, y si el
 * bloqueo ganara, la nota que el alumno ya se ganó desaparecería de su
 * pantalla y de su media. Bloqueada solo cuando no hay nada que enseñar.
 */
function estadoDe(prueba: PruebaDelAlumno): EstadoPrueba {
  if (prueba.nota.completa) return "corregida";

  // «Entregada» es la prueba entera: el test y las dos programaciones. Si
  // falta algo, lo que espera no es al profesor, es al alumno.
  const entera =
    prueba.nota.aciertos !== null && prueba.nota.entregadas === PROGRAMACIONES_POR_PRUEBA;
  if (entera) return "pendiente";

  // Lo mismo con una prueba a medias: si cierran la unidad, el test que el
  // alumno ya vio corregido no se le esconde. Bloqueada solo si no hay nada.
  const hayAlgo = prueba.nota.aciertos !== null || prueba.nota.entregadas > 0;
  if (!prueba.pruebaAbierta && !hayAlgo) return "bloqueada";
  return "sin-entregar";
}

function faltaDe(prueba: PruebaDelAlumno): string[] {
  const falta: string[] = [];
  if (prueba.nota.aciertos === null) falta.push("el test");
  const sinEntregar = PROGRAMACIONES_POR_PRUEBA - prueba.nota.entregadas;
  if (sinEntregar === 1) falta.push("1 programación");
  if (sinEntregar === 2) falta.push("las 2 programaciones");
  return falta;
}

/** Las calificaciones de un alumno, agrupadas por evaluación. */
export function calificacionesDeAlumno(
  pruebas: PruebaDelAlumno[],
  curso: Course,
): Calificaciones {
  const temario = getUnidadesDeCurso(curso);

  const calificadas: PruebaCalificada[] = pruebas.map((prueba) => {
    const delTemario = temario.find((u) => u.numero === prueba.unidad);
    const estado = estadoDe(prueba);

    return {
      unidad: prueba.unidad,
      titulo: delTemario?.titulo ?? `Unidad ${prueba.unidad}`,
      evaluacion: delTemario?.evaluacion ?? null,
      estado,
      nota: estado === "corregida" ? prueba.nota.final : null,
      test: prueba.nota.aciertos === null ? null : testScore(prueba.nota.aciertos),
      aciertos: prueba.nota.aciertos,
      programaciones: Array.from({ length: PROGRAMACIONES_POR_PRUEBA }, (_, i) => {
        const entrega = prueba.programaciones.find((p) => p.practica === i + 1);
        return {
          practica: i + 1,
          puntos: entrega?.puntos ?? null,
          comentario: entrega?.comentario ?? "",
          entregadaEn: entrega?.entregadaEn ?? null,
          corregidaEn: entrega?.corregidaEn ?? null,
        };
      }),
      entregadas: prueba.nota.entregadas,
      falta: estado === "sin-entregar" ? faltaDe(prueba) : [],
      disponible: prueba.pruebaAbierta,
    };
  });

  // Las evaluaciones salen del temario, no de partir nueve entre tres: si un
  // curso dejara de estar repartido en tres, aquí no se inventa ninguna.
  const numeros = [...new Set(calificadas.map((p) => p.evaluacion))]
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);

  const evaluaciones: EvaluacionCalificada[] = numeros.map((numero) => {
    const suyas = calificadas.filter((p) => p.evaluacion === numero);
    const corregidas = suyas.filter((p) => p.estado === "corregida");
    return {
      numero,
      pruebas: suyas,
      media: mediaDeNotas(corregidas.map((p) => p.nota ?? 0)),
      corregidas: corregidas.length,
      pendientes: suyas.filter((p) => p.estado === "pendiente").length,
    };
  });

  // La media global es la de las pruebas corregidas, no la media de las medias
  // de evaluación: con una evaluación a medias, esa segunda cuenta pesaría de
  // más la prueba suelta que ya tiene nota.
  const corregidas = calificadas.filter((p) => p.estado === "corregida");

  return {
    evaluaciones,
    media: mediaDeNotas(corregidas.map((p) => p.nota ?? 0)),
    corregidas: corregidas.length,
    pendientes: calificadas.filter((p) => p.estado === "pendiente").length,
    totales: calificadas.length,
  };
}
