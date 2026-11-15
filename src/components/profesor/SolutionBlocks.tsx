import { BLOCK_TONE_CLASS, type BlockTone } from "@/components/brand/WordBlock";
import type { SolutionBlock } from "@/lib/types";

function toneClass(categoria: string): string {
  return categoria in BLOCK_TONE_CLASS
    ? BLOCK_TONE_CLASS[categoria as BlockTone]
    : BLOCK_TONE_CLASS.control;
}

/** Pinta una solución como pila de bloques de palabras, con su sangría. */
export function SolutionBlocks({ blocks }: { blocks: SolutionBlock[] }) {
  return (
    <ol aria-label="Programa de la solución" className="flex flex-col items-start">
      {blocks.map((block, index) => (
        <li
          key={index}
          className={`word-block max-w-full text-[0.95rem] ${toneClass(block.categoria)}`}
          style={{ marginLeft: `${block.nivel * 1.75}rem` }}
        >
          {block.texto}
        </li>
      ))}
    </ol>
  );
}
