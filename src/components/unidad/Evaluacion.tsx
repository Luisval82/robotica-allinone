// La cabecera de una evaluación en la lista de unidades.
//
// Solo sale donde el temario está repartido por evaluaciones (ahora mismo,
// 1º de ESO). Donde no lo está, las unidades se listan seguidas como siempre
// y esto no aparece: así el cambio de 1º no toca lo que ven 2º y 3º.

const ORDINAL = ["", "1.ª", "2.ª", "3.ª"];

const NIVEL = [
  "",
  "Nivel 1 · programas cortos y guiados",
  "Nivel 2 · bucles, giros controlados y condiciones",
  "Nivel 3 · varias respuestas, giros medidos y proyectos",
];

export function CabeceraEvaluacion({
  evaluacion,
  nivel,
}: {
  evaluacion: number;
  nivel?: number;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 border-ink-100 pb-2">
      <h3 className="font-display text-xl font-semibold text-ink-900">
        {ORDINAL[evaluacion] ?? evaluacion} evaluación
      </h3>
      {nivel ? (
        <p className="text-sm font-bold text-ink-500">{NIVEL[nivel] ?? ""}</p>
      ) : null}
    </div>
  );
}
