// «El color dice la medida»: las vigas y los ejes de la caja, dibujados a
// escala unos encima de otros, como una regla.
//
// En esta caja no hay que contar agujeros para encontrar una pieza: la viga
// amarilla es la de 3 y la morada es la de 5. Un alumno de 1º de ESO tarda
// diez segundos en contar los agujeros de una viga de 11 y medio segundo en
// ver que es morada y larga. Dibujadas todas a la misma escala, la diferencia
// de tamaño se ve de un vistazo y el color se aprende solo.
//
// Las medidas, las cantidades y los colores salen del catálogo del set
// (src/lib/piezas.ts), que a su vez sale de la hoja de inventario de la caja.

import { getPieza, VIGAS_DEL_SET, EJES_DEL_SET } from "@/lib/piezas";
import { oscurecer } from "@/components/unidad/PiezasMontaje";

/** Lo más largo de cada familia, para que todas se dibujen a la misma escala. */
const LARGO_MAXIMO = 15;

function Fila({ id }: { id: string }) {
  const pieza = getPieza(id);
  const modulos = pieza.modulos ?? 0;
  const esEje = pieza.familia === "transmision";

  return (
    <li className="grid grid-cols-[1.6rem_1fr_2.2rem] items-center gap-2">
      <span className="text-right text-sm font-extrabold text-ink-800">{modulos}</span>

      <span className="block" style={{ width: `${(modulos / LARGO_MAXIMO) * 100}%` }}>
        <svg
          viewBox={`0 0 ${modulos * 10} 18`}
          className="h-4 w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {esEje ? (
            <>
              <rect x="0" y="5" width={modulos * 10} height="8" rx="1.4" fill={pieza.color} />
              <rect
                x="0"
                y="7.6"
                width={modulos * 10}
                height="2.8"
                fill={oscurecer(pieza.color, 0.25)}
              />
            </>
          ) : (
            <>
              <rect x="0" y="2" width={modulos * 10} height="14" rx="7" fill={pieza.color} />
              {Array.from({ length: modulos }, (_, i) => (
                <circle
                  key={i}
                  cx={5 + i * 10}
                  cy={9}
                  r="3.1"
                  fill="#ffffff"
                  stroke={oscurecer(pieza.color)}
                  strokeWidth="1"
                />
              ))}
            </>
          )}
        </svg>
      </span>

      <span className="text-sm font-semibold text-ink-500">×{pieza.enLaCaja}</span>
    </li>
  );
}

export function ReglaDeColores({ ejes = true }: { ejes?: boolean }) {
  return (
    <section className="rounded-card bg-white p-4 sm:p-5">
      <h5 className="font-display text-lg font-semibold text-ink-900">El color dice la medida</h5>
      <p className="mt-0.5 text-sm font-semibold text-ink-600">
        No hace falta contar agujeros: en tu caja cada medida tiene su color.
      </p>

      <div className={`mt-3 grid gap-5 ${ejes ? "sm:grid-cols-2" : ""}`}>
        <div>
          <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-500">Vigas</p>
          <ul className="grid gap-1.5">
            {VIGAS_DEL_SET.map((id) => (
              <Fila key={id} id={id} />
            ))}
          </ul>
        </div>

        {ejes ? (
          <div>
            <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-500">Ejes</p>
            <ul className="grid gap-1.5">
              {EJES_DEL_SET.map((id) => (
                <Fila key={id} id={id} />
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-sm font-semibold text-ink-500">
        El número de la izquierda son los agujeros (los módulos) y el de la derecha, cuántas trae
        la caja.
      </p>
    </section>
  );
}
