// Traduce el catálogo de bloques (src/data/bloques.json) a definiciones de
// Blockly, para que el taller use los mismos bloques que el resto de la
// plataforma y no haya que escribirlos dos veces.
//
// Blockly se dibuja con el renderizador «zelos», que es el diseño de bloques
// de Scratch 3 — el mismo que usa la app de SPIKE.

import {
  ALL_BLOCKS,
  CATEGORY_HEX,
  getBlockInfo,
  isFillable,
  type BlockInfo,
  type BlockPart,
} from "@/lib/bloques";
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
  colour?: string;
  style?: string;
  tooltip: string;
  inputsInline: true;
  previousStatement?: null;
  nextStatement?: null;
  output?: string;
  message1?: string;
  args1?: { type: "input_statement"; name: string }[];
  message2?: string;
  args2?: { type: "input_statement"; name: string }[];
}

/**
 * Bloques que llevan otros dentro: la boca de un bucle o de un «si». Sin
 * esto, en el taller no se podría meter nada dentro de un «Repetir».
 *
 * «Esperar hasta que» NO está aquí: en la app es un bloque de pila normal
 * con su condición dentro, no una boca que se rellena con más bloques.
 */
const CONTENEDORES = new Set([
  "Repetir bucle",
  "Repetir bucle hasta",
  "Bucle infinito",
  "Si... entonces...",
]);

/** El «Si… entonces… Si no…» tiene dos bocas. */
export const DOS_BOCAS = new Set(["Si... entonces... Si no..."]);

/** La fila que separa las dos bocas del «Si… entonces… Si no…». */
export const FILA_SI_NO = "Si no";

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
    // Bloques que todavía no están descritos pieza a pieza. Llevan un único
    // campo de texto con su valor: en la app ahí van desplegables y huecos
    // hexagonales, y aquí, hasta tener su captura para dibujarlos igual, se
    // escribe a mano. Así no se pierde nada de lo que monte el alumno.
    if (info.texto.includes(" X ")) {
      const [antes, despues] = info.texto.split(" X ");
      message0 = `${antes} %1 ${despues} `;
      args0.push({ type: "field_number", name: "H0", value: 1 });
    } else {
      message0 = `${info.texto} %1 `;
      args0.push({ type: "field_input", name: "H0", text: "" });
    }
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
  else if (info.forma === "inicio") {
    // Un bloque de inicio es un sombrero: no se le encaja nada encima.
    def.nextStatement = null;
    def.style = `${info.categoria}_inicio`;
    delete def.colour;
  } else {
    def.previousStatement = null;
    def.nextStatement = null;
  }

  if (DOS_BOCAS.has(info.texto)) {
    def.message1 = "%1";
    def.args1 = [{ type: "input_statement", name: "CUERPO" }];
    def.message2 = "Si no %1";
    def.args2 = [{ type: "input_statement", name: "SI_NO" }];
  } else if (CONTENEDORES.has(info.texto)) {
    def.message1 = "%1";
    def.args1 = [{ type: "input_statement", name: "CUERPO" }];
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
  { colourPrimary: string; colourSecondary: string; colourTertiary: string; hat?: string }
> {
  const estilos: Record<
    string,
    { colourPrimary: string; colourSecondary: string; colourTertiary: string; hat?: string }
  > = {};
  for (const [id, { bloque, ficha }] of Object.entries(CATEGORY_HEX)) {
    estilos[id] = { colourPrimary: bloque, colourSecondary: ficha, colourTertiary: ficha };
    estilos[`${id}_inicio`] = {
      colourPrimary: bloque,
      colourSecondary: ficha,
      colourTertiary: ficha,
      hat: "cap",
    };
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

// ── De la mesa de trabajo a un programa, y al revés ──────────────────────
//
// El resto de la plataforma guarda los programas como filas (ProgramRow):
// nombre del bloque, sus valores y la sangría. El taller trabaja con bloques
// encajados. Estas dos funciones traducen de una cosa a la otra, así que lo
// que el alumno monta arrastrando se guarda igual que siempre y se puede
// volver a cargar tal cual.

/** Lo mínimo que necesitamos de un bloque de Blockly para leerlo. */
export interface BloqueDelTaller {
  type: string;
  getFieldValue(name: string): string | null;
  getInputTargetBlock(name: string): BloqueDelTaller | null;
  getNextBlock(): BloqueDelTaller | null;
}

/** Las filas de una pila de bloques, con su sangría. */
export function filasDeBloques(primero: BloqueDelTaller | null, nivel = 0): ProgramRow[] {
  const filas: ProgramRow[] = [];
  let bloque = primero;

  while (bloque) {
    const texto = TEXTO_POR_ID.get(bloque.type);
    if (texto) {
      const info = getBlockInfo(texto);
      const huecos = numeroDeHuecos(info);
      const valores: string[] = [];
      for (let i = 0; i < huecos; i += 1) valores.push(bloque.getFieldValue(`H${i}`) ?? "");

      const fila: ProgramRow = { texto, nivel };
      if (info.partes) fila.valores = valores;
      else if (valores[0]) fila.valor = valores[0];
      filas.push(fila);

      const cuerpo = bloque.getInputTargetBlock("CUERPO");
      if (cuerpo) filas.push(...filasDeBloques(cuerpo, nivel + 1));

      if (DOS_BOCAS.has(texto)) {
        filas.push({ texto: FILA_SI_NO, nivel });
        const siNo = bloque.getInputTargetBlock("SI_NO");
        if (siNo) filas.push(...filasDeBloques(siNo, nivel + 1));
      }
    }
    bloque = bloque.getNextBlock();
  }
  return filas;
}

/** Un bloque a punto de crearse en la mesa, con lo que lleva dentro. */
export interface NodoTaller {
  id: string;
  texto: string;
  campos: string[];
  cuerpo: NodoTaller[];
  siNo: NodoTaller[];
}

function nodo(fila: ProgramRow): NodoTaller | null {
  const id = ID_POR_TEXTO.get(fila.texto);
  if (!id) return null;
  const info = getBlockInfo(fila.texto);
  const campos = info.partes
    ? (fila.valores ?? []).slice(0, numeroDeHuecos(info))
    : [fila.valor ?? ""];
  return { id, texto: fila.texto, campos, cuerpo: [], siNo: [] };
}

/**
 * El árbol de bloques que describe un programa guardado. La sangría de cada
 * fila dice dentro de qué va; la fila «Si no» cambia a la segunda boca del
 * bloque que la abrió.
 */
export function arbolDeFilas(filas: ProgramRow[]): NodoTaller[] {
  const raiz: NodoTaller[] = [];
  // Dónde van los bloques de cada nivel de sangría.
  const destino: NodoTaller[][] = [raiz];

  for (const fila of filas) {
    const nivel = Math.max(0, Math.min(fila.nivel ?? 0, destino.length - 1));
    const lista = destino[nivel];

    if (fila.texto === FILA_SI_NO) {
      // Lo que venga ahora va en la segunda boca del «Si… Si no…» abierto.
      const abierto = lista[lista.length - 1];
      if (abierto && DOS_BOCAS.has(abierto.texto)) destino[nivel + 1] = abierto.siNo;
      continue;
    }

    const nuevo = nodo(fila);
    if (!nuevo) continue;
    lista.push(nuevo);
    destino.length = nivel + 1;
    destino[nivel + 1] = nuevo.cuerpo;
  }
  return raiz;
}
