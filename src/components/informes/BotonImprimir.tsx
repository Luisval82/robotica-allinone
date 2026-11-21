"use client";

// El botón que abre el diálogo de impresión, desde donde el navegador guarda
// el informe como PDF.
//
// Con ?imprimir=1 en la dirección lo abre solo, que es como se llega desde
// el botón de «Alumnado»: el profesor pulsa una vez y le sale el diálogo. Se
// espera a que las tipografías estén cargadas (document.fonts.ready) antes
// de llamar a print(); si se llama antes, algunos navegadores capturan la
// página con la tipografía de reserva y el PDF sale con otra letra.

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export function BotonImprimir() {
  const parametros = useSearchParams();
  const yaLanzado = useRef(false);

  useEffect(() => {
    if (parametros.get("imprimir") !== "1" || yaLanzado.current) return;
    yaLanzado.current = true;

    let cancelado = false;
    const esperaDeTipografias = document.fonts?.ready ?? Promise.resolve();
    void esperaDeTipografias.then(() => {
      if (!cancelado) window.print();
    });
    return () => {
      cancelado = true;
    };
  }, [parametros]);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-spike-600 px-4 text-sm font-extrabold text-white shadow-press-spike transition hover:bg-spike-700 active:translate-y-1 active:shadow-none"
    >
      Guardar como PDF
    </button>
  );
}
