// Catálogo de bloques de palabras (src/data/bloques.json): categoría, forma y color.
// No contiene nada secreto: se usa igual en el servidor y en el navegador.

import data from "@/data/bloques.json";

export type BlockShape = "inicio" | "pila" | "pregunta" | "dato";

/**
 * Las piezas de dentro de un bloque, en el orden en que se leen:
 *   icono   → el dibujo redondo de la izquierda (motor, rueda, sensor…)
 *   menu    → desplegable (puerto, unidad, sentido): ficha oscura con ▾
 *   palabra → texto fijo del bloque
 *   hueco   → valor que se escribe (segundos, grados, %): óvalo blanco
 *   color   → selector de color: ficha con el círculo del color elegido
 * «menu», «hueco» y «color» son los que se rellenan: en ese orden van los
 * «valores» de cada fila de programa (ver ProgramRow en src/lib/types.ts).
 */
export type BlockPartKind = "icono" | "menu" | "palabra" | "hueco" | "color";

export interface BlockPart {
  t: BlockPartKind;
  v: string;
  /** Lo que ofrece el desplegable al abrirlo, tal cual en la app SPIKE. */
  opciones?: string[];
}

export interface BlockInfo {
  texto: string;
  categoria: string;
  forma: BlockShape;
  /** Si el bloque está dibujado pieza a pieza (como en la app SPIKE). */
  partes?: BlockPart[];
}

/** ¿Es una pieza que se rellena (desplegable, hueco o color)? */
export function isFillable(parte: BlockPart): boolean {
  return parte.t === "menu" || parte.t === "hueco" || parte.t === "color";
}

const PART_KINDS: BlockPartKind[] = ["icono", "menu", "palabra", "hueco", "color"];

function toParts(value: unknown): BlockPart[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const partes = value.flatMap((item) => {
    const { t, v, opciones } = item as { t?: string; v?: string; opciones?: unknown };
    if (!PART_KINDS.includes(t as BlockPartKind) || typeof v !== "string") return [];
    const lista = Array.isArray(opciones)
      ? opciones.filter((o): o is string => typeof o === "string")
      : undefined;
    return [{ t: t as BlockPartKind, v, ...(lista?.length ? { opciones: lista } : {}) }];
  });
  return partes.length > 0 ? partes : undefined;
}

/** Valores con los que sale el bloque de la paleta (puerto, unidad, número…). */
export function defaultValues(info: BlockInfo): string[] {
  return (info.partes ?? []).filter(isFillable).map((parte) => parte.v);
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
  pila: "word-block--pila",
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
    partes: toParts((item as { partes?: unknown }).partes),
  });
}

export const BLOCK_CATEGORIES: { id: string; nombre: string }[] = data.categorias;

/** Todos los bloques del catálogo, en el orden en que salen en la paleta. */
export const ALL_BLOCKS: BlockInfo[] = [...catalog.values()];

/**
 * Color de cada categoría en hexadecimal. Lo necesita el taller de bloques
 * (Blockly), que no entiende clases de CSS.
 * MANTENER IGUAL que los --color-block-* de src/app/globals.css.
 */
export const CATEGORY_HEX: Record<string, { bloque: string; ficha: string }> = {
  eventos: { bloque: "#f5c402", ficha: "#d8ad00" },
  motores: { bloque: "#0090f5", ficha: "#0078cc" },
  movimiento: { bloque: "#ff4ccd", ficha: "#ec42bc" },
  luz: { bloque: "#9b6af6", ficha: "#8a56e9" },
  sonido: { bloque: "#c061f1", ficha: "#aa4edb" },
  control: { bloque: "#ffb515", ficha: "#e39f0a" },
  sensores: { bloque: "#34ccf1", ficha: "#20b4d8" },
  operadores: { bloque: "#00b94d", ficha: "#00a243" },
  variables: { bloque: "#ff9835", ficha: "#e8852a" },
  misbloques: { bloque: "#ff5d64", ficha: "#e84b52" },
  extensiones: { bloque: "#0fbd8c", ficha: "#0aa67a" },
};

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

/** Clases CSS de un bloque: forma + color de su categoría. El texto va en blanco, como en SPIKE. */
export function blockClass(info: { categoria: string; forma: BlockShape }): string {
  return `word-block ${SHAPE_CLASS[info.forma]} ${
    CATEGORY_CLASS[info.categoria] ?? CATEGORY_CLASS.control
  } text-white`;
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
