// Catálogo de bloques de palabras (src/data/bloques.json): categoría, forma y color.
// No contiene nada secreto: se usa igual en el servidor y en el navegador.

import data from "@/data/bloques.json";

export type BlockShape = "inicio" | "pila" | "pregunta" | "dato";

export interface BlockInfo {
  texto: string;
  categoria: string;
  forma: BlockShape;
}

/** Color de cada categoría (ver --color-block-* en src/app/globals.css). */
const CATEGORY_CLASS: Record<string, string> = {
  eventos: "bg-block-eventos",
  motores: "bg-block-motores",
  movimiento: "bg-block-movimiento",
  luz: "bg-block-luz",
  sonido: "bg-block-sonido",
  control: "bg-block-control",
  sensores: "bg-block-sensores",
  operadores: "bg-block-operadores",
  variables: "bg-block-variables",
  misbloques: "bg-block-misbloques",
  extensiones: "bg-block-extensiones",
};

const SHAPE_CLASS: Record<BlockShape, string> = {
  inicio: "word-block--inicio",
  pila: "",
  pregunta: "word-block--pregunta",
  dato: "word-block--dato",
};

function toShape(value: string): BlockShape {
  return value === "inicio" || value === "pregunta" || value === "dato" ? value : "pila";
}

const catalog = new Map<string, BlockInfo>();
for (const item of [...data.bloques, ...data.auxiliares]) {
  catalog.set(item.texto, {
    texto: item.texto,
    categoria: item.categoria,
    forma: toShape(item.forma),
  });
}

export const BLOCK_CATEGORIES: { id: string; nombre: string }[] = data.categorias;

export function categoryName(id: string): string {
  return BLOCK_CATEGORIES.find((item) => item.id === id)?.nombre ?? id;
}

/** Datos de un bloque. Si el nombre no está en el catálogo, se pinta como bloque de control. */
export function getBlockInfo(texto: string): BlockInfo {
  return catalog.get(texto) ?? { texto, categoria: "control", forma: "pila" };
}

export function isKnownBlock(texto: string): boolean {
  return catalog.has(texto);
}

/** Clases CSS de un bloque: forma + color de su categoría. El texto va siempre en tinta oscura. */
export function blockClass(info: { categoria: string; forma: BlockShape }): string {
  return `word-block ${SHAPE_CLASS[info.forma]} ${
    CATEGORY_CLASS[info.categoria] ?? CATEGORY_CLASS.control
  } text-ink-900`;
}

export function categoryColorClass(categoria: string): string {
  return CATEGORY_CLASS[categoria] ?? CATEGORY_CLASS.control;
}

/** Piezas que acompañan a un bloque: la rama «Si no», y definir y usar un bloque propio. */
export function getCompanions(texto: string): BlockInfo[] {
  return data.auxiliares
    .filter((item) => item.acompana === texto)
    .map((item) => getBlockInfo(item.texto));
}
