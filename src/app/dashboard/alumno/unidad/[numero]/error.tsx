"use client";

// Si algo se rompe dentro de una unidad, esto es lo que ve el alumno: una
// pantalla de la plataforma con un botón para volver a intentarlo, en vez de
// la pantalla en blanco del navegador.

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorDeUnidad({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[unidad]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink-900">
        Esta unidad se ha quedado a medias
      </h1>
      <p className="mt-3 text-lg font-semibold text-ink-600">
        No se ha perdido nada de lo que tenías guardado. Vuelve a intentarlo y, si sigue pasando,
        avisa a tu profesor.
      </p>
      {/* El detalle, plegado: al alumno no le dice nada, pero cuando avisa
          a su profesor evita tener que abrir la consola del navegador. */}
      <details className="mt-6 text-left">
        <summary className="cursor-pointer text-center text-sm font-extrabold text-ink-500">
          Detalle técnico, para tu profesor
        </summary>
        <p className="mt-2 overflow-x-auto rounded-xl bg-ink-100 p-3 font-mono text-xs text-ink-700">
          {error.message || "Sin mensaje"}
          {error.digest ? ` · ${error.digest}` : ""}
        </p>
      </details>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-13 items-center rounded-2xl bg-spike-600 px-6 font-display text-base font-semibold text-white shadow-press-spike transition hover:bg-spike-700 active:translate-y-1 active:shadow-none"
        >
          Volver a intentarlo
        </button>
        <Link
          href="/dashboard/alumno"
          className="inline-flex h-13 items-center rounded-2xl border-2 border-ink-200 bg-white px-6 font-display text-base font-semibold text-ink-900 transition hover:border-ink-900"
        >
          Ir a mis unidades
        </Link>
      </div>
    </div>
  );
}
