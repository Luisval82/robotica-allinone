// «Lo que tienes que coger de la caja»: lo primero que ve el alumno antes de
// empezar a montar. Las piezas del modelo, con su dibujo y su cantidad, en el
// orden en el que se cogen: primero lo que se enchufa y luego lo que se monta.

import { PiezaSpike } from "@/components/unidad/PiezasMontaje";
import { getPieza, ordenarMateriales, type Material } from "@/lib/piezas";

export function PiezasNecesarias({
  materiales,
  descripcion,
}: {
  materiales: Material[];
  /** La frase de siempre, por si el dibujo se queda corto. */
  descripcion: string;
}) {
  if (materiales.length === 0) {
    return <p className="font-semibold text-ink-700">{descripcion}</p>;
  }

  const ordenados = ordenarMateriales(materiales);
  const sinCantidad = ordenados.filter((m) => m.cantidad === undefined).length;

  return (
    <section aria-labelledby="piezas-necesarias" className="rounded-card bg-ink-50 p-5 sm:p-6">
      <h4 id="piezas-necesarias" className="font-display text-xl font-semibold text-ink-900">
        Prepara estas piezas de tu caja
      </h4>
      <p className="mt-1 font-semibold text-ink-600">{descripcion}</p>

      <div className="mt-4 flex flex-wrap gap-4">
        {ordenados.map((material) => (
          <PiezaSpike
            key={material.pieza}
            pieza={material.pieza}
            cantidad={material.cantidad}
            nota={material.nota}
          />
        ))}
      </div>

      {sinCantidad > 0 ? (
        <p className="mt-3 text-sm font-semibold text-ink-500">
          Las piezas sin número son las que vayas necesitando: coge las que te pidan los pasos.
        </p>
      ) : null}

      <ul className="mt-4 grid gap-1 text-sm font-semibold text-ink-600">
        {ordenados.map((material) => {
          const pieza = getPieza(material.pieza);
          return pieza.pista ? (
            <li key={material.pieza}>
              <span className="font-extrabold text-ink-800">{pieza.nombre}:</span> {pieza.pista}
            </li>
          ) : null;
        })}
      </ul>
    </section>
  );
}
