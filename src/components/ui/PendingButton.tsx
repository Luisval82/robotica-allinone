"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

const TONES = {
  primary: "bg-spike-600 text-white shadow-press-spike hover:bg-spike-700",
  neutral: "border-2 border-ink-200 bg-white text-ink-800 shadow-press-ink hover:border-ink-900",
  // Para lo que no se puede deshacer, como el cierre de año escolar.
  danger: "bg-red-600 text-white hover:bg-red-700",
} as const;

/** El tamaño de siempre y uno más pequeño para listados de una línea. */
const TAMANOS = {
  normal: "h-10 px-4 text-sm",
  compacto: "h-8 px-3 text-xs",
} as const;

/**
 * Botón de envío para formularios con acción de servidor: mientras la acción
 * está en marcha se desactiva y muestra `pendingLabel`.
 */
export function PendingButton({
  tone = "primary",
  size = "normal",
  pendingLabel,
  children,
}: {
  tone?: keyof typeof TONES;
  size?: keyof typeof TAMANOS;
  pendingLabel: string;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-extrabold transition active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-70 ${TAMANOS[size]} ${TONES[tone]}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
