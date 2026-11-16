// Bloques de palabras dibujados a partir del catálogo (src/data/bloques.json):
// un bloque suelto (BlockChip) o un programa entero con su sangría (ProgramBlocks).

import type { CSSProperties } from "react";
import { BlockParts } from "@/components/brand/BlockParts";
import { blockClass, getBlockInfo } from "@/lib/bloques";
import type { ProgramRow } from "@/lib/types";

/**
 * Lo de dentro de un bloque. Si está dibujado pieza a pieza (como en la app
 * SPIKE), se pinta así; si no, el nombre y su valor en un hueco blanco.
 */
function BlockBody({ texto, valor, valores }: ProgramRow) {
  const info = getBlockInfo(texto);
  if (info.partes) return <BlockParts info={info} valores={valores} />;
  return (
    <>
      {texto}
      {valor ? (
        <span className="ml-2 inline-block rounded-full bg-white px-2.5 font-bold text-ink-900">
          {valor}
        </span>
      ) : null}
    </>
  );
}

/** Un bloque suelto con su forma y su color. */
export function BlockChip({
  texto,
  valor,
  valores,
  className = "",
  style,
}: {
  texto: string;
  valor?: string;
  valores?: string[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`${blockClass(getBlockInfo(texto))} word-block--suelto inline-block ${className}`}
      style={style}
    >
      <BlockBody texto={texto} valor={valor} valores={valores} nivel={0} />
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
          <BlockBody {...row} />
        </li>
      ))}
    </ol>
  );
}
