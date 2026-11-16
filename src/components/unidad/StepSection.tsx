import type { ReactNode } from "react";
import { completeStepAction } from "@/actions/alumno";
import { PendingButton } from "@/components/ui/PendingButton";
import { CheckIcon, LockIcon } from "@/components/ui/icons";

export type StepState = "hecho" | "actual" | "bloqueado";

const STATE_LABEL: Record<StepState, string> = {
  hecho: "Hecho",
  actual: "Ahora",
  bloqueado: "Bloqueado",
};

function StepHeader({
  eyebrow,
  titulo,
  estado,
  tone,
  marca,
}: {
  eyebrow: string;
  titulo: string;
  estado: StepState;
  tone: string;
  marca: ReactNode;
}) {
  const locked = estado === "bloqueado";

  return (
    <div
      className={`flex items-center gap-4 px-6 py-4 ${locked ? "bg-ink-200 text-ink-600" : tone}`}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white font-display text-xl font-semibold text-ink-900">
        {estado === "hecho" ? (
          <CheckIcon className="size-5" />
        ) : locked ? (
          <LockIcon className="size-5 text-ink-500" />
        ) : (
          marca
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-extrabold uppercase tracking-widest">{eyebrow}</span>
        <span className="block font-display text-2xl font-semibold leading-tight">{titulo}</span>
      </span>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${
          locked ? "bg-ink-700 text-white" : "bg-white text-ink-900"
        }`}
      >
        {STATE_LABEL[estado]}
      </span>
    </div>
  );
}

/**
 * Contenedor de un paso de la unidad. Los pasos van en orden:
 *  · hecho      → plegado; se puede volver a abrir para repasar.
 *  · actual     → abierto, con el botón «He terminado este paso».
 *  · bloqueado  → solo la cabecera, con candado.
 * Sin `paso`, es un contenedor final (la PRUEBA): no lleva botón de terminar.
 */
export function StepSection({
  id,
  eyebrow,
  titulo,
  estado,
  tone,
  marca,
  lockedText,
  unidad,
  paso,
  children,
}: {
  id: string;
  eyebrow: string;
  titulo: string;
  estado: StepState;
  /** Clases de color de la cabecera (bg-block-* text-ink-900). */
  tone: string;
  /** Lo que se ve en el círculo cuando el paso está en curso: su número. */
  marca: ReactNode;
  lockedText: string;
  unidad: number;
  paso?: number;
  children: ReactNode;
}) {
  const header = (
    <StepHeader eyebrow={eyebrow} titulo={titulo} estado={estado} tone={tone} marca={marca} />
  );
  const shell = "scroll-mt-24 overflow-hidden rounded-card bg-white shadow-card";

  if (estado === "bloqueado") {
    return (
      <section id={id} aria-label={titulo} className={shell}>
        {header}
        <p className="px-6 py-5 font-semibold text-ink-500">{lockedText}</p>
      </section>
    );
  }

  if (estado === "hecho") {
    return (
      <section id={id} aria-label={titulo} className={shell}>
        <details>
          <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            {header}
            <span className="block px-6 py-3 text-sm font-bold text-ink-500">
              Pulsa para repasar este paso
            </span>
          </summary>
          <div className="border-t-2 border-ink-100 p-6 sm:p-8">{children}</div>
        </details>
      </section>
    );
  }

  return (
    <section id={id} aria-label={titulo} className={shell}>
      {header}
      <div className="p-6 sm:p-8">
        {children}
        {paso ? (
          <form action={completeStepAction} className="mt-8 border-t-2 border-ink-100 pt-6">
            <input type="hidden" name="unidad" value={unidad} />
            <input type="hidden" name="paso" value={paso} />
            <PendingButton pendingLabel="Guardando…">
              <CheckIcon className="size-4" />
              He terminado este paso
            </PendingButton>
          </form>
        ) : null}
      </div>
    </section>
  );
}
