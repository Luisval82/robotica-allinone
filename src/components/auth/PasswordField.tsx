"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { EyeIcon, EyeOffIcon, LockIcon } from "@/components/ui/icons";

/** Campo de contraseña con botón para verla u ocultarla. */
export function PasswordField({
  id,
  value,
  onChange,
  error,
  hint,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  autoComplete: "current-password" | "new-password";
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      id={id}
      name="password"
      label="Contraseña"
      type={visible ? "text" : "password"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      autoComplete={autoComplete}
      required
      error={error}
      hint={hint}
      icon={<LockIcon className="size-5" />}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar contraseña" : "Ver contraseña"}
          aria-pressed={visible}
          className="grid size-10 place-items-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
        >
          {visible ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
        </button>
      }
    />
  );
}
