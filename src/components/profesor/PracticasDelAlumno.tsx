// Seguimiento de las 4 prácticas intermedias de un alumno en una unidad: en
// qué estado están, el programa que dejó al cerrarlas y, si se cerró por
// error, el botón para reabrirla.

import { reabrirPracticaAction } from "@/actions/profesor";
import { ProgramBlocks } from "@/components/brand/ProgramBlocks";
import { PendingButton } from "@/components/ui/PendingButton";
import type { PracticaIntermedia } from "@/lib/contenido";
import type { PracticaIntermediaEntrega } from "@/lib/db";
import { formatFecha } from "@/lib/format";

const ESTADO = {
  comprobada: { texto: "Comprobada", clase: "bg-spike-600 text-white" },
  borrador: { texto: "Borrador", clase: "bg-hub-400 text-ink-900" },
  vacia: { texto: "Sin empezar", clase: "bg-ink-100 text-ink-600" },
} as const;

export function PracticasDelAlumno({
  alumnoId,
  unidad,
  practicas,
  guardadas,
}: {
  alumnoId: string;
  unidad: number;
  practicas: PracticaIntermedia[];
  guardadas: PracticaIntermediaEntrega[];
}) {
  const comprobadas = guardadas.filter((item) => item.comprobadaEn !== null).length;

  return (
    <section aria-labelledby="practicas-alumno" className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="practicas-alumno" className="font-display text-2xl font-semibold text-ink-900">
          Prácticas de programación
        </h2>
        <p className="shrink-0 rounded-full bg-ink-100 px-4 py-1.5 text-sm font-extrabold text-ink-700">
          {comprobadas} de {practicas.length} comprobadas
        </p>
      </div>

      {practicas.length === 0 ? (
        <p className="rounded-card bg-white p-6 font-semibold text-ink-600 shadow-card">
          Esta unidad todavía no tiene prácticas intermedias.
        </p>
      ) : (
        practicas.map((practica) => {
          const guardada = guardadas.find((item) => item.practica === practica.practica);
          const estado = guardada
            ? guardada.comprobadaEn
              ? ESTADO.comprobada
              : ESTADO.borrador
            : ESTADO.vacia;

          return (
            <article
              key={practica.practica}
              className="rounded-card bg-white p-5 shadow-card sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
                    Práctica {practica.practica} de {practicas.length}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-ink-900">
                    {practica.titulo}
                  </h3>
                </div>
                <p
                  className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide ${estado.clase}`}
                >
                  {estado.texto}
                </p>
              </div>

              <p className="mt-2 font-semibold text-ink-600">{practica.enunciado}</p>

              {guardada ? (
                <>
                  <p className="mt-4 text-sm font-bold text-ink-500">
                    {guardada.comprobadaEn
                      ? `Comprobada el ${formatFecha(guardada.comprobadaEn)}: este es el programa con el que la cerró.`
                      : `Guardada el ${formatFecha(guardada.entregadaEn)}, todavía la puede cambiar.`}
                  </p>
                  <div className="mt-2 overflow-x-auto rounded-2xl bg-ink-50 p-4">
                    <ProgramBlocks
                      rows={guardada.bloques}
                      label={`Programa de la práctica ${practica.practica}`}
                    />
                  </div>
                  {guardada.explicacion ? (
                    <p className="mt-2 text-sm font-semibold text-ink-600">
                      Lo explica así: {guardada.explicacion}
                    </p>
                  ) : null}

                  {guardada.comprobadaEn ? (
                    <form action={reabrirPracticaAction} className="mt-4">
                      <input type="hidden" name="alumnoId" value={alumnoId} />
                      <input type="hidden" name="unidad" value={unidad} />
                      <input type="hidden" name="practica" value={practica.practica} />
                      <PendingButton tone="neutral" pendingLabel="Reabriendo…">
                        Reabrir para que la rehaga
                      </PendingButton>
                    </form>
                  ) : null}
                </>
              ) : (
                <p className="mt-4 text-sm font-semibold text-ink-500">
                  No ha guardado nada en esta práctica.
                </p>
              )}

              {practica.solucion && practica.solucion.length > 0 ? (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-extrabold text-spike-700">
                    Ver la solución de ejemplo
                  </summary>
                  <div className="mt-2 overflow-x-auto rounded-2xl bg-spike-50 p-4">
                    <ProgramBlocks
                      rows={practica.solucion}
                      label={`Solución de la práctica ${practica.practica}`}
                    />
                  </div>
                  <p className="mt-2 text-sm font-bold text-spike-800">{practica.notas}</p>
                </details>
              ) : null}
            </article>
          );
        })
      )}
    </section>
  );
}
