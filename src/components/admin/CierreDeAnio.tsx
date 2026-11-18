"use client";

// Cierre de año escolar. Es lo más delicado de la plataforma, así que no hay
// un botón suelto: hay que abrir el aviso, leer lo que va a pasar y escribir
// a mano el año que se cierra. Así no se pulsa por error.

import { useActionState, useState } from "react";
import { cerrarAnioAction } from "@/actions/admin";
import { PendingButton } from "@/components/ui/PendingButton";
import type { CierreFormState } from "@/lib/types";

const VACIO: CierreFormState = {};

export function CierreDeAnio({
  anioActivo,
  anioPropuesto,
  alumnos,
}: {
  anioActivo: string;
  anioPropuesto: string;
  alumnos: number;
}) {
  const [abierto, setAbierto] = useState(false);
  const [estado, accion] = useActionState(cerrarAnioAction, VACIO);

  if (estado.cierre) {
    const { cierre } = estado;
    return (
      <div className="rounded-card border-2 border-spike-500 bg-spike-50 p-6">
        <h3 className="font-display text-2xl font-semibold text-spike-800">
          Año {cierre.anioCerrado} cerrado
        </h3>
        <p className="mt-2 font-semibold text-spike-800">
          Ya se trabaja en el {cierre.anioActivo}. Se han archivado{" "}
          {cierre.matriculasArchivadas}{" "}
          {cierre.matriculasArchivadas === 1 ? "matrícula" : "matrículas"} y{" "}
          {cierre.alumnosSinCurso} {cierre.alumnosSinCurso === 1 ? "alumno" : "alumnos"}{" "}
          {cierre.alumnosSinCurso === 1 ? "tendrá" : "tendrán"} que elegir curso al entrar.
          {cierre.asignacionesCopiadas > 0
            ? ` Se han copiado ${cierre.asignacionesCopiadas} asignaciones de cursos del profesorado.`
            : " El profesorado empieza sin cursos asignados."}
        </p>
        <p className="mt-2 font-semibold text-spike-800">
          Nada se ha borrado: el curso que acaba de cerrarse se consulta en el histórico.
        </p>
      </div>
    );
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex h-12 items-center rounded-2xl border-2 border-red-300 bg-white px-5 font-display font-semibold text-red-700 transition hover:border-red-600 hover:bg-red-50"
      >
        Cerrar el año {anioActivo} y abrir el siguiente
      </button>
    );
  }

  return (
    <form action={accion} className="rounded-card border-2 border-red-300 bg-red-50 p-6">
      <h3 className="font-display text-2xl font-semibold text-red-800">
        Vas a cerrar el año {anioActivo}
      </h3>

      <ul className="mt-3 grid gap-1.5 font-semibold text-ink-800">
        <li>
          · Las entregas, los tests y el progreso de {anioActivo} quedan archivados. No se borra
          nada: se consultan en el histórico.
        </li>
        <li>
          · {alumnos} {alumnos === 1 ? "alumno se queda" : "alumnos se quedan"} sin curso. Al
          entrar, cada uno elige su nuevo nivel y empieza las unidades desde cero.
        </li>
        <li>· Las unidades vuelven a su estado inicial: solo la UD 1 abierta.</li>
        <li>· Esto no se puede deshacer desde la plataforma.</li>
      </ul>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-extrabold uppercase tracking-widest text-ink-600">
            Año nuevo
          </span>
          <input
            name="anioNuevo"
            type="text"
            required
            defaultValue={anioPropuesto}
            pattern="\d{4}-\d{4}"
            placeholder="2027-2028"
            className="h-12 rounded-xl border-2 border-ink-200 bg-white px-3 font-mono font-bold text-ink-900 focus:border-spike-500"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-extrabold uppercase tracking-widest text-ink-600">
            Escribe «{anioActivo}» para confirmar
          </span>
          <input
            name="confirmacion"
            type="text"
            required
            autoComplete="off"
            placeholder={anioActivo}
            className="h-12 rounded-xl border-2 border-ink-200 bg-white px-3 font-mono font-bold text-ink-900 focus:border-spike-500"
          />
        </label>
      </div>

      <label className="mt-4 flex items-start gap-2.5 font-semibold text-ink-800">
        <input
          type="checkbox"
          name="copiarDocentes"
          value="1"
          defaultChecked
          className="mt-0.5 size-4 accent-spike-600"
        />
        <span>
          Mantener los cursos que imparte cada docente. Si lo desmarcas, el profesorado empieza el
          año sin cursos asignados y tendrás que volver a marcarlos.
        </span>
      </label>

      {estado.error ? (
        <p role="alert" className="mt-4 rounded-xl bg-white px-4 py-3 font-bold text-red-700">
          {estado.error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <PendingButton tone="danger" pendingLabel="Cerrando el año…">
          Cerrar el año {anioActivo}
        </PendingButton>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-extrabold text-ink-700 transition hover:bg-white"
        >
          Dejarlo como está
        </button>
      </div>
    </form>
  );
}
