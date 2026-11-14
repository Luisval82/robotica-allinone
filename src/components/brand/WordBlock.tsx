// Bloque de palabras decorativo. Los colores siguen las categorías de bloques
// (ver --color-block-* en src/app/globals.css).

import type { ReactNode } from "react";

const TONES = {
  eventos: "bg-block-eventos text-ink-900",
  motores: "bg-block-motores text-white",
  movimiento: "bg-block-movimiento text-white",
  luz: "bg-block-luz text-white",
  sonido: "bg-block-sonido text-white",
  control: "bg-block-control text-ink-900",
  sensores: "bg-block-sensores text-ink-900",
  operadores: "bg-block-operadores text-ink-900",
  variables: "bg-block-variables text-ink-900",
} as const;

export type BlockTone = keyof typeof TONES;

/** Clases de color de cada categoría, por si se necesitan fuera del bloque. */
export const BLOCK_TONE_CLASS: Record<BlockTone, string> = TONES;

export function WordBlock({
  tone,
  children,
  className = "",
}: {
  tone: BlockTone;
  children: ReactNode;
  className?: string;
}) {
  return <div className={`word-block ${TONES[tone]} ${className}`}>{children}</div>;
}

/** Hueco blanco redondeado donde va el valor de un bloque (segundos, grados…). */
export function BlockValue({ children }: { children: ReactNode }) {
  return (
    <span className="mx-1 inline-block rounded-full bg-white px-2.5 text-ink-900">{children}</span>
  );
}
