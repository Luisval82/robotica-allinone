// Corrección de un test, pregunta a pregunta. La ven el alumno al entregar y
// el profesor desde el panel de notas, así que los dos leen exactamente lo
// mismo: qué se preguntó, qué contestó el alumno, si acertó y cuál era la
// respuesta buena.

import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { formatNota } from "@/lib/format";

const LETRAS = ["A", "B", "C", "D", "E", "F"];

export interface PreguntaRevisada {
  pregunta: string;
  opciones: string[];
}

export interface RevisionPregunta {
  elegida: number;
  correcta: number;
  explicacion: string;
}

/** La opción que marcó el alumno, con su letra. «Sin responder» si no marcó. */
function respuestaDelAlumno(pregunta: PreguntaRevisada, elegida: number): string {
  const opcion = pregunta.opciones[elegida];
  return opcion ? `${LETRAS[elegida]}. ${opcion}` : "Sin responder";
}

/** La cabecera con la nota, los aciertos y a quién pertenecen. */
export function CabeceraNota({
  nota,
  aciertos,
  total,
  pie,
}: {
  nota: number;
  aciertos: number;
  total: number;
  pie: string;
}) {
  const aprobado = nota >= 5;
  return (
    <div
      className={`flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl p-5 ${
        aprobado ? "bg-spike-50" : "bg-red-50"
      }`}
    >
      <p
        className={`font-display text-6xl font-semibold leading-none ${
          aprobado ? "text-spike-700" : "text-red-700"
        }`}
      >
        {formatNota(nota)}
      </p>
      <div>
        <p className="font-display text-xl font-semibold text-ink-900">
          {aciertos} de {total} aciertos
        </p>
        <p className="font-semibold text-ink-600">{pie}</p>
      </div>
    </div>
  );
}

/**
 * El desglose. `detalle` llega a null en los tests antiguos, de antes de que
 * se guardaran las respuestas: entonces se dice, en vez de dejar un hueco.
 */
export function RevisionTest({
  preguntas,
  detalle,
}: {
  preguntas: PreguntaRevisada[];
  detalle: RevisionPregunta[] | null;
}) {
  if (!detalle) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50 p-5 font-bold text-ink-600">
        De este test solo se guardó la nota, sin las respuestas, así que no se puede desglosar
        pregunta a pregunta.
      </p>
    );
  }

  return (
    <ol className="grid gap-4">
      {preguntas.map((pregunta, index) => {
        const revision = detalle[index];
        if (!revision) return null;
        const acierto = revision.elegida === revision.correcta;
        return (
          <li
            key={index}
            className={`rounded-2xl border-2 p-5 ${
              acierto ? "border-spike-200 bg-spike-50/40" : "border-red-200 bg-red-50/40"
            }`}
          >
            <p className="flex items-start gap-3 font-display text-lg font-semibold text-ink-900">
              <span
                className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-white ${
                  acierto ? "bg-spike-600" : "bg-red-600"
                }`}
              >
                {acierto ? <CheckIcon className="size-4" /> : <CloseIcon className="size-4" />}
              </span>
              <span>
                <span className="sr-only">{acierto ? "Acierto. " : "Fallo. "}</span>
                {index + 1}. {pregunta.pregunta}
              </span>
            </p>

            <dl className="mt-3 grid gap-1.5 pl-10 text-sm font-semibold">
              <div className={acierto ? "text-spike-800" : "text-red-700"}>
                <dt className="inline font-extrabold">Respuesta del alumno: </dt>
                <dd className="inline">{respuestaDelAlumno(pregunta, revision.elegida)}</dd>
              </div>

              {acierto ? null : (
                <div className="text-spike-800">
                  <dt className="inline font-extrabold">Respuesta correcta: </dt>
                  <dd className="inline">
                    {LETRAS[revision.correcta]}. {pregunta.opciones[revision.correcta]}
                  </dd>
                </div>
              )}

              <div className="text-ink-600">
                <dt className="sr-only">Explicación</dt>
                <dd>{revision.explicacion}</dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ol>
  );
}
