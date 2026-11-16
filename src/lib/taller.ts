// Traduce el catálogo de bloques (src/data/bloques.json) a definiciones de
// Blockly, para que el taller use los mismos bloques que el resto de la
// plataforma y no haya que escribirlos dos veces.
//
// Blockly se dibuja con el renderizador «zelos», que es el diseño de bloques
// de Scratch 3 — el mismo que usa la app de SPIKE.

import { ALL_BLOCKS, CATEGORY_HEX, isFillable, type BlockInfo, type BlockPart } from "@/lib/bloques";
import type { ProgramRow } from "@/lib/types";

/** Un id válido para Blockly a partir del nombre del bloque. */
export function blockId(texto: string): string {
  return (
    "spike_" +
    texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
  );
}

interface CampoBlockly {
  type: string;
  name: string;
  options?: [string, string][];
  text?: string;
  value?: number;
  colour?: string;
}

interface DefinicionBlockly {
  type: string;
  message0: string;
  args0: CampoBlockly[];
  colour: string;
  tooltip: string;
  inputsInline: true;
  previousStatement?: null;
  nextStatement?: null;
  output?: string;
}

function campo(parte: BlockPart, indice: number): CampoBlockly {
  const name = `H${indice}`;
  if (parte.t === "menu") {
    const opciones = parte.opciones?.length ? parte.opciones : [parte.v];
    return { type: "field_dropdown", name, options: opciones.map((o) => [o, o]) };
  }
  if (parte.t === "color") {
    return { type: "field_input", name, text: parte.v };
  }
  // Hueco: número si lo es, y si no texto libre (admite variables y fórmulas).
  const numero = Number(parte.v.replace(",", "."));
  return Number.isFinite(numero)
    ? { type: "field_number", name, value: numero }
    : { type: "field_input", name, text: parte.v };
}

/** La definición de un bloque del catálogo, tal como la espera Blockly. */
export function definicionDe(info: BlockInfo): DefinicionBlockly {
  const colores = CATEGORY_HEX[info.categoria] ?? CATEGORY_HEX.control;
  const args0: CampoBlockly[] = [];
  let message0 = "";

  if (info.partes) {
    for (const parte of info.partes) {
      if (parte.t === "icono") continue;
      if (parte.t === "palabra") {
        message0 += `${parte.v} `;
        continue;
      }
      args0.push(campo(parte, args0.length));
      message0 += `%${args0.length} `;
    }
  } else {
    // Bloques que todavía no están pieza a pieza: su nombre y un hueco libre.
    message0 = `${info.texto} %1 `;
    args0.push({ type: "field_input", name: "H0", text: " " });
  }

  const def: DefinicionBlockly = {
    type: blockId(info.texto),
    message0: message0.trim(),
    args0,
    colour: colores.bloque,
    tooltip: info.texto,
    inputsInline: true,
  };

  if (info.forma === "dato") def.output = "Number";
  else if (info.forma === "pregunta") def.output = "Boolean";
  else if (info.forma === "inicio") def.nextStatement = null;
  else {
    def.previousStatement = null;
    def.nextStatement = null;
  }
  return def;
}

/** Todas las definiciones del catálogo. */
export function definiciones(): DefinicionBlockly[] {
  return ALL_BLOCKS.map(definicionDe);
}

/** Estilos de bloque por categoría, para el tema de Blockly. */
export function estilosPorCategoria(): Record<
  string,
  { colourPrimary: string; colourSecondary: string; colourTertiary: string }
> {
  const estilos: Record<
    string,
    { colourPrimary: string; colourSecondary: string; colourTertiary: string }
  > = {};
  for (const [id, { bloque, ficha }] of Object.entries(CATEGORY_HEX)) {
    estilos[id] = { colourPrimary: bloque, colourSecondary: ficha, colourTertiary: ficha };
  }
  return estilos;
}

/** Cuántos huecos rellenables tiene un bloque (para leer sus valores). */
export function numeroDeHuecos(info: BlockInfo): number {
  return info.partes ? info.partes.filter(isFillable).length : 1;
}

/** El id de Blockly de cada bloque del catálogo, por su nombre. */
export const ID_POR_TEXTO = new Map(ALL_BLOCKS.map((info) => [info.texto, blockId(info.texto)]));

/** El nombre del catálogo a partir del id de Blockly. */
export const TEXTO_POR_ID = new Map(ALL_BLOCKS.map((info) => [blockId(info.texto), info.texto]));

/** Una fila de programa a partir de un bloque del taller. */
export function filaDeBloque(
  id: string,
  valores: string[],
  nivel: number,
): ProgramRow | null {
  const texto = TEXTO_POR_ID.get(id);
  if (!texto) return null;
  return { texto, valores, nivel };
}
