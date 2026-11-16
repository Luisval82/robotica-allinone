"use client";

// Taller de bloques: una mesa de trabajo de Blockly con el renderizador
// «zelos», que es el diseño de bloques de Scratch 3 — el mismo sobre el que
// está hecha la app de SPIKE. Los bloques salen del catálogo de la
// plataforma (src/data/bloques.json), así que lo que se arrastra aquí es lo
// mismo que se ve en la teoría de la unidad.

import { useEffect, useRef, useState } from "react";
import { BLOCK_CATEGORIES, CATEGORY_HEX, getBlockInfo } from "@/lib/bloques";
import { ID_POR_TEXTO, definiciones, estilosPorCategoria } from "@/lib/taller";

export function TallerBloques({
  bloques,
  alto = 520,
}: {
  /** Nombres de los bloques que puede usar el alumno, del catálogo. */
  bloques: string[];
  alto?: number;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    let workspace: { dispose: () => void } | null = null;

    (async () => {
      try {
        const Blockly = await import("blockly/core");
        if (!vivo || !caja.current) return;

        // 1 · Los bloques del catálogo, definidos una sola vez.
        for (const def of definiciones()) {
          if (!Blockly.Blocks[def.type]) {
            Blockly.common.defineBlocks(
              Blockly.common.createBlockDefinitionsFromJsonArray([def]),
            );
          }
        }

        // 2 · El tema: los colores de categoría de la plataforma.
        const tema = Blockly.Theme.defineTheme("spike", {
          name: "spike",
          base: Blockly.Themes.Zelos,
          blockStyles: estilosPorCategoria(),
          componentStyles: {
            workspaceBackgroundColour: "#f3f6f8",
            toolboxBackgroundColour: "#ffffff",
            flyoutBackgroundColour: "#e7ecef",
            scrollbarColour: "#b2bec6",
          },
          fontStyle: { family: "ui-sans-serif, system-ui, sans-serif", weight: "bold", size: 12 },
        });

        // 3 · La paleta, agrupada por categoría como en la app.
        const porCategoria = new Map<string, string[]>();
        for (const texto of bloques) {
          const info = getBlockInfo(texto);
          const id = ID_POR_TEXTO.get(texto);
          if (!id) continue;
          const lista = porCategoria.get(info.categoria) ?? [];
          lista.push(id);
          porCategoria.set(info.categoria, lista);
        }

        const contents = BLOCK_CATEGORIES.filter((c) => porCategoria.has(c.id)).map((c) => ({
          kind: "category",
          name: c.nombre,
          colour: (CATEGORY_HEX[c.id] ?? CATEGORY_HEX.control).bloque,
          contents: (porCategoria.get(c.id) ?? []).map((type) => ({ kind: "block", type })),
        }));

        workspace = Blockly.inject(caja.current, {
          renderer: "zelos",
          theme: tema,
          toolbox: { kind: "categoryToolbox", contents },
          grid: { spacing: 28, length: 2, colour: "#d3dbe0", snap: true },
          zoom: { controls: true, wheel: true, startScale: 0.9, minScale: 0.5, maxScale: 1.6 },
          trashcan: true,
          move: { scrollbars: true, drag: true, wheel: true },
        }) as unknown as { dispose: () => void };
      } catch (e) {
        if (vivo) setError(e instanceof Error ? e.message : "No se pudo abrir el taller.");
      }
    })();

    return () => {
      vivo = false;
      workspace?.dispose();
    };
  }, [bloques]);

  if (error) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50 p-5 font-bold text-ink-600">
        El taller de bloques no ha podido abrirse: {error}
      </p>
    );
  }

  return (
    <div
      ref={caja}
      style={{ height: alto }}
      className="w-full overflow-hidden rounded-2xl border-2 border-ink-100"
    />
  );
}
