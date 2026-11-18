// Dibuja el interior de un bloque tal como se ve en la app SPIKE: el icono,
// las fichas de desplegable (con su ▾), las palabras y los huecos blancos de
// los valores. Las piezas vienen de «partes» en src/data/bloques.json y los
// valores de cada ejercicio, de «valores» en la fila del programa.
//
// Los iconos están calcados de capturas de la app: la pieza blanca es el
// dibujo y los huecos van en el color de la categoría (currentColor).

import type { ReactNode } from "react";
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

/**
 * El icono del bloque y la raya que lo separa de las palabras.
 *
 * El bloque de sombrero es la excepción: su triángulo de reproducción va
 * pegado a las palabras, sin raya, igual que en la app.
 */
function Icono({
  ancho,
  conRaya = true,
  children,
}: {
  ancho: number;
  conRaya?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <span className="word-block__icono">
        <svg viewBox={`0 0 ${ancho} 25`} className="h-full w-auto" aria-hidden="true">
          {children}
        </svg>
      </span>
      {conRaya ? <span className="word-block__raya" aria-hidden="true" /> : null}
    </>
  );
}

/** Icono de la izquierda del bloque. El dibujo es blanco; los huecos, del color. */
export function BlockPartIcon({ nombre }: { nombre: string }) {
  if (nombre === "play") {
    // El triángulo blanco de «Cuando se inicia el programa»: la bandera de
    // salida. Va solo, sin raya, y con las puntas redondeadas como en la app.
    return (
      <Icono ancho={16} conRaya={false}>
        <path
          d="M4.4 4.6 14.6 12.5 4.4 20.4Z"
          fill="#fff"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
      </Icono>
    );
  }
  if (nombre === "motor") {
    // Una polea: 22 x 22 px en la app.
    return (
      <Icono ancho={25}>
        <circle cx="12.5" cy="12.5" r="11.5" fill="#fff" />
        <Agujeros cx={12.5} cy={12.5} />
      </Icono>
    );
  }
  if (nombre === "movimiento") {
    // Dos poleas, una detrás de otra: la base de conducción.
    return (
      <Icono ancho={24}>
        <circle cx="15.5" cy="9.5" r="8.2" fill="#fff" />
        <circle cx="15.5" cy="9.5" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="9.6" cy="13.6" r="9.4" fill="#fff" />
        <circle cx="9.6" cy="13.6" r="9.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <Agujeros cx={9.6} cy={13.6} r={2.3} />
      </Icono>
    );
  }
  if (nombre === "luz") {
    // El Hub visto de frente: la matriz y el botón central.
    // El Hub es vertical: 16 x 25 px en la app.
    return (
      <Icono ancho={16}>
        <rect x="0.6" y="0.5" width="14.8" height="24" rx="3" fill="#fff" />
        {[0, 1, 2, 3].map((fila) =>
          [0, 1, 2, 3].map((col) => (
            <rect
              key={`${fila}-${col}`}
              x={2.9 + col * 2.9}
              y={5 + fila * 3}
              width="2"
              height="2"
              fill="currentColor"
            />
          )),
        )}
        <circle cx="8" cy="20.3" r="1.7" fill="currentColor" />
      </Icono>
    );
  }
  if (nombre === "distancia") {
    return (
      <Icono ancho={28}>
        <rect x="0.5" y="5" width="27" height="15" rx="3.6" fill="#fff" />
        <circle cx="9.5" cy="12.5" r="3.6" fill="currentColor" />
        <circle cx="18.5" cy="12.5" r="3.6" fill="currentColor" />
      </Icono>
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
