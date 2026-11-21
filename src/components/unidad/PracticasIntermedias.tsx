// Los 4 retos cortos de la unidad, antes del modelo final. Van uno debajo de
// otro, cada uno con su enunciado, su pista, el editor de bloques y el aviso
// de probarlo en el Hub desde el iPad.
//
// Cada reto se puede guardar como borrador tantas veces como haga falta. Al
// pulsar «Guardar y comprobar» se cierra —ya no se puede cambiar— y aparece
// al lado la solución de ejemplo para compararla con la suya.

import { submitPracticaIntermediaAction } from "@/actions/alumno";
import { AvisoHub } from "@/components/unidad/AvisoHub";
import { RecorridoBaldosas } from "@/components/unidad/RecorridoBaldosas";
import { SueloBaldosas } from "@/components/unidad/SueloBaldosas";
import { EntregaBox, type EntregaView, type SolucionView } from "@/components/unidad/EntregaBox";
import type { BlockInfo } from "@/lib/bloques";
import type { PracticaIntermedia } from "@/lib/contenido";
import type { PracticaIntermediaEntrega } from "@/lib/db";
import { formatFecha } from "@/lib/format";
import type { Course } from "@/lib/types";
import { getBloquesDePractica } from "@/lib/paleta";

export function PracticasIntermedias({
  curso,
  unidad,
  practicas,
  guardadas,
  paleta,
}: {
  curso: Course;
  unidad: number;
  practicas: PracticaIntermedia[];
  guardadas: PracticaIntermediaEntrega[];
  paleta: { propios: BlockInfo[]; anteriores: BlockInfo[]; huecos: BlockInfo[] };
}) {
  const comprobadas = guardadas.filter((item) => item.comprobadaEn !== null).length;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-ink-700">
          Cuatro retos cortos para afianzar los bloques de la unidad. No llevan nota. Móntalos,
          pruébalos en tu robot y, cuando lo tengas, pulsa «Guardar y comprobar»: se cierra y verás
          la solución de ejemplo al lado de la tuya.
        </p>
        <p className="shrink-0 rounded-full bg-ink-100 px-4 py-1.5 text-sm font-extrabold text-ink-700">
          {comprobadas} de {practicas.length} comprobadas
        </p>
      </div>

      {practicas.map((practica) => {
        const guardada = guardadas.find((item) => item.practica === practica.practica);
        const cerrada = guardada?.comprobadaEn ?? null;

        const entrega: EntregaView | null = guardada
          ? {
              bloques: guardada.bloques,
              explicacion: guardada.explicacion,
              entregadaEn: formatFecha(cerrada ?? guardada.entregadaEn),
              puntos: null,
              comentario: "",
              corregidaPor: null,
            }
          : null;

        const solucion: SolucionView = {
          bloques: practica.solucion ?? [],
          notas: practica.notas ?? "",
        };

        return (
          <EntregaBox
            key={practica.practica}
            unidad={unidad}
            practica={practica.practica}
            titulo={practica.titulo}
            enunciado={practica.enunciado}
            pasos={practica.pasos}
            etiqueta={`Práctica ${practica.practica} de ${practicas.length}`}
            paleta={paleta}
            // El cajón trae los bloques de la unidad y los que use su
            // solución: lo que hace falta para este reto, sin más ruido.
            bloquesTaller={getBloquesDePractica(curso, unidad, practica.solucion ?? [])}
            entrega={entrega}
            accion={submitPracticaIntermediaAction}
            textoBoton="Guardar"
            textoGuardado="Es un borrador: puedes cambiarlo las veces que quieras."
            bloqueada={cerrada !== null}
            textoCerrada="Comprobada"
            permiteComprobar
            solucion={solucion.bloques.length > 0 ? solucion : undefined}
            extra={
              <>
                <p className="mt-2 rounded-xl bg-ink-50 px-4 py-2 text-sm font-bold text-ink-600">
                  Pista: {practica.pista}
                </p>
                {practica.suelo ? <SueloBaldosas curso={curso} /> : null}
                {practica.recorrido ? (
                  <RecorridoBaldosas recorrido={practica.recorrido} curso={curso} />
                ) : null}
                <AvisoHub />
              </>
            }
          />
        );
      })}
    </div>
  );
}
