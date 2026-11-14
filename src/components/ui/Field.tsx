// Campo de formulario: etiqueta, icono, mensaje de ayuda y mensaje de error.

import type { InputHTMLAttributes, ReactNode } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  /** Elemento a la derecha del campo (p. ej. el botón de ver contraseña). */
  trailing?: ReactNode;
}

export function Field({ id, label, error, hint, icon, trailing, ...inputProps }: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-extrabold text-ink-800">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-13 w-full rounded-2xl border-2 bg-white text-base font-semibold text-ink-900 transition-colors placeholder:font-normal placeholder:text-ink-400 focus:border-spike-500 ${
            icon ? "pl-12" : "pl-4"
          } ${trailing ? "pr-14" : "pr-4"} ${error ? "border-red-500" : "border-ink-200"}`}
          {...inputProps}
        />
        {trailing ? (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</span>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
