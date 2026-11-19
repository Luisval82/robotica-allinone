// Las 4 prácticas de programación de un alumno en una unidad, una detrás de
// otra. La ficha de cada una está en FichaPractica, que es la misma que se
// usa cuando se abre una sola desde la matriz de seguimiento.

import { FichaPractica } from "@/components/profesor/FichaPractica";
import type { PracticaIntermedia } from "@/lib/contenido";
import type { PracticaIntermediaEntrega } from "@/lib/db";

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
        practicas.map((practica) => (
          <FichaPractica
            key={practica.practica}
            practica={practica}
            guardada={guardadas.find((item) => item.practica === practica.practica)}
            alumnoId={alumnoId}
            unidad={unidad}
            deCuantas={practicas.length}
          />
        ))
      )}
    </section>
  );
}
