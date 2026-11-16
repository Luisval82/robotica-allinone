// Dibuja el interior de un bloque tal como se ve en la app SPIKE: el icono,
// las fichas de desplegable (con su ▾), las palabras y los huecos blancos de
// los valores. Las piezas vienen de «partes» en src/data/bloques.json y los
// valores de cada ejercicio, de «valores» en la fila del programa.
//
// Los iconos están calcados de capturas de la app: la pieza blanca es el
// dibujo y los huecos van en el color de la categoría (currentColor).

import { isFillable, type BlockInfo } from "@/lib/bloques";

/** Colores del selector de la luz del botón central, como se ven en la app. */
const COLORES: Record<string, string> = {
  rosa: "#ff2d9e",
  morado: "#8b4dff",
  azul: "#0a5bff",
  celeste: "#17b5ff",
  "verde azulado": "#00c6a7",
  verde: "#00c42b",
  amarillo: "#ffd500",
  naranja: "#ff8a00",
  rojo: "#ff1d1d",
  blanco: "#ffffff",
  apagado: "#2b2b52",
};

/** Los cuatro agujeros de una polea de motor. */
function Agujeros({ cx, cy, r = 2.75 }: { cx: number; cy: number; r?: number }) {
  const d = 5.6;
  return (
    <>
      <circle cx={cx} cy={cy - d} r={r} fill="currentColor" />
      <circle cx={cx} cy={cy + d} r={r} fill="currentColor" />
      <circle cx={cx - d} cy={cy} r={r} fill="currentColor" />
      <circle cx={cx + d} cy={cy} r={r} fill="currentColor" />
      <circle cx={cx} cy={cy} r={1.5} fill="currentColor" />
    </>
  );
}

/** Icono de la izquierda del bloque. El dibujo es blanco; los huecos, del color. */
export function BlockPartIcon({ nombre }: { nombre: string }) {
  if (nombre === "motor") {
    return (
      <span className="word-block__icono">
        <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#fff" />
          <Agujeros cx={12} cy={12} />
        </svg>
      </span>
    );
  }
  if (nombre === "movimiento") {
    // Dos poleas, una detrás de otra: la base de conducción.
    return (
      <span className="word-block__icono">
        <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true">
          <circle cx="15.5" cy="10.5" r="8.5" fill="#fff" />
          <circle cx="15.5" cy="10.5" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="9.8" cy="13.2" r="9.6" fill="#fff" />
          <circle cx="9.8" cy="13.2" r="9.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <Agujeros cx={9.8} cy={13.2} r={2.4} />
        </svg>
      </span>
    );
  }
  if (nombre === "luz") {
    // El Hub visto de frente: la matriz y el botón central.
    return (
      <span className="word-block__icono">
        <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true">
          <rect x="5" y="1.6" width="14" height="20.8" rx="2.8" fill="#fff" />
          {[0, 1, 2, 3].map((fila) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${fila}-${col}`}
                x={7 + col * 2.9}
                y={4.6 + fila * 2.9}
                width="2.1"
                height="2.1"
                fill="currentColor"
              />
            )),
          )}
          <circle cx="12" cy="18.9" r="1.7" fill="currentColor" />
        </svg>
      </span>
    );
  }
  if (nombre === "distancia") {
    return (
      <span className="word-block__icono">
        <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true">
          <rect x="1.5" y="5" width="21" height="14" rx="3.4" fill="#fff" />
          <circle cx="8.3" cy="12" r="3.3" fill="currentColor" />
          <circle cx="15.7" cy="12" r="3.3" fill="currentColor" />
        </svg>
      </span>
    );
  }
  return null;
}

/** La bolita de color de un selector de color. */
export function BlockPartColor({ valor }: { valor: string }) {
  return (
    <span className="word-block__menu">
      <span
        className="word-block__color"
        style={{ background: COLORES[valor.toLowerCase()] ?? valor }}
        title={valor}
      />
    </span>
  );
}

/**
 * El interior del bloque. `valores` sustituye, en orden, a los desplegables y
 * huecos; lo que no venga se queda con el valor por defecto del bloque.
 */
export function BlockParts({ info, valores }: { info: BlockInfo; valores?: string[] }) {
  if (!info.partes) return null;

  let hueco = -1;
  return (
    <span className="word-block__fila">
      {info.partes.map((parte, index) => {
        if (isFillable(parte)) hueco += 1;
        const valor = (isFillable(parte) ? valores?.[hueco] : undefined) ?? parte.v;

        if (parte.t === "icono") return <BlockPartIcon key={index} nombre={parte.v} />;
        if (parte.t === "color") return <BlockPartColor key={index} valor={valor} />;
        if (parte.t === "menu")
          return (
            <span key={index} className="word-block__menu">
              {valor}
            </span>
          );
        if (parte.t === "hueco")
          return (
            <span key={index} className="word-block__hueco">
              {valor}
            </span>
          );
        return <span key={index}>{valor}</span>;
      })}
    </span>
  );
}
