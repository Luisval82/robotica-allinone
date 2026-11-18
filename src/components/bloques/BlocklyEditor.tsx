"use client";

// La mesa de Blockly de la prueba: bloques reales de Google, con su caja de
// herramientas, su papelera y su código generado al vuelo.
//
// Va aislado a propósito. Blockly solo existe en el navegador (necesita
// `document`), así que se carga con un import dinámico dentro del efecto y
// el servidor no lo ve nunca. Y no comparte nada con el editor de las
// unidades: otros nombres de bloque, otro tema y otro archivo, para que
// tirar esta prueba sea borrar cuatro archivos y ya.

import { useEffect, useRef } from "react";
import {
  BLOQUES_ROBOTICA,
  CAJA_DE_HERRAMIENTAS,
  PROGRAMA_DE_EJEMPLO,
  registrarGeneradores,
} from "@/lib/bloques-prueba";

/** Lo que la página puede pedirle a la mesa. */
export interface MesaApi {
  /** El código con el seguro antibucle puesto, para ejecutarlo. */
  codigoParaEjecutar(): string;
  limpiar(): void;
  cargarEjemplo(): void;
}

export function BlocklyEditor({
  onCodigo,
  mesaRef,
}: {
  /** Se llama cada vez que cambia el programa, con el código ya traducido. */
  onCodigo: (codigo: string) => void;
  mesaRef: { current: MesaApi | null };
}) {
  const caja = useRef<HTMLDivElement | null>(null);
  // El callback se guarda en una ref para que el efecto no se vuelva a
  // montar cada vez que la página se repinta: montar Blockly dos veces
  // tiraría el programa que el alumno tuviera a medias.
  const avisar = useRef(onCodigo);
  avisar.current = onCodigo;

  useEffect(() => {
    const contenedor = caja.current;
    if (!contenedor) return;

    let workspace: WorkspaceLigero | null = null;
    let observador: ResizeObserver | null = null;
    let pendiente = 0;
    let vivo = true;

    (async () => {
      // Las cuatro piezas por separado, que es como lo documenta Google
      // cuando el idioma no es el inglés: el núcleo, los bloques de serie,
      // el generador y la tabla de mensajes.
      const Blockly = (await import("blockly/core")) as unknown as BlocklyModulo;
      await import("blockly/blocks");
      const generadores = (await import("blockly/javascript")) as unknown as GeneradorModulo;
      const javascriptGenerator = generadores.javascriptGenerator;
      // Si algún día dejara de exportarse, estos son sus valores de siempre.
      const Order = generadores.Order ?? { NONE: 99, FUNCTION_CALL: 2 };

      // Castellano. Si por lo que sea no llega, Blockly se queda en inglés,
      // que es feo pero no rompe nada.
      try {
        const es = await import("blockly/msg/es");
        Blockly.setLocale(es as unknown as Record<string, string>);
      } catch {
        // Sin traducir, pero funcionando.
      }

      if (!vivo) return;

      // Los bloques se definen una sola vez por pestaña: definir el mismo
      // tipo dos veces revienta.
      if (!Blockly.Blocks.robotica_mover_motor) {
        Blockly.common.defineBlocks(
          Blockly.common.createBlockDefinitionsFromJsonArray(BLOQUES_ROBOTICA),
        );
      }
      registrarGeneradores(javascriptGenerator, Order);

      workspace = Blockly.inject(contenedor, {
        toolbox: CAJA_DE_HERRAMIENTAS,
        renderer: "zelos",
        // Los iconos y los sonidos se sirven desde nuestro public/.
        media: "/blockly-media/",
        theme: temaDe(Blockly),
        trashcan: true,
        zoom: { controls: true, wheel: true, startScale: 0.85, minScale: 0.4, maxScale: 1.6 },
        grid: { spacing: 28, length: 2, colour: "#dde4e8", snap: true },
        move: { scrollbars: true, drag: true, wheel: true },
      });

      Blockly.serialization.workspaces.load(PROGRAMA_DE_EJEMPLO, workspace);

      /** Traduce el programa a código. Si algo falla, no se rompe la página. */
      const traducir = (conSeguro: boolean): string => {
        if (!workspace) return "";
        try {
          javascriptGenerator.INFINITE_LOOP_TRAP = conSeguro ? "if (!paso()) return;\n" : "";
          return javascriptGenerator.workspaceToCode(workspace);
        } catch {
          return "";
        } finally {
          javascriptGenerator.INFINITE_LOOP_TRAP = "";
        }
      };

      // Al arrastrar, Blockly dispara muchísimos cambios: se juntan todos
      // en el siguiente repintado y se traduce una vez.
      const alCambiar = () => {
        if (pendiente) return;
        pendiente = requestAnimationFrame(() => {
          pendiente = 0;
          avisar.current(traducir(false));
        });
      };
      workspace.addChangeListener(alCambiar);
      avisar.current(traducir(false));

      mesaRef.current = {
        codigoParaEjecutar: () => traducir(true),
        limpiar: () => workspace?.clear(),
        cargarEjemplo: () => {
          if (workspace) Blockly.serialization.workspaces.load(PROGRAMA_DE_EJEMPLO, workspace);
        },
      };

      // Blockly no se entera solo de que su caja ha cambiado de tamaño.
      observador = new ResizeObserver(() => {
        if (workspace) Blockly.svgResize(workspace);
      });
      observador.observe(contenedor);
    })();

    return () => {
      vivo = false;
      if (pendiente) cancelAnimationFrame(pendiente);
      observador?.disconnect();
      workspace?.dispose();
      mesaRef.current = null;
    };
  }, [mesaRef]);

  return (
    <div
      ref={caja}
      // 550px fijos: Blockly necesita una altura concreta, no una que
      // dependa de su propio contenido.
      className="h-[550px] w-full overflow-hidden rounded-card border border-ink-200 bg-white"
    />
  );
}

// ── Tema ──────────────────────────────────────────────────────────────────

let temaGuardado: unknown = null;

/** Zelos (el aire de Scratch y SPIKE) con los colores y la tipografía de aquí. */
function temaDe(Blockly: BlocklyModulo): unknown {
  if (temaGuardado) return temaGuardado;
  try {
    temaGuardado = Blockly.Theme.defineTheme("prueba-blockly", {
      name: "prueba-blockly",
      base: Blockly.Themes.Zelos,
      componentStyles: {
        workspaceBackgroundColour: "#f7f9fa",
        toolboxBackgroundColour: "#ffffff",
        flyoutBackgroundColour: "#eef2f4",
        scrollbarColour: "#b2bec6",
      },
      fontStyle: { family: "ui-sans-serif, system-ui, sans-serif", weight: "bold", size: 12 },
    });
  } catch {
    // Ya estaba registrado: con el de serie vale.
    temaGuardado = Blockly.Themes.Zelos;
  }
  return temaGuardado;
}

// ── Lo justo de Blockly que usamos, para no andar con `any` ───────────────

interface WorkspaceLigero {
  addChangeListener(f: () => void): void;
  dispose(): void;
  clear(): void;
}

interface BlocklyModulo {
  inject(donde: HTMLElement, opciones: unknown): WorkspaceLigero;
  setLocale(mensajes: Record<string, string>): void;
  svgResize(ws: WorkspaceLigero): void;
  Blocks: Record<string, unknown>;
  common: {
    defineBlocks(defs: unknown): void;
    createBlockDefinitionsFromJsonArray(array: unknown[]): unknown;
  };
  Themes: { Zelos: unknown };
  Theme: { defineTheme(nombre: string, def: unknown): unknown };
  serialization: {
    workspaces: {
      load(estado: unknown, ws: WorkspaceLigero): void;
      save(ws: WorkspaceLigero): unknown;
    };
  };
}

interface GeneradorModulo {
  javascriptGenerator: {
    forBlock: Record<string, unknown>;
    workspaceToCode(ws: WorkspaceLigero): string;
    INFINITE_LOOP_TRAP: string;
  };
  Order?: { NONE: number; FUNCTION_CALL: number };
}
