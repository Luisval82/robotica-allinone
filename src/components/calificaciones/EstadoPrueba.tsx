// La chapa de estado de una PRUEBA en la pestaña de calificaciones.
//
// Los cuatro estados se distinguen por color Y por texto, no solo por color:
// quien no distinga el verde del rojo tiene que poder leerlo igual.

import { CheckIcon, ClockIcon, LockIcon } from "@/components/ui/icons";
import type { EstadoPrueba as Estado } from "@/lib/calificaciones";

const CHAPA: Record<Estado, { texto: string; clase: string }> = {
  corregida: { texto: "Corregida", clase: "bg-nivel-bien text-white" },
  pendiente: { texto: "Pendiente de corrección", clase: "bg-hub-400 text-ink-900" },
  "sin-entregar": { texto: "No entregada", clase: "bg-ink-200 text-ink-700" },
  bloqueada: { texto: "Bloqueada", clase: "bg-ink-700 text-white" },
};

function Icono({ estado }: { estado: Estado }) {
  if (estado === "corregida") return <CheckIcon className="size-3.5" />;
  if (estado === "pendiente") return <ClockIcon className="size-3.5" />;
  if (estado === "bloqueada") return <LockIcon className="size-3.5" />;
  return null;
}

export function ChapaEstado({ estado }: { estado: Estado }) {
  const { texto, clase } = CHAPA[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${clase}`}
    >
      <Icono estado={estado} />
      {texto}
    </span>
  );
}
