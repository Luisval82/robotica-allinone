"use client";

// Corrección de una de las 2 programaciones de una PRUEBA.
//
// Se puntúa sobre 1, no sobre 10: la PRUEBA son 10 puntos de 1 —las 8
// preguntas del test más estas dos programaciones— y la nota final es la
// suma. Poner aquí un 7 cuando lo que cabe es un 0,7 descuadraría la nota
// del alumno por siete puntos, así que el campo no deja pasar de 1 y al lado
// están los cuatro valores de siempre para no tener que escribirlos.

import { useActionState, useState } from "react";
import { gradeEntregaAction } from "@/actions/profesor";
import type { GradeFormState } from "@/lib/types";

const EMPTY_STATE: GradeFormState = {};

/** Los valores que se usan el 95 % de las veces. */
const ATAJOS = [
  { valor: "1", etiqueta: "1", pie: "Bien" },
  { valor: "0.75", etiqueta: "0,75", pie: "Casi" },
  { valor: "0.5", etiqueta: "0,5", pie: "A medias" },
  { valor: "0", etiqueta: "0", pie: "No" },
];

export function CorreccionPrograma({
  entregaId,
  puntos,
  comentario,
}: {
  entregaId: string;
  /** Lo que ya tenía puesto, de 0 a 1. null = sin corregir. */
  puntos: number | null;
  comentario: string;
}) {
  const [state, formAction, pending] = useActionState(gradeEntregaAction, EMPTY_STATE);
  const [valor, setValor] = useState(puntos === null ? "" : String(puntos));
  const [comentarioValue, setComentarioValue] = useState(comentario);
  const yaCorregida = puntos !== null;

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="entregaId" value={entregaId} />

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-extrabold text-ink-800">
          Puntos de esta programación (vale 1 punto de los 10 de la prueba)
        </legend>
        <div className="flex flex-wrap items-end gap-2">
          {ATAJOS.map((atajo) => {
            const elegido = valor === atajo.valor;
            return (
              <button
                key={atajo.valor}
                type="button"
                onClick={() => setValor(atajo.valor)}
                aria-pressed={elegido}
                className={`grid h-14 w-20 place-items-center rounded-2xl border-2 font-display text-xl font-semibold transition ${
                  elegido
                    ? "border-spike-600 bg-spike-600 text-white"
                    : "border-ink-200 bg-white text-ink-800 hover:border-spike-400"
                }`}
              >
                {atajo.etiqueta}
                <span
                  className={`font-sans text-[0.65rem] font-bold uppercase tracking-wide ${
                    elegido ? "text-white/80" : "text-ink-500"
                  }`}
                >
                  {atajo.pie}
                </span>
              </button>
            );
          })}

          <label className="grid gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-500">
              u otro valor
            </span>
            <input
              id={`puntos-${entregaId}`}
              name="puntos"
              type="number"
              inputMode="decimal"
              min={0}
              max={1}
              step={0.05}
              required
              value={valor}
              onChange={(event) => setValor(event.target.value)}
              className="h-14 w-24 rounded-2xl border-2 border-ink-200 bg-white px-3 font-display text-xl font-semibold text-ink-900 focus:border-spike-500"
            />
          </label>
        </div>
      </fieldset>

      <div>
        <label
          htmlFor={`comentario-${entregaId}`}
          className="mb-1.5 block text-sm font-extrabold text-ink-800"
        >
          Comentario para el alumno
        </label>
        <textarea
          id={`comentario-${entregaId}`}
          name="comentario"
          rows={3}
          maxLength={1000}
          placeholder="Qué está bien y qué puede mejorar."
          value={comentarioValue}
          onChange={(event) => setComentarioValue(event.target.value)}
          className="w-full rounded-2xl border-2 border-ink-200 bg-white px-4 py-3 text-base font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:border-spike-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-spike-600 px-6 font-display text-base font-semibold tracking-wide text-white shadow-press-spike transition hover:bg-spike-700 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Guardando…" : yaCorregida ? "Guardar cambios" : "Guardar corrección"}
        </button>
        {state.error ? (
          <p role="alert" className="text-sm font-bold text-red-700">
            {state.error}
          </p>
        ) : state.ok ? (
          <p role="status" className="text-sm font-bold text-spike-700">
            Corrección guardada. La nota de la prueba se recalcula sola.
          </p>
        ) : null}
      </div>
    </form>
  );
}
