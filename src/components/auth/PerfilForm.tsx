"use client";

// Primera entrada: quien acaba de entrar con la cuenta del colegio dice cómo
// se llama y a qué curso va. Hasta que no lo rellena no puede usar nada.

import { useActionState } from "react";
import { completarPerfilAction } from "@/actions/auth";
import { ArrowRightIcon, UserIcon } from "@/components/ui/icons";
import { COURSE_LABEL, type Course } from "@/lib/types";
import type { AuthFormState } from "@/lib/validation";

const CURSOS: Course[] = ["1ESO", "2ESO", "3ESO"];
const VACIO: AuthFormState = {};

export function PerfilForm({ nombreSugerido }: { nombreSugerido: string }) {
  const [state, formAction, pending] = useActionState(completarPerfilAction, VACIO);

  return (
    <form action={formAction} className="mt-7 grid gap-5">
      <div>
        <label htmlFor="perfil-name" className="mb-1.5 block text-sm font-extrabold text-ink-800">
          Nombre y apellidos
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">
            <UserIcon className="size-5" />
          </span>
          <input
            id="perfil-name"
            name="name"
            type="text"
            autoComplete="name"
            defaultValue={nombreSugerido}
            required
            maxLength={80}
            placeholder="Nombre Apellido Apellido"
            className={`h-13 w-full rounded-2xl border-2 bg-white pl-12 pr-4 text-base font-semibold text-ink-900 transition-colors placeholder:font-normal placeholder:text-ink-400 focus:border-spike-500 ${
              state.fieldErrors?.name ? "border-red-500" : "border-ink-200"
            }`}
          />
        </div>
        {state.fieldErrors?.name ? (
          <p className="mt-1.5 text-sm font-bold text-red-700">{state.fieldErrors.name}</p>
        ) : (
          <p className="mt-1.5 text-sm text-ink-500">
            Pon tu nombre de verdad: es el que verá tu profesor en sus listas.
          </p>
        )}
      </div>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-extrabold text-ink-800">
          ¿A qué curso vas?
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {CURSOS.map((curso, index) => (
            <label
              key={curso}
              className="cursor-pointer rounded-2xl border-2 border-ink-200 bg-white p-4 text-center font-display text-lg font-semibold text-ink-900 transition-colors has-checked:border-spike-600 has-checked:bg-spike-50 hover:border-ink-400"
            >
              <input
                type="radio"
                name="course"
                value={curso}
                defaultChecked={index === 0}
                className="sr-only"
              />
              {COURSE_LABEL[curso]}
            </label>
          ))}
        </div>
        {state.fieldErrors?.course ? (
          <p className="mt-1.5 text-sm font-bold text-red-700">{state.fieldErrors.course}</p>
        ) : (
          <p className="mt-1.5 text-sm text-ink-500">
            Si te equivocas, tu profesor puede cambiarte de curso.
          </p>
        )}
      </fieldset>

      {state.error ? (
        <p role="alert" className="text-sm font-bold text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-spike-600 px-6 font-display text-lg font-semibold tracking-wide text-white shadow-press-spike transition hover:bg-spike-700 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Guardando…" : "Entrar a mis unidades"}
        <ArrowRightIcon className="size-5" />
      </button>
    </form>
  );
}
