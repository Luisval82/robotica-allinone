"use client";

// Banco de pruebas de Blockly. Ruta suelta, fuera del panel y fuera del
// acceso: no toca ninguna pantalla de las que ya funcionan, y por eso no
// aparece enlazada en ningún menú. Se entra escribiendo /bloques.
//
// Lo que hay que mirar aquí: si los bloques se arrastran bien en el iPad, si
// encastran como en SPIKE, si la papelera y el duplicar funcionan a la
// primera, y si el código que sale se entiende. De eso depende que esto
// sustituya algún día a la mesa de bloques de palabras de las unidades.

import { useRef, useState } from "react";
import { BlocklyEditor, type MesaApi } from "@/components/bloques/BlocklyEditor";
import { Simulador } from "@/components/bloques/Simulador";

export default function PaginaBloques() {
  const [codigo, setCodigo] = useState("");
  const [queVeElSensor, setQueVeElSensor] = useState(35);
  const mesa = useRef<MesaApi | null>(null);

  return (
    <main className="mx-auto grid max-w-[110rem] gap-6 p-4 sm:p-6">
      <header className="grid gap-1">
        <p className="text-sm font-extrabold uppercase tracking-wide text-spike-600">
          Prueba · no entra en el curso
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink-900">Mesa de bloques</h1>
        <p className="max-w-3xl font-semibold text-ink-600">
          Bloques reales de Google Blockly con el aspecto de SPIKE. Arrástralos, encástralos,
          duplícalos con el botón derecho y tíralos a la papelera. A la derecha verás el código que
          va saliendo mientras montas, y el botón de simular ejecuta la secuencia en el robot.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(22rem,1fr)]">
        <div className="grid gap-3">
          <BlocklyEditor onCodigo={setCodigo} mesaRef={mesa} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => mesa.current?.cargarEjemplo()}
              className="rounded-full bg-white px-4 py-2 font-bold text-ink-700 shadow-card transition hover:bg-ink-50"
            >
              Volver al ejemplo
            </button>
            <button
              type="button"
              onClick={() => mesa.current?.limpiar()}
              className="rounded-full bg-white px-4 py-2 font-bold text-ink-700 shadow-card transition hover:bg-ink-50"
            >
              Vaciar la mesa
            </button>
          </div>
        </div>

        <div className="grid content-start gap-5">
          <section className="grid gap-2 rounded-card bg-ink-900 p-5">
            <h2 className="font-display text-lg font-semibold text-white">
              Código, según lo montas
            </h2>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-emerald-200">
              {codigo.trim() || "// Engancha bloques debajo de «al empezar»."}
            </pre>
          </section>

          <Simulador
            obtenerCodigo={() => mesa.current?.codigoParaEjecutar() ?? ""}
            queVeElSensor={queVeElSensor}
            onSensor={setQueVeElSensor}
          />
        </div>
      </div>
    </main>
  );
}
