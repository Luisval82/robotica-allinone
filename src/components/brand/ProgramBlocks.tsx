// Bloques de palabras dibujados a partir del catálogo (src/data/bloques.json):
// un bloque suelto (BlockChip) o un programa entero con su sangría (ProgramBlocks).

import type { CSSProperties } from "react";
import { blockClass, getBlockInfo } from "@/lib/bloques";
import type { ProgramRow } from "@/lib/types";

/** Un bloque con su forma y su color. `valor` se pinta en un hueco blanco. */
export function BlockChip({
  texto,
  valor,
  className = "",
  style,
}: {
  texto: string;
  valor?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`${blockClass(getBlockInfo(texto))} word-block--suelto inline-block ${className}`}
      style={style}
    >
      {texto}
      {valor ? (
        <span className="ml-2 inline-block rounded-full bg-white px-2.5 font-bold text-ink-900">
          {valor}
        </span>
      ) : null}
    </span>
  );
}

/** Un programa: pila de bloques con sangría. Sirve para soluciones y para entregas. */
export function ProgramBlocks({ rows, label }: { rows: ProgramRow[]; label: string }) {
  return (
    <ol aria-label={label} className="program-stack flex flex-col items-start text-[0.95rem]">
      {rows.map((row, index) => (
        <li
          key={index}
          className={`${blockClass(getBlockInfo(row.texto))} max-w-full`}
          style={{ marginLeft: `${row.nivel * 1.75}rem` }}
        >
          {row.texto}
          {row.valor ? (
            <span className="ml-2 inline-block rounded-full bg-white px-2.5 font-bold text-ink-900">
              {row.valor}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
