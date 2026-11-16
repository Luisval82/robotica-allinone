// Dibuja el interior de un bloque tal como se ve en la app SPIKE: el icono
// redondo, las fichas de desplegable (con su ▾), las palabras y los huecos
// blancos de los valores. Las piezas vienen de «partes» en src/data/bloques.json
// y los valores de cada ejercicio, de «valores» en la fila del programa.

import { isFillable, type BlockInfo } from "@/lib/bloques";

/** Icono redondo de la izquierda del bloque. Su color es el de la categoría. */
export function BlockPartIcon({ nombre }: { nombre: string }) {
  if (nombre === "motor") {
    return (
      <span className="word-block__icono">
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="2.6" fill="currentColor" />
          <path
            d="M12 3.2v3.4M12 17.4v3.4M3.2 12h3.4M17.4 12h3.4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  return null;
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
