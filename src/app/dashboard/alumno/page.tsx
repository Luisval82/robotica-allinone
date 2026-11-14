import type { Metadata } from "next";
import { LockIcon, LockOpenIcon } from "@/components/ui/icons";
import { requireRole } from "@/lib/auth";
import { COURSE_LABEL } from "@/lib/types";
import { getUnidadesDeCurso } from "@/lib/unidades";

export const metadata: Metadata = { title: "Mis unidades" };

// Un color de categoría de bloques para cada una de las 9 unidades.
const UNIT_TONES = [
  "bg-block-eventos text-ink-900",
  "bg-block-motores text-white",
  "bg-block-movimiento text-white",
  "bg-block-control text-ink-900",
  "bg-block-sensores text-ink-900",
  "bg-block-luz text-white",
  "bg-block-sonido text-white",
  "bg-block-operadores text-ink-900",
  "bg-block-variables text-ink-900",
];

export default async function AlumnoDashboardPage() {
  const session = await requireRole(["alumno"]);
  const firstName = session.name.split(" ")[0];

  if (!session.course) {
    return (
      <p className="rounded-card bg-white p-8 font-semibold text-ink-700 shadow-card">
        Tu cuenta no tiene curso asignado. Pide a tu profesor que lo revise.
      </p>
    );
  }

  const unidades = getUnidadesDeCurso(session.course);

  return (
    <>
      <section className="rounded-card bg-spike-600 p-7 text-white sm:p-10">
        <p className="text-sm font-extrabold uppercase tracking-widest text-spike-100">
          {COURSE_LABEL[session.course]} · Robótica SPIKE Prime
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Hola, {firstName}</h1>
        <p className="mt-3 max-w-xl text-lg font-semibold text-spike-100">
          Tienes {unidades.length} unidades este curso. Empieza por la primera: tu profesor irá
          abriendo las demás.
        </p>
      </section>

      <h2 className="mt-10 font-display text-2xl font-semibold text-ink-900">Tus unidades</h2>

      <ol className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {unidades.map((unidad) => {
          // Por defecto solo la UD 1 está abierta. El desbloqueo por alumno o por
          // clase llegará con el panel de profesor (siguiente fase).
          const abierta = unidad.numero === 1;
          const tone = UNIT_TONES[(unidad.numero - 1) % UNIT_TONES.length];

          return (
            <li
              key={unidad.numero}
              className="flex flex-col overflow-hidden rounded-card bg-white shadow-card"
            >
              <div
                className={`flex items-center justify-between px-6 py-4 ${
                  abierta ? tone : "bg-ink-200 text-ink-600"
                }`}
              >
                <span className="font-display text-2xl font-semibold">UD {unidad.numero}</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${
                    abierta ? "bg-white text-ink-900" : "bg-ink-700 text-white"
                  }`}
                >
                  {abierta ? <LockOpenIcon className="size-3.5" /> : <LockIcon className="size-3.5" />}
                  {abierta ? "Abierta" : "Bloqueada"}
                </span>
              </div>
              <div className={`flex flex-1 flex-col gap-2 p-6 ${abierta ? "" : "text-ink-500"}`}>
                <h3
                  className={`font-display text-xl font-semibold leading-snug ${
                    abierta ? "text-ink-900" : "text-ink-600"
                  }`}
                >
                  {unidad.titulo}
                </h3>
                <p className="text-sm font-semibold">{unidad.modelo}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
