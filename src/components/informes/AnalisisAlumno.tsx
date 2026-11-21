// El bloque de análisis y orientación del informe individual.
//
// Cuatro frases y un distintivo. Cabe en media hoja a propósito: esto se lee
// de un vistazo antes de una tutoría, no se estudia. El detalle ya está en
// las tablas de abajo.

import type { AnalisisAlumno as Analisis, Orientacion, Veredicto } from "@/lib/analisis";

const PUNTO: Record<Veredicto, string> = {
  bien: "bg-nivel-bien",
  regular: "bg-nivel-regular",
  mal: "bg-nivel-flojo",
  "sin-datos": "bg-nivel-nada",
};

const ORIENTACION: Record<Orientacion, { texto: string; clase: string }> = {
  "se-corresponde": {
    texto: "La nota se corresponde con su trabajo",
    clase: "bg-spike-100 text-spike-800",
  },
  mayor: {
    texto: "La nota podría ser mayor",
    clase: "bg-hub-100 text-hub-700",
  },
  menor: {
    texto: "La nota podría ser menor",
    clase: "bg-nivel-regular text-white",
  },
  "sin-datos": {
    texto: "Sin datos suficientes para orientar",
    clase: "bg-ink-100 text-ink-600",
  },
};

export function AnalisisAlumno({ analisis }: { analisis: Analisis }) {
  const orientacion = ORIENTACION[analisis.orientacion];

  return (
    <section className="evitar-corte mt-6 rounded-card border-2 border-ink-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-ink-900">
          Análisis y orientación
        </h2>
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${orientacion.clase}`}
        >
          {orientacion.texto}
        </span>
      </div>

      <ul className="mt-3 space-y-1.5">
        {analisis.observaciones.map((observacion) => (
          <li key={observacion.titulo} className="flex items-start gap-2 text-sm">
            <span
              aria-hidden="true"
              className={`mt-1.5 size-2.5 shrink-0 rounded-full ${PUNTO[observacion.veredicto]}`}
            />
            <p className="text-ink-700">
              <span className="font-extrabold text-ink-900">{observacion.titulo}</span>
              {" — "}
              {observacion.texto}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t-2 border-ink-100 pt-2 text-sm font-semibold text-ink-800">
        {analisis.motivo}
      </p>

      <p className="mt-1 text-xs font-semibold text-ink-500">
        Orientación automática a partir de lo que consta en la plataforma: unidades terminadas,
        prácticas comprobadas, programaciones entregadas y notas de las PRUEBAS cerradas.{" "}
        <strong className="font-extrabold">No es una nota</strong> ni sustituye al criterio del
        profesor. La plataforma no registra los accesos ni el tiempo de trabajo, así que
        «actividad» aquí significa lo que se ha entregado y qué días, nada más.
      </p>
    </section>
  );
}
