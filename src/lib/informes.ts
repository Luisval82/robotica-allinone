// Las cuentas de los informes: lo que se imprime, calculado una vez y en un
// sitio, para que el informe del alumno y el de la clase digan lo mismo.
//
// Aquí no se consulta nada: todo sale de la matriz de seguimiento
// (getMatrizSeguimiento), que ya trae el progreso, las notas y las prácticas
// de un curso entero en tres consultas.

import type { CeldaUnidad, FilaMatriz } from "@/lib/db";
import { getUnidadesDeCurso } from "@/lib/unidades";
import { MILESTONES_PER_UNIT, THEORY_STEPS, type Course } from "@/lib/types";

/** Una unidad en la tabla del informe. */
export interface UnidadDelInforme {
  unidad: number;
  titulo: string;
  evaluacion: number | null;
  /** Pasos de teoría leídos, de THEORY_STEPS. */
  teoria: number;
  teoriaCompleta: boolean;
  /** Cuántas de las 4 prácticas de programación ha dado por comprobadas. */
  practicasComprobadas: number;
  /** Aciertos del test, de 8. null = sin entregar. */
  test: number | null;
  /** Lo que el profesor ha dado a cada programación, de 0 a 1. */
  programaciones: (number | null)[];
  /** Cuántas de las 2 programaciones ha entregado. */
  entregadas: number;
  /** La nota de la PRUEBA sobre 10, con lo que haya hasta ahora. */
  nota: number | null;
  /** Están el test y las dos programaciones corregidas. */
  completa: boolean;
  /** Avance de la unidad, de 0 a 100: los cuatro hitos. */
  porcentaje: number;
}

/** El resumen de una evaluación: tres unidades. */
export interface EvaluacionDelInforme {
  numero: number;
  unidades: number[];
  /** Media de las pruebas COMPLETAS de la evaluación. null si no hay ninguna. */
  media: number | null;
  /** Avance medio de sus unidades, de 0 a 100. */
  porcentaje: number;
  /** Cuántas pruebas de la evaluación están cerradas del todo. */
  completas: number;
}

export interface InformeAlumno {
  fila: FilaMatriz;
  unidades: UnidadDelInforme[];
  evaluaciones: EvaluacionDelInforme[];
  /** Prácticas de programación comprobadas, de las 36 del curso. */
  practicasComprobadas: number;
  practicasTotales: number;
  /** Pruebas con nota cerrada, de 9. */
  pruebasCompletas: number;
}

function porcentajeDeUnidad(celda: CeldaUnidad): number {
  const hitos =
    (celda.teoria >= THEORY_STEPS ? 1 : 0) +
    (celda.prueba.aciertos !== null ? 1 : 0) +
    celda.prueba.entregadas;
  return Math.round((hitos / MILESTONES_PER_UNIT) * 100);
}

/**
 * La media de unas notas, redondeada a dos decimales. Vive aquí porque la
 * usan los informes del profesor y la pestaña de calificaciones del alumno,
 * y las dos tienen que redondear igual o el alumno verá un 7,34 donde su
 * profesor ve un 7,35.
 */
export function mediaDeNotas(valores: number[]): number | null {
  if (valores.length === 0) return null;
  const suma = valores.reduce((total, valor) => total + valor, 0);
  return Math.round((suma / valores.length) * 100) / 100;
}

/** Todo lo que necesita el informe de un alumno, a partir de su fila. */
export function informeDeAlumno(fila: FilaMatriz, curso: Course): InformeAlumno {
  const temario = getUnidadesDeCurso(curso);

  const unidades: UnidadDelInforme[] = fila.unidades.map((celda) => {
    const delTemario = temario.find((u) => u.numero === celda.unidad);
    return {
      unidad: celda.unidad,
      titulo: delTemario?.titulo ?? `Unidad ${celda.unidad}`,
      evaluacion: delTemario?.evaluacion ?? null,
      teoria: celda.teoria,
      teoriaCompleta: celda.teoria >= THEORY_STEPS,
      practicasComprobadas: celda.practicas.filter((p) => p.comprobada).length,
      test: celda.prueba.aciertos,
      programaciones: celda.prueba.practicas,
      entregadas: celda.prueba.entregadas,
      nota: celda.prueba.final,
      completa: celda.prueba.completa,
      porcentaje: porcentajeDeUnidad(celda),
    };
  });

  // Las evaluaciones salen del temario, no de dividir nueve entre tres: si
  // algún curso dejara de estar repartido en tres, aquí no se inventa nada.
  const numeros = [...new Set(unidades.map((u) => u.evaluacion))]
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);

  const evaluaciones: EvaluacionDelInforme[] = numeros.map((numero) => {
    const suyas = unidades.filter((u) => u.evaluacion === numero);
    const completas = suyas.filter((u) => u.completa);
    return {
      numero,
      unidades: suyas.map((u) => u.unidad),
      media: mediaDeNotas(completas.map((u) => u.nota ?? 0)),
      porcentaje: Math.round(
        suyas.reduce((total, u) => total + u.porcentaje, 0) / Math.max(suyas.length, 1),
      ),
      completas: completas.length,
    };
  });

  return {
    fila,
    unidades,
    evaluaciones,
    practicasComprobadas: unidades.reduce((total, u) => total + u.practicasComprobadas, 0),
    practicasTotales: unidades.length * 4,
    pruebasCompletas: unidades.filter((u) => u.completa).length,
  };
}

/** Un punto del gráfico: una unidad con su avance y su nota. */
export interface PuntoDeEvolucion {
  unidad: number;
  /** De 0 a 100. */
  porcentaje: number;
  /** De 0 a 10. null = todavía no hay nada que puntuar. */
  nota: number | null;
}

export function evolucionDeAlumno(informe: InformeAlumno): PuntoDeEvolucion[] {
  return informe.unidades.map((u) => ({
    unidad: u.unidad,
    porcentaje: u.porcentaje,
    nota: u.nota,
  }));
}

export interface InformeClase {
  curso: Course;
  alumnos: InformeAlumno[];
  /** Avance medio del grupo, de 0 a 100. */
  porcentaje: number;
  /** Media de las medias de los alumnos que tienen alguna prueba cerrada. */
  media: number | null;
  /** Programaciones de PRUEBA entregadas y sin corregir en todo el grupo. */
  porCorregir: number;
  /** Alumnos que todavía no han terminado la teoría de ninguna unidad. */
  sinEmpezar: number;
  evolucion: PuntoDeEvolucion[];
}

/**
 * El informe de un grupo: los alumnos uno a uno y, para el gráfico, la media
 * del grupo unidad por unidad.
 *
 * En la nota media de cada unidad solo entran las pruebas CERRADAS. Una
 * prueba a medias —el test hecho pero las programaciones sin corregir— daría
 * una media baja que no dice nada, y en un informe que alguien va a leer sin
 * poder preguntar eso es peor que no decir nada.
 */
export function informeDeClase(filas: FilaMatriz[], curso: Course): InformeClase {
  const alumnos = filas.map((fila) => informeDeAlumno(fila, curso));

  const evolucion: PuntoDeEvolucion[] = (alumnos[0]?.unidades ?? []).map((_, indice) => {
    const deLaUnidad = alumnos.map((a) => a.unidades[indice]);
    const cerradas = deLaUnidad.filter((u) => u?.completa).map((u) => u.nota ?? 0);
    return {
      unidad: deLaUnidad[0]?.unidad ?? indice + 1,
      porcentaje: Math.round(
        deLaUnidad.reduce((total, u) => total + (u?.porcentaje ?? 0), 0) /
          Math.max(deLaUnidad.length, 1),
      ),
      nota: mediaDeNotas(cerradas),
    };
  });

  const medias = alumnos
    .map((a) => a.fila.media)
    .filter((valor): valor is number => valor !== null);

  return {
    curso,
    alumnos,
    porcentaje: Math.round(
      alumnos.reduce((total, a) => total + a.fila.porcentaje, 0) / Math.max(alumnos.length, 1),
    ),
    media: mediaDeNotas(medias),
    porCorregir: alumnos.reduce((total, a) => total + a.fila.porCorregir, 0),
    sinEmpezar: alumnos.filter((a) => a.fila.porcentaje === 0).length,
    evolucion,
  };
}
