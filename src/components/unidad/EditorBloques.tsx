"use client";

// La mesa de trabajo de bloques, como la de la app: a la izquierda la columna
// de categorías, al lado el cajón con los bloques de esa categoría y, a la
// derecha, el lienzo donde se arrastran y se encajan.
//
// Por debajo es Blockly con el renderizador «zelos», que es el diseño de
// bloques de Scratch 3 y el mismo sobre el que está hecha la app de SPIKE: de
// ahí salen la forma de sombrero, la muesca y la pestaña, las bocas de los
// bucles y los desplegables redondeados que se tocan y se cambian.
//
// Lo que el alumno monta se traduce a las mismas filas de programa que usa el
// resto de la plataforma (src/lib/taller.ts), así que se guarda, se corrige y
// se vuelve a abrir igual que siempre.

import { useEffect, useRef, useState } from "react";
import { BLOCK_CATEGORIES, CATEGORY_HEX, getBlockInfo } from "@/lib/bloques";
import {
  ID_POR_TEXTO,
  arbolDeFilas,
  definiciones,
  estilosPorCategoria,
  filasDeBloques,
  type BloqueDelTaller,
  type NodoTaller,
} from "@/lib/taller";
import type { ProgramRow } from "@/lib/types";

/** Lo que usamos de un espacio de trabajo de Blockly. */
interface MesaDeTrabajo {
  newBlock(tipo: string): BloqueConSvg;
  getTopBlocks(ordenados: boolean): BloqueDelTaller[];
  addChangeListener(cb: (evento: { isUiEvent?: boolean }) => void): void;
  render(): void;
  scrollCenter(): void;
  clear(): void;
  dispose(): void;
}

interface BloqueConSvg extends BloqueDelTaller {
  initSvg(): void;
  render(): void;
  moveBy(x: number, y: number): void;
  getField(nombre: string): { setValue(valor: unknown): void } | null;
  getInput(nombre: string): { connection: Conexion | null } | null;
  previousConnection: Conexion | null;
  nextConnection: Conexion | null;
}

interface Conexion {
  connect(otra: Conexion | null): void;
}

export function EditorBloques({
  bloques,
  filas,
  onChange,
  soloLectura = false,
  alto = 460,
  etiqueta,
}: {
  /** Los bloques que se ofrecen en el cajón, por su nombre del catálogo. */
  bloques: string[];
  /** El programa con el que se abre la mesa. */
  filas: ProgramRow[];
  /** Se avisa con el programa montado cada vez que cambia algo. */
  onChange?: (filas: ProgramRow[]) => void;
  soloLectura?: boolean;
  alto?: number;
  etiqueta: string;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const avisar = useRef(onChange);
  avisar.current = onChange;
  // El programa de partida se usa una sola vez, al abrir la mesa: si se
  // volviera a aplicar en cada cambio, el alumno no podría mover nada.
  const partida = useRef(filas);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    let mesa: MesaDeTrabajo | null = null;
    let vigilante: IntersectionObserver | null = null;

    const abrir = async () => {
      try {
        const Blockly = (await import("blockly/core")) as unknown as BlocklyModulo;
        if (!vivo || !caja.current) return;

        // 1 · Los bloques del catálogo, definidos una sola vez por sesión.
        for (const def of definiciones()) {
          if (!Blockly.Blocks[def.type]) {
            Blockly.common.defineBlocks(
              Blockly.common.createBlockDefinitionsFromJsonArray([def]),
            );
          }
        }

        // 2 · El tema, con los colores de categoría de la app.
        const tema = Blockly.Theme.defineTheme(`spike-${soloLectura ? "ro" : "rw"}`, {
          name: `spike-${soloLectura ? "ro" : "rw"}`,
          base: Blockly.Themes.Zelos,
          blockStyles: estilosPorCategoria(),
          componentStyles: {
            workspaceBackgroundColour: soloLectura ? "#ffffff" : "#f7f9fa",
            toolboxBackgroundColour: "#ffffff",
            flyoutBackgroundColour: "#eef2f4",
            scrollbarColour: "#b2bec6",
          },
          fontStyle: {
            family: "ui-sans-serif, system-ui, sans-serif",
            weight: "bold",
            size: 12,
          },
        });

        // 3 · El cajón: solo las categorías que hacen falta en esta práctica,
        //     y dentro, solo sus bloques.
        const porCategoria = new Map<string, string[]>();
        for (const texto of bloques) {
          const id = ID_POR_TEXTO.get(texto);
          if (!id) continue;
          const categoria = getBlockInfo(texto).categoria;
          const lista = porCategoria.get(categoria) ?? [];
          if (!lista.includes(id)) lista.push(id);
          porCategoria.set(categoria, lista);
        }
        const contents = BLOCK_CATEGORIES.filter((c) => porCategoria.has(c.id)).map((c) => ({
          kind: "category",
          name: c.nombre.toUpperCase(),
          colour: (CATEGORY_HEX[c.id] ?? CATEGORY_HEX.control).bloque,
          contents: (porCategoria.get(c.id) ?? []).map((type) => ({ kind: "block", type })),
        }));

        mesa = Blockly.inject(caja.current, {
          // Los iconos (papelera, lupas) y los sonidos de encaje, servidos
          // desde la propia web. Los copia scripts/copiar-media-blockly.mjs.
          media: "/blockly-media/",
          renderer: "zelos",
          theme: tema,
          readOnly: soloLectura,
          ...(soloLectura ? {} : { toolbox: { kind: "categoryToolbox", contents } }),
          // Cuadrícula de puntos, como el lienzo de la app.
          grid: { spacing: 26, length: 2, colour: "#d7dee3", snap: true },
          // Los mandos de abajo a la derecha: acercar, alejar y centrar.
          zoom: {
            controls: !soloLectura,
            wheel: !soloLectura,
            startScale: soloLectura ? 0.78 : 0.85,
            minScale: 0.4,
            maxScale: 1.8,
          },
          trashcan: !soloLectura,
          move: { scrollbars: true, drag: true, wheel: !soloLectura },
          sounds: true,
        }) as MesaDeTrabajo;

        // 4 · El programa guardado, puesto en la mesa.
        montar(mesa, arbolDeFilas(partida.current));
        mesa.render();
        mesa.scrollCenter();

        // 5 · Cada cambio se traduce a filas y se avisa hacia arriba.
        if (!soloLectura) {
          mesa.addChangeListener((evento) => {
            if (evento.isUiEvent || !mesa) return;
            const filasAhora = mesa
              .getTopBlocks(true)
              .flatMap((bloque) => filasDeBloques(bloque, 0));
            avisar.current?.(filasAhora);
          });
        }
      } catch (e) {
        if (vivo) setError(e instanceof Error ? e.message : "No se ha podido abrir la mesa.");
      }
    };

    // Una unidad puede tener seis mesas en la misma página. Abrir las seis de
    // golpe ahoga a un iPad, así que cada una espera a estar cerca de la
    // pantalla; cuando el alumno baja hasta ella, ya está montada.
    const nodo = caja.current;
    if (!nodo) return;
    if (typeof IntersectionObserver === "undefined") {
      void abrir();
    } else {
      vigilante = new IntersectionObserver(
        (entradas) => {
          if (!entradas.some((e) => e.isIntersecting)) return;
          vigilante?.disconnect();
          void abrir();
        },
        { rootMargin: "400px" },
      );
      vigilante.observe(nodo);
    }

    return () => {
      vivo = false;
      vigilante?.disconnect();
      mesa?.dispose();
    };
    // La mesa se monta una vez por práctica: `filas` no entra aquí a
    // propósito, porque volver a montarla a cada cambio sería inmanejable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloques.join("|"), soloLectura]);

  if (error) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50 p-5 font-bold text-ink-600">
        La mesa de bloques no ha podido abrirse ({error}). Avisa a tu profesor.
      </p>
    );
  }

  return (
    <div
      ref={caja}
      role="application"
      aria-label={etiqueta}
      style={{ height: alto, touchAction: "none" }}
      className="editor-bloques w-full overflow-hidden rounded-2xl border-2 border-ink-100"
    />
  );
}

// ── Montar el árbol de bloques en la mesa ────────────────────────────────

interface BlocklyModulo {
  Blocks: Record<string, unknown>;
  common: {
    defineBlocks(defs: unknown): void;
    createBlockDefinitionsFromJsonArray(array: unknown[]): unknown;
  };
  Theme: { defineTheme(nombre: string, def: unknown): unknown };
  Themes: { Zelos: unknown };
  inject(div: Element, opciones: unknown): unknown;
}

function crear(mesa: MesaDeTrabajo, nodo: NodoTaller): BloqueConSvg | null {
  let bloque: BloqueConSvg;
  try {
    bloque = mesa.newBlock(nodo.id);
  } catch {
    return null;
  }
  bloque.initSvg();

  nodo.campos.forEach((valor, indice) => {
    if (valor === "") return;
    const campo = bloque.getField(`H${indice}`);
    // Un valor que ya no esté entre las opciones del desplegable se descarta
    // en vez de tumbar la mesa entera.
    try {
      campo?.setValue(valor);
    } catch {
      /* se queda el valor por defecto */
    }
  });

  encadenar(mesa, bloque.getInput("CUERPO")?.connection ?? null, nodo.cuerpo);
  encadenar(mesa, bloque.getInput("SI_NO")?.connection ?? null, nodo.siNo);
  return bloque;
}

/** Encaja una lista de bloques, uno debajo de otro, a partir de una conexión. */
function encadenar(mesa: MesaDeTrabajo, destino: Conexion | null, nodos: NodoTaller[]): void {
  let conexion = destino;
  for (const hijo of nodos) {
    const bloque = crear(mesa, hijo);
    if (!bloque) continue;
    try {
      conexion?.connect(bloque.previousConnection);
    } catch {
      /* si no encaja, se queda suelto en la mesa */
    }
    conexion = bloque.nextConnection;
  }
}

/**
 * Pone el programa en la mesa. Los bloques del primer nivel van encajados
 * uno debajo de otro; cuando aparece un sombrero —que no admite nada
 * encima— empieza una pila nueva, un poco más abajo.
 */
function montar(mesa: MesaDeTrabajo, arbol: NodoTaller[]): void {
  let y = 24;
  let conexion: Conexion | null = null;

  for (const nodo of arbol) {
    const bloque = crear(mesa, nodo);
    if (!bloque) continue;

    let encajado = false;
    if (conexion && bloque.previousConnection) {
      try {
        conexion.connect(bloque.previousConnection);
        encajado = true;
      } catch {
        /* no encaja: empieza una pila nueva */
      }
    }
    if (!encajado) {
      bloque.moveBy(32, y);
      y += 150;
    }
    conexion = bloque.nextConnection;
  }
}
