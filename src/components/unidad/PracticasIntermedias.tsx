// Los 4 retos cortos de la unidad, antes del modelo final. Van uno debajo de
// otro, cada uno con su enunciado, su pista, el editor de bloques y el aviso
// de probarlo en el Hub desde el iPad.

import { submitPracticaIntermediaAction } from "@/actions/alumno";
import { AvisoHub } from "@/components/unidad/AvisoHub";
import { EntregaBox, type EntregaView } from "@/components/unidad/EntregaBox";
import type { BlockInfo } from "@/lib/bloques";
import type { PracticaIntermedia } from "@/lib/contenido";
import type { PracticaIntermediaEntrega } from "@/lib/db";

export function PracticasIntermedias({
  unidad,
  practicas,
  guardadas,
  paleta,
}: {
  unidad: number;
  practicas: PracticaIntermedia[];
  guardadas: PracticaIntermediaEntrega[];
  paleta: { propios: BlockInfo[]; anteriores: BlockInfo[]; huecos: BlockInfo[] };
}) {
  const hechas = guardadas.length;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-ink-700">
          Cuatro retos cortos para afianzar los bloques de la unidad. No llevan nota: móntalos,
          guárdalos y pruébalos en tu robot.
        </p>
        <p className="shrink-0 rounded-full bg-ink-100 px-4 py-1.5 text-sm font-extrabold text-ink-700">
          {hechas} de {practicas.length} guardadas
        </p>
      </div>

      {practicas.map((practica) => {
        const guardada = guardadas.find((item) => item.practica === practica.practica);
        const entrega: EntregaView | null = guardada
          ? {
              bloques: guardada.bloques,
              explicacion: guardada.explicacion,
              entregadaEn: guardada.entregadaEn,
              nota: null,
              comentario: "",
              corregidaPor: null,
            }
          : null;

        return (
          <EntregaBox
            key={practica.practica}
            unidad={unidad}
            practica={practica.practica}
            titulo={practica.titulo}
            enunciado={practica.enunciado}
            etiqueta={`Práctica ${practica.practica} de ${practicas.length}`}
            paleta={paleta}
            entrega={entrega}
            accion={submitPracticaIntermediaAction}
            textoBoton="Guardar"
            textoGuardado="Puedes cambiarla las veces que quieras."
            extra={
              <>
                <p className="mt-2 rounded-xl bg-ink-50 px-4 py-2 text-sm font-bold text-ink-600">
                  Pista: {practica.pista}
                </p>
                <AvisoHub />
              </>
            }
          />
        );
      })}
    </div>
  );
}
