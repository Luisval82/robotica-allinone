// El análisis del informe individual: cuatro frases sobre cómo va el alumno
// y una orientación sobre si su nota encaja con su trabajo.
//
// ════════════════════════════════════════════════════════════════════════
//  LO QUE ESTO NO PUEDE SABER
//
//  La plataforma no guarda los accesos ni el tiempo que alguien pasa en una
//  pantalla: no hay historial de inicios de sesión, y `progreso` ni siquiera
//  lleva fecha. Lo único fechado es lo que se entrega.
//
//  Así que aquí «actividad» son entregas y días con entregas, y «dedicación»
//  son prácticas hechas, no horas. El informe lo dice en una línea en lugar
//  de dejar que parezca otra cosa. Si algún día hiciera falta de verdad, eso
//  se arregla registrando los accesos, no afinando este archivo.
// ════════════════════════════════════════════════════════════════════════
//
// Regla de fondo: CALLARSE antes que inventar. Una tendencia sacada de una
// unidad no es una tendencia, y una orientación de nota con un solo examen
// corregido no orienta nada: en esos casos esto devuelve «todavía no hay
// recorrido» y el profesor no lee un juicio que no se sostiene.

import type { ActividadAlumno, FilaMatriz } from "@/lib/db";
import type { InformeAlumno } from "@/lib/informes";

/** Mínimos por debajo de los cuales no se opina. */
const MINIMOS = {
  /** Unidades empezadas para hablar de tendencia. */
  unidadesParaTendencia: 3,
  /** Pruebas cerradas para orientar sobre la nota. */
  pruebasParaOrientar: 2,
  /** Alumnos en el curso para comparar a alguien con su clase. */
  claseParaComparar: 5,
};

/**
 * Hueco, en puntos sobre 10, a partir del cual se dice que la nota y el
 * trabajo no van juntos. Dos puntos es un 20 % de la escala: suficiente
 * para no saltar por el ruido de una práctica de más o de menos.
 */
const HUECO = 2;

export type Veredicto = "bien" | "regular" | "mal" | "sin-datos";

export interface Observacion {
  titulo: string;
  texto: string;
  veredicto: Veredicto;
}

export type Orientacion = "se-corresponde" | "mayor" | "menor" | "sin-datos";

export interface AnalisisAlumno {
  observaciones: Observacion[];
  orientacion: Orientacion;
  /** La frase que acompaña a la orientación. Siempre explica de dónde sale. */
  motivo: string;
}

function fecha(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(iso));
}

function numero(valor: number): string {
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(valor);
}

/** Las unidades en las que el alumno ha hecho algo. */
function empezadas(informe: InformeAlumno) {
  return informe.unidades.filter(
    (u) => u.teoria > 0 || u.practicasComprobadas > 0 || u.entregadas > 0 || u.test !== null,
  );
}

/**
 * El trabajo previo de una unidad, de 0 a 10, para poder compararlo con la
 * nota en la misma escala: la teoría vale 2 y cada una de las 4 prácticas,
 * otros 2.
 *
 * Se cuenta lo HECHO, no lo bien hecho. El parecido con la solución oficial
 * no entra aquí a propósito: la propia plataforma avisa de que no es una
 * nota —un programa distinto y correcto sale en naranja— y meterlo en una
 * orientación de calificación sería amplificar una señal que ya se sabe
 * imprecisa.
 */
function trabajoDeUnidad(unidad: InformeAlumno["unidades"][number]): number {
  return (unidad.teoriaCompleta ? 2 : 0) + unidad.practicasComprobadas * 2;
}

function observacionDeActividad(
  informe: InformeAlumno,
  actividad: ActividadAlumno,
  clase: FilaMatriz[],
): Observacion {
  if (actividad.dias === 0) {
    return {
      titulo: "Actividad",
      texto: "No ha entregado nada todavía: ni prácticas ni programaciones.",
      veredicto: "mal",
    };
  }

  const partes = [
    `${actividad.comprobadas} ${actividad.comprobadas === 1 ? "práctica" : "prácticas"}`,
    `${actividad.entregas} ${actividad.entregas === 1 ? "programación" : "programaciones"}`,
  ];
  if (actividad.borradores > 0) {
    partes.push(`${actividad.borradores} sin terminar`);
  }

  let texto =
    `${partes.join(", ")}, repartidas en ${actividad.dias} ` +
    `${actividad.dias === 1 ? "día" : "días"} distintos.`;
  if (actividad.ultima) texto += ` Lo último, el ${fecha(actividad.ultima)}.`;

  // La comparación con la clase solo tiene sentido si hay clase: en un grupo
  // de tres, «por encima de la media» no significa nada.
  let veredicto: Veredicto = "bien";
  if (clase.length >= MINIMOS.claseParaComparar) {
    const medias = clase.map((fila) => fila.porcentaje);
    const mediaClase = medias.reduce((t, v) => t + v, 0) / medias.length;
    const suyo = informe.fila.porcentaje;
    if (suyo < mediaClase - 15) {
      texto += ` Va por detrás de su clase (${suyo} % frente al ${Math.round(mediaClase)} % de media).`;
      veredicto = "mal";
    } else if (suyo > mediaClase + 15) {
      texto += ` Va por delante de su clase (${suyo} % frente al ${Math.round(mediaClase)} % de media).`;
    } else {
      texto += " Va al ritmo de su clase.";
      veredicto = "regular";
    }
  }

  return { titulo: "Actividad", texto, veredicto };
}

function observacionDeProgreso(informe: InformeAlumno): Observacion {
  const hechas = empezadas(informe);

  if (hechas.length < MINIMOS.unidadesParaTendencia) {
    return {
      titulo: "Progreso",
      texto:
        hechas.length === 0
          ? "Sin unidades empezadas, así que todavía no hay progreso del que hablar."
          : `Solo ha empezado ${hechas.length} ${hechas.length === 1 ? "unidad" : "unidades"}: ` +
            `hacen falta ${MINIMOS.unidadesParaTendencia} para ver si sube o baja.`,
      veredicto: "sin-datos",
    };
  }

  // Se parte en dos mitades por orden de unidad: lo de después frente a lo
  // de antes. Con el temario en orden, eso es la tendencia.
  const mitad = Math.floor(hechas.length / 2);
  const antes = hechas.slice(0, mitad);
  const despues = hechas.slice(hechas.length - mitad);
  const media = (lista: typeof hechas) =>
    lista.reduce((t, u) => t + u.porcentaje, 0) / Math.max(lista.length, 1);
  const diferencia = media(despues) - media(antes);

  const primera = hechas[0]?.unidad ?? 1;
  const ultima = hechas.at(-1)?.unidad ?? primera;

  if (diferencia <= -20) {
    return {
      titulo: "Progreso",
      texto:
        `A la baja: deja las últimas unidades más a medias que las primeras ` +
        `(${Math.round(media(antes))} % en las primeras, ${Math.round(media(despues))} % en las últimas).`,
      veredicto: "mal",
    };
  }
  if (diferencia >= 20) {
    return {
      titulo: "Progreso",
      texto:
        `Ascendente: termina más de lo que empezaba (${Math.round(media(antes))} % en las ` +
        `primeras unidades, ${Math.round(media(despues))} % en las últimas).`,
      veredicto: "bien",
    };
  }
  return {
    titulo: "Progreso",
    texto: `Constante de la UD ${primera} a la UD ${ultima}, sin altibajos marcados.`,
    veredicto: "regular",
  };
}

function observacionDeDedicacion(informe: InformeAlumno): Observacion {
  const hechas = empezadas(informe);
  if (hechas.length === 0) {
    return {
      titulo: "Dedicación a las prácticas",
      texto: "Sin prácticas empezadas.",
      veredicto: "sin-datos",
    };
  }

  const porUnidad =
    hechas.reduce((total, u) => total + u.practicasComprobadas, 0) / hechas.length;
  const sinTerminar = hechas.filter(
    (u) => u.practicasComprobadas > 0 && u.practicasComprobadas < 4,
  ).length;

  const detalle =
    `Hace ${numero(porUnidad)} de las 4 prácticas en las ${hechas.length} ` +
    `${hechas.length === 1 ? "unidad que ha empezado" : "unidades que ha empezado"}` +
    (sinTerminar > 0
      ? `, y deja ${sinTerminar} ${sinTerminar === 1 ? "unidad" : "unidades"} a medias.`
      : ".");

  // Con una o dos unidades se cuenta el dato, pero no se pone etiqueta:
  // llamar «escasa» a la dedicación de alguien que acaba de empezar la UD 1
  // es un juicio sin recorrido, y este papel lo lee su profesor.
  if (hechas.length < MINIMOS.unidadesParaTendencia) {
    return { titulo: "Dedicación a las prácticas", texto: detalle, veredicto: "sin-datos" };
  }

  if (porUnidad >= 3) {
    return { titulo: "Dedicación a las prácticas", texto: `Suficiente. ${detalle}`, veredicto: "bien" };
  }
  if (porUnidad >= 1.5) {
    return { titulo: "Dedicación a las prácticas", texto: `Irregular. ${detalle}`, veredicto: "regular" };
  }
  return { titulo: "Dedicación a las prácticas", texto: `Escasa. ${detalle}`, veredicto: "mal" };
}

/**
 * La comparación que sostiene la orientación: en las unidades donde SÍ hay
 * nota cerrada, cuánto trabajo previo había hecho y qué nota sacó.
 *
 * Compara lo comparable. Mirar el trabajo de las nueve unidades contra la
 * nota de dos no diría nada.
 */
function compararTrabajoYNota(informe: InformeAlumno) {
  const conNota = informe.unidades.filter((u) => u.completa && u.nota !== null);
  if (conNota.length === 0) return null;

  const trabajo = conNota.reduce((t, u) => t + trabajoDeUnidad(u), 0) / conNota.length;
  const nota = conNota.reduce((t, u) => t + (u.nota ?? 0), 0) / conNota.length;
  return { unidades: conNota.length, trabajo, nota, hueco: trabajo - nota };
}

function observacionDeNotas(informe: InformeAlumno): Observacion {
  const comparacion = compararTrabajoYNota(informe);
  if (!comparacion) {
    return {
      titulo: "Notas y trabajo",
      texto: "Todavía no hay ninguna PRUEBA corregida del todo con la que comparar.",
      veredicto: "sin-datos",
    };
  }

  const { unidades, trabajo, nota, hueco } = comparacion;
  const base =
    `En las ${unidades} ${unidades === 1 ? "unidad" : "unidades"} con nota cerrada hizo ` +
    `${numero(trabajo)} de 10 del trabajo previo y sacó ${numero(nota)} de media.`;

  if (hueco > HUECO) {
    return {
      titulo: "Notas y trabajo",
      texto: `${base} Trabaja más de lo que refleja su nota.`,
      veredicto: "regular",
    };
  }
  if (hueco < -HUECO) {
    return {
      titulo: "Notas y trabajo",
      texto: `${base} Saca mejor nota de la que hace pensar su trabajo en la plataforma.`,
      veredicto: "regular",
    };
  }
  return { titulo: "Notas y trabajo", texto: `${base} Van a la par.`, veredicto: "bien" };
}

/**
 * La orientación sobre la nota.
 *
 * Es una comparación entre dos números de la plataforma, no una
 * calificación: dice si lo que el alumno ha hecho y lo que ha sacado van
 * juntos. Con menos de dos PRUEBAS cerradas no se pronuncia.
 */
export function analizarAlumno(
  informe: InformeAlumno,
  actividad: ActividadAlumno,
  clase: FilaMatriz[],
): AnalisisAlumno {
  const observaciones = [
    observacionDeActividad(informe, actividad, clase),
    observacionDeProgreso(informe),
    observacionDeDedicacion(informe),
    observacionDeNotas(informe),
  ];

  const comparacion = compararTrabajoYNota(informe);

  if (!comparacion || comparacion.unidades < MINIMOS.pruebasParaOrientar) {
    return {
      observaciones,
      orientacion: "sin-datos",
      motivo:
        `Con ${comparacion?.unidades ?? 0} ${
          (comparacion?.unidades ?? 0) === 1 ? "PRUEBA cerrada" : "PRUEBAS cerradas"
        } no hay con qué orientar. Hacen falta al menos ${MINIMOS.pruebasParaOrientar}.`,
    };
  }

  const { unidades, trabajo, nota, hueco } = comparacion;
  const resumen = `${numero(trabajo)} de trabajo frente a ${numero(nota)} de nota en ${unidades} unidades`;

  if (hueco > HUECO) {
    return {
      observaciones,
      orientacion: "mayor",
      motivo: `${resumen}: hace el trabajo y la nota va por detrás. Merece una mirada.`,
    };
  }
  if (hueco < -HUECO) {
    return {
      observaciones,
      orientacion: "menor",
      motivo: `${resumen}: la nota va por delante del trabajo que consta en la plataforma.`,
    };
  }
  return {
    observaciones,
    orientacion: "se-corresponde",
    motivo: `${resumen}: lo que hace y lo que saca van juntos.`,
  };
}
