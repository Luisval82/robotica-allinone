"use client";

import { useActionState, useState } from "react";
import { gradeEntregaAction } from "@/actions/profesor";
import type { GradeFormState } from "@/lib/types";

const EMPTY_STATE: GradeFormState = {};

/** Formulario para calificar una entrega: nota de 0 a 10 y comentario para el alumno. */
export function GradeForm({
  entregaId,
  nota,
  comentario,
}: {
  entregaId: string;
  nota: number | null;
  comentario: string;
}) {
  const [state, formAction, pending] = useActionState(gradeEntregaAction, EMPTY_STATE);
  const [notaValue, setNotaValue] = useState(nota === null ? "" : String(nota));
  const [comentarioValue, setComentarioValue] = useState(comentario);
  const yaCorregida = nota !== null;

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-[8rem_1fr] sm:items-start">
      <input type="hidden" name="entregaId" value={entregaId} />

      <div>
        <label
          htmlFor={`nota-${entregaId}`}
          className="mb-1.5 block text-sm font-extrabold text-ink-800"
        >
          Nota (0–10)
        </label>
        <input
          id={`nota-${entregaId}`}
          name="nota"
          type="number"
          inputMode="decimal"
          min={0}
          max={10}
          step={0.25}
          required
          value={notaValue}
          onChange={(event) => setNotaValue(event.target.value)}
          className="h-13 w-full rounded-2xl border-2 border-ink-200 bg-white px-4 font-display text-2xl font-semibold text-ink-900 focus:border-spike-500"
        />
      </div>

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

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
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
            Corrección guardada.
          </p>
        ) : null}
      </div>
    </form>
  );
}
