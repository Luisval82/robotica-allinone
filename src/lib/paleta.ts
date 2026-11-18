// Paleta de bloques con la que el alumno compone sus entregas en una unidad.

import { ALL_BLOCKS, getBlockInfo, getCompanions, type BlockInfo } from "@/lib/bloques";
import type { Course, ProgramRow } from "@/lib/types";
import { getUnidad, getUnidadesAnteriores } from "@/lib/unidades";

export interface Paleta {
  /** Bloques de esta unidad que se pueden encajar en una pila. */
  propios: BlockInfo[];
  /** Bloques de unidades y cursos anteriores que también se pueden usar. */
  anteriores: BlockInfo[];
  /** Datos y preguntas (bloques redondeados y hexagonales): van dentro de los huecos. */
  huecos: BlockInfo[];
}

function isStackable(info: BlockInfo): boolean {
  return info.forma === "inicio" || info.forma === "pila";
}

export function getPaleta(curso: Course, numero: number): Paleta {
  const unidad = getUnidad(curso, numero);
  const vistos = new Set<string>();
  const propios: BlockInfo[] = [];
  const anteriores: BlockInfo[] = [];
  const huecos: BlockInfo[] = [];

  const add = (texto: string, destino: BlockInfo[]) => {
    for (const info of [getBlockInfo(texto), ...getCompanions(texto)]) {
      if (vistos.has(info.texto)) continue;
      vistos.add(info.texto);
      (isStackable(info) ? destino : huecos).push(info);
    }
  };

  for (const texto of unidad?.bloques ?? []) add(texto, propios);
  for (const anterior of getUnidadesAnteriores(curso, numero)) {
    for (const texto of anterior.bloques) add(texto, anteriores);
  }

  return { propios, anteriores, huecos };
}

/** Nombres de bloque que el servidor acepta en una entrega de esa unidad. */
export function getAllowedBlocks(curso: Course, numero: number): Set<string> {
  const { propios, anteriores } = getPaleta(curso, numero);
  return new Set([...propios, ...anteriores].map((info) => info.texto));
}

/**
 * Los bloques que se ofrecen en la mesa de trabajo de UNA práctica.
 *
 * No la paleta entera —que a estas alturas del curso son decenas de bloques y
 * solo hacen ruido—, sino los de la unidad más los que use su solución. Así
 * el cajón trae lo que hace falta para ese reto y deja sitio para resolverlo
 * de otra manera, que en los retos abiertos es justo lo que se busca.
 *
 * El bloque de inicio va siempre: todo programa empieza por él.
 */
export function getBloquesDePractica(
  curso: Course,
  numero: number,
  solucion: ProgramRow[] = [],
): string[] {
  const { propios, anteriores } = getPaleta(curso, numero);
  const permitidos = new Set([...propios, ...anteriores].map((info) => info.texto));

  const nombres = new Set<string>(["Cuando se inicia el programa"]);
  for (const info of propios) nombres.add(info.texto);
  for (const fila of solucion) {
    if (permitidos.has(fila.texto)) nombres.add(fila.texto);
  }
  // En el orden del catálogo, que es el de las categorías de la app.
  return ALL_BLOCKS.filter((info) => nombres.has(info.texto)).map((info) => info.texto);
}
