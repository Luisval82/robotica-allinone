// El enunciado de una práctica, desglosado en pasos.
//
// Una frase corrida como «Pon la luz del botón central en verde, espera 2
// segundos, cámbiala a rojo y espera otros 2» es, para un alumno de 1º de
// ESO, una pared de texto en la que se pierde a la mitad. Desglosada en
// cuatro pasos numerados se lee de un vistazo y, además, se ve cuántas cosas
// hay que hacer, que es lo que se le olvida.
//
// Los pasos salen del propio enunciado (scripts/enunciados.py): no son una
// solución disfrazada, son la misma frase partida por donde ya se separaba.
// Las prácticas cuya frase es una sola acción no llevan pasos y se enseñan
// tal cual: desglosar una sola cosa no desglosa nada.

import type { PasoEnunciado } from "@/lib/contenido";

export function Enunciado({
  texto,
  pasos,
  tono = "normal",
}: {
  texto: string;
  pasos?: PasoEnunciado[];
  /** «apagado» para la vista del profesor, donde compite con más cosas. */
  tono?: "normal" | "apagado";
}) {
  if (!pasos || pasos.length === 0) {
    return <p className={`font-semibold ${tono === "apagado" ? "text-ink-600" : "text-ink-700"}`}>{texto}</p>;
  }

  return (
    <ol className="mt-1 grid gap-2">
      {pasos.map((paso, indice) => (
        <li key={indice} className="grid grid-cols-[auto_1fr] items-start gap-x-3">
          <span
            aria-hidden="true"
            className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-spike-600 text-xs font-extrabold text-white"
          >
            {indice + 1}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink-800">{paso.texto}</p>
            {paso.hijos && paso.hijos.length > 0 ? (
              <ul className="mt-1.5 grid gap-1 border-l-2 border-ink-200 pl-4">
                {paso.hijos.map((hijo, i) => (
                  <li key={i} className="relative font-semibold text-ink-600">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[1.4rem] top-[0.55rem] size-1.5 rounded-full bg-ink-300"
                    />
                    {hijo}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
