import { HubIllustration } from "@/components/brand/Hub";
import { BlockValue, WordBlock } from "@/components/brand/WordBlock";

/**
 * Panel de bienvenida junto al formulario: el Hub y el primer programa del
 * temario (UD 1 de 1º ESO), con bloques de palabras.
 */
export function AuthShowcase() {
  return (
    <section
      aria-label="Bienvenida"
      className="hidden flex-col justify-between gap-10 rounded-card bg-spike-600 p-10 text-white lg:flex"
    >
      <div>
        {/* Lema decorativo: el título real (h1) de la página está en el formulario */}
        <p className="font-display text-5xl font-semibold leading-[1.05]">
          Monta el robot.
          <br />
          Encaja los bloques.
          <br />
          <span className="text-hub-300">Dale al botón.</span>
        </p>
        <p className="mt-5 max-w-sm text-lg font-semibold text-spike-100">
          Robótica con SPIKE Prime para 1º, 2º y 3º de ESO: nueve unidades por curso, cada una con
          su modelo y su programa.
        </p>
      </div>

      <div className="flex items-end gap-8">
        <HubIllustration className="w-36 shrink-0 drop-shadow-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col text-[0.95rem]">
            <WordBlock tone="eventos">Cuando se inicia el programa</WordBlock>
            <WordBlock tone="luz">
              Encender la matriz de luces 5x5 <BlockValue>2</BlockValue> segundos
            </WordBlock>
            <WordBlock tone="sonido">
              Tocar nota <BlockValue>0.5</BlockValue> segundos
            </WordBlock>
          </div>
          <p className="mt-4 text-sm font-bold text-spike-100">
            Unidad 1 · 1º ESO — Hola, Hub: luces y sonidos
          </p>
        </div>
      </div>
    </section>
  );
}
