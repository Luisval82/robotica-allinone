"use client";

import { useFormStatus } from "react-dom";
import { LockIcon, LockOpenIcon } from "@/components/ui/icons";

/**
 * Interruptor abierto/bloqueado. Va dentro de un <form> con una acción de
 * servidor: al pulsarlo se envía el formulario y, mientras se guarda, late.
 */
export function SwitchButton({
  checked,
  label,
  disabled = false,
}: {
  checked: boolean;
  /** Nombre accesible: qué abre o cierra este interruptor y para quién. */
  label: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || pending}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed ${
        checked ? "bg-spike-600" : "bg-ink-300"
      } ${pending ? "animate-pulse" : ""} ${disabled ? "opacity-45" : ""}`}
    >
      <span
        className={`grid size-6 place-items-center rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      >
        {checked ? (
          <LockOpenIcon className="size-3.5 text-spike-700" />
        ) : (
          <LockIcon className="size-3.5 text-ink-500" />
        )}
      </span>
    </button>
  );
}
