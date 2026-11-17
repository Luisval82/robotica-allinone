"use client";

// El montaje del modelo, paso a paso, dentro de una sola ventana: no hay
// página larga que recorrer. Se avanza con los botones, con las flechas del
// teclado o pulsando los puntos de abajo.

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { PiezasDelPaso, piezasDelTexto } from "@/components/unidad/PiezasMontaje";

export interface PasoMontaje {
  titulo: string;
  texto: string;
}

export function CarruselMontaje({
  modelo,
  piezas,
  pasos,
}: {
  modelo: string;
  /** La lista de piezas del modelo entero, tal como viene del contenido. */
  piezas: string;
  pasos: PasoMontaje[];
}) {
  const [actual, setActual] = useState(0);
  const marco = useRef<HTMLDivElement>(null);
  const total = pasos.length;

  const ir = useCallback(
    (destino: number) => setActual(Math.min(Math.max(destino, 0), total - 1)),
    [total],
  );

  // Flechas del teclado, solo cuando el carrusel tiene el foco dentro.
  useEffect(() => {
    const caja = marco.current;
    if (!caja) return;
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === "ArrowRight") ir(actual + 1);
      else if (evento.key === "ArrowLeft") ir(actual - 1);
      else return;
      evento.preventDefault();
    };
    caja.addEventListener("keydown", alPulsar);
    return () => caja.removeEventListener("keydown", alPulsar);
  }, [actual, ir]);

  if (total === 0) return null;

  const paso = pasos[actual];
  const primero = actual === 0;
  const ultimo = actual === total - 1;
  const descripcion = `${paso.titulo}. ${paso.texto}`;
  const tienePiezas = piezasDelTexto(descripcion).length > 0;

  return (
    <div
      ref={marco}
      tabIndex={-1}
      role="group"
      aria-roledescription="carrusel"
      aria-label={`Montaje de ${modelo}, paso a paso`}
      className="overflow-hidden rounded-card border-2 border-ink-100 bg-white outline-none"
    >
      {/* Cabecera: qué se monta y con qué piezas */}
      <div className="border-b-2 border-ink-100 bg-ink-50 px-5 py-4">
        <p className="font-display text-lg font-semibold text-ink-900">{modelo}</p>
        <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-ink-600" title={piezas}>
          <span className="font-extrabold text-ink-800">Piezas: </span>
          {piezas}
        </p>
      </div>

      {/* Indicador de avance */}
      <div className="flex items-center gap-4 px-5 pt-5">
        <p
          aria-live="polite"
          className="shrink-0 font-display text-sm font-semibold uppercase tracking-widest text-ink-500"
        >
          Paso {actual + 1} de {total}
        </p>
        <div className="h-2 w-full min-w-0 grow rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-block-movimiento transition-[width] duration-300"
            style={{ width: `${((actual + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* El paso: su dibujo de piezas y sus instrucciones */}
      <div className="grid min-h-[22rem] gap-5 px-5 py-5 md:min-h-[20rem] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
        <div className="grid place-items-center">
          {tienePiezas ? (
            <PiezasDelPaso texto={descripcion} tamano="grande" />
          ) : (
            <p className="rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50 p-6 text-center font-bold text-ink-500">
              Este paso es de comprobación: no entra ninguna pieza nueva.
            </p>
          )}
        </div>
        <div className="min-w-0 self-center">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-block-movimiento font-display text-lg font-semibold text-ink-900">
              {actual + 1}
            </span>
            <h4 className="font-display text-2xl font-semibold leading-tight text-ink-900">
              {paso.titulo}
            </h4>
          </div>
          <p className="mt-3 max-h-40 overflow-y-auto pr-1 font-semibold leading-relaxed text-ink-700">
            {paso.texto}
          </p>
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink-100 bg-ink-50 px-5 py-4">
        <button
          type="button"
          onClick={() => ir(actual - 1)}
          disabled={primero}
          className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 font-display font-semibold text-ink-900 shadow-card transition hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        >
          <ArrowLeftIcon className="size-4" />
          Anterior
        </button>

        <ol className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Pasos">
          {pasos.map((item, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => ir(index)}
                aria-label={`Paso ${index + 1}: ${item.titulo}`}
                aria-current={index === actual ? "step" : undefined}
                className={`grid size-7 place-items-center rounded-full text-xs font-extrabold transition ${
                  index === actual
                    ? "bg-block-movimiento text-ink-900"
                    : index < actual
                      ? "bg-spike-600 text-white"
                      : "bg-ink-200 text-ink-600 hover:bg-ink-300"
                }`}
              >
                {index < actual ? <CheckIcon className="size-3.5" /> : index + 1}
              </button>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={() => ir(actual + 1)}
          disabled={ultimo}
          className="inline-flex h-12 items-center gap-2 rounded-2xl bg-spike-600 px-5 font-display font-semibold text-white shadow-press-spike transition hover:bg-spike-700 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-spike-600 disabled:active:translate-y-0"
        >
          Siguiente
          <ArrowRightIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
