"use client";

import { useActionState, useState } from "react";
import { submitTestAction } from "@/actions/alumno";
import { CabeceraNota, RevisionTest } from "@/components/unidad/RevisionTest";
import type { StudentFormState } from "@/lib/types";

const EMPTY_STATE: StudentFormState = {};
const LETTERS = ["A", "B", "C", "D", "E", "F"];

interface Question {
  pregunta: string;
  opciones: string[];
}

export interface TestResult {
  aciertos: number;
  nota: number;
  /** Corrección pregunta a pregunta. null si no se guardaron las respuestas. */
  detalle: { elegida: number; correcta: number; explicacion: string }[] | null;
}

function ResultView({ preguntas, resultado }: { preguntas: Question[]; resultado: TestResult }) {
  return (
    <div className="grid gap-6">
      <CabeceraNota
        nota={resultado.nota}
        aciertos={resultado.aciertos}
        total={preguntas.length}
        pie="Test entregado. Tu profesor ya puede ver esta nota."
      />
      <RevisionTest preguntas={preguntas} detalle={resultado.detalle} />
    </div>
  );
}

/**
 * Test de la PRUEBA UD-X. Al pulsar «Entregar» se corrige en el servidor y la
 * nota aparece al instante. Las respuestas correctas no están en el navegador
 * hasta que el test se ha entregado.
 */
export function UnitTest({
  unidad,
  preguntas,
  resultado,
}: {
  unidad: number;
  preguntas: Question[];
  resultado: TestResult | null;
}) {
  const [state, formAction, pending] = useActionState(submitTestAction, EMPTY_STATE);
  const [answers, setAnswers] = useState<(number | null)[]>(() => preguntas.map(() => null));

  if (resultado) return <ResultView preguntas={preguntas} resultado={resultado} />;

  const answered = answers.filter((answer) => answer !== null).length;
  const complete = answered === preguntas.length;

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="unidad" value={unidad} />

      {preguntas.map((pregunta, index) => (
        <fieldset key={index} className="rounded-2xl border-2 border-ink-100 p-5">
          <legend className="px-2 text-xs font-extrabold uppercase tracking-widest text-ink-500">
            Pregunta {index + 1} de {preguntas.length}
          </legend>
          <p className="font-display text-lg font-semibold text-ink-900">{pregunta.pregunta}</p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {pregunta.opciones.map((opcion, option) => {
              const checked = answers[index] === option;
              return (
                <label key={option} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`p${index}`}
                    value={option}
                    checked={checked}
                    onChange={() =>
                      setAnswers((current) =>
                        current.map((answer, i) => (i === index ? option : answer)),
                      )
                    }
                    className="peer sr-only"
                  />
                  <span
                    className={`flex h-full items-center gap-3 rounded-2xl border-2 px-4 py-3 font-semibold transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-spike-400 ${
                      checked
                        ? "border-spike-600 bg-spike-50 text-ink-900"
                        : "border-ink-200 bg-white text-ink-800 hover:border-ink-400"
                    }`}
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full font-display text-sm font-semibold ${
                        checked ? "bg-spike-600 text-white" : "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {LETTERS[option]}
                    </span>
                    {opcion}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl bg-ink-50 p-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-14 items-center justify-center rounded-2xl bg-spike-600 px-8 font-display text-lg font-semibold tracking-wide text-white shadow-press-spike transition hover:bg-spike-700 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Corrigiendo…" : "Entregar"}
        </button>
        <div className="min-w-0">
          <p className="font-bold text-ink-900">
            {complete
              ? "Has respondido todas las preguntas."
              : `Has respondido ${answered} de ${preguntas.length}.`}
          </p>
          <p className="text-sm font-semibold text-ink-500">
            Solo puedes entregar el test una vez. La nota sale al momento.
          </p>
        </div>
        {state.error ? (
          <p role="alert" className="w-full text-sm font-bold text-red-700">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
