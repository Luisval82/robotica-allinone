// Paleta de bloques con la que el alumno compone sus entregas en una unidad.

import { getBlockInfo, getCompanions, type BlockInfo } from "@/lib/bloques";
import type { Course } from "@/lib/types";
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
