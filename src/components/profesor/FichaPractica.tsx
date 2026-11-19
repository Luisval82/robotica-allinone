// La ficha de UNA práctica de programación de un alumno: en qué estado está,
// el programa que montó, la solución oficial y, si la cerró por error, el
// botón para reabrirla.
//
// Vive en su propio archivo porque se usa en dos sitios: en la lista de las 4
// prácticas de una unidad y en la vista de una sola práctica, a la que se
// llega pulsando su cuadrado en la matriz de seguimiento. Lo único que
// cambia entre las dos es si la solución viene abierta o plegada.

import type { ReactNode } from "react";
import { reabrirPracticaAction } from "@/actions/profesor";
import { ProgramBlocks } from "@/components/brand/ProgramBlocks";
import { Enunciado } from "@/components/unidad/Enunciado";
import { PendingButton } from "@/components/ui/PendingButton";
import type { PracticaIntermedia } from "@/lib/contenido";
import type { PracticaIntermediaEntrega } from "@/lib/db";
import { formatFecha } from "@/lib/format";

const ESTADO = {
  comprobada: { texto: "Comprobada", clase: "bg-spike-600 text-white" },
  borrador: { texto: "Borrador", clase: "bg-hub-400 text-ink-900" },
  vacia: { texto: "Sin empezar", clase: "bg-ink-100 text-ink-600" },
} as const;

export function FichaPractica({
  practica,
  guardada,
  alumnoId,
  unidad,
  deCuantas,
  solucionAbierta = false,
  children,
}: {
  practica: PracticaIntermedia;
  guardada: PracticaIntermediaEntrega | undefined;
  alumnoId: string;
  unidad: number;
  deCuantas: number;
  /** En la vista de una sola práctica la solución se enseña ya desplegada. */
  solucionAbierta?: boolean;
  /** Para colar algo entre la cabecera y el enunciado, como la comparación. */
  children?: ReactNode;
}) {
  const estado = guardada
    ? guardada.comprobadaEn
      ? ESTADO.comprobada
      : ESTADO.borrador
    : ESTADO.vacia;
  const haySolucion = practica.solucion && practica.solucion.length > 0;

  const solucion = haySolucion ? (
    <>
      <div className="overflow-x-auto rounded-2xl bg-spike-50 p-4">
        <ProgramBlocks
          rows={practica.solucion}
          label={`Solución de la práctica ${practica.practica}`}
        />
      </div>
      {practica.notas ? (
        <p className="mt-2 text-sm font-bold text-spike-800">{practica.notas}</p>
      ) : null}
    </>
  ) : null;

  return (
    <article className="rounded-card bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
            Práctica {practica.practica} de {deCuantas}
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

      {children}

      <div className="mt-2">
        <Enunciado texto={practica.enunciado} pasos={practica.pasos} tono="apagado" />
      </div>

      {/* En la vista de una sola práctica, el programa del alumno y la
          solución van uno al lado del otro: es lo que se viene a comparar. */}
      <div className={`mt-4 grid gap-5 ${solucionAbierta ? "lg:grid-cols-2" : ""}`}>
        <div>
          {solucionAbierta ? (
            <h4 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-500">
              Lo que montó {guardada ? "" : "(nada todavía)"}
            </h4>
          ) : null}

          {guardada ? (
            <>
              <p className="text-sm font-bold text-ink-500">
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
            <p className="text-sm font-semibold text-ink-500">
              No ha guardado nada en esta práctica.
            </p>
          )}
        </div>

        {solucionAbierta ? (
          haySolucion ? (
            <div>
              <h4 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-500">
                Solución de ejemplo
              </h4>
              {solucion}
            </div>
          ) : null
        ) : haySolucion ? (
          <details>
            <summary className="cursor-pointer text-sm font-extrabold text-spike-700">
              Ver la solución de ejemplo
            </summary>
            <div className="mt-2">{solucion}</div>
          </details>
        ) : null}
      </div>
    </article>
  );
}
