"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/actions/auth";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { DemoCredentials } from "@/components/auth/DemoCredentials";
import { FormError } from "@/components/auth/FormError";
import { PasswordField } from "@/components/auth/PasswordField";
import { Field } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ArrowRightIcon, MailIcon } from "@/components/ui/icons";
import type { DemoCredential } from "@/lib/types";
import { BotonGoogle } from "@/components/auth/BotonGoogle";
import { EMPTY_AUTH_STATE, SCHOOL_EMAIL_SUFFIX, validateEmail } from "@/lib/validation";

export function LoginForm({
  demoUsers,
  googleActivo,
  aviso,
}: {
  demoUsers: DemoCredential[];
  /** Si están puestas las credenciales de Google, se enseña su botón. */
  googleActivo: boolean;
  /** Lo que haya ido mal al volver de Google, para contarlo arriba del todo. */
  aviso?: string;
}) {
  const [state, formAction, pending] = useActionState(loginAction, EMPTY_AUTH_STATE);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Mientras no se toca el campo se muestra el error del servidor; después,
  // la comprobación del correo corporativo es inmediata.
  const [emailTouched, setEmailTouched] = useState(false);

  const emailError = emailTouched ? validateEmail(email) : state.fieldErrors?.email;

  function fillWith(user: DemoCredential) {
    setEmail(user.email);
    setPassword(user.password);
    setEmailTouched(true);
  }

  return (
    <>
      <div className="rounded-card bg-white p-6 shadow-card sm:p-9">
        <AuthTabs active="login" />

        {aviso ? (
          <p
            role="alert"
            className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 p-4 font-bold text-red-700"
          >
            {aviso}
          </p>
        ) : null}

        <h1 className="font-display text-3xl font-semibold text-ink-900">Inicia sesión</h1>
        <p className="mt-1.5 font-semibold text-ink-500">
          Entra con tu correo del colegio y sigue donde lo dejaste.
        </p>

        {googleActivo ? (
          <>
            <div className="mt-7">
              <BotonGoogle />
            </div>
            <div className="my-7 flex items-center gap-4">
              <span className="h-0.5 flex-1 rounded-full bg-ink-100" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-ink-400">
                o con contraseña
              </span>
              <span className="h-0.5 flex-1 rounded-full bg-ink-100" />
            </div>
          </>
        ) : null}

        <form action={formAction} noValidate className={`grid gap-5 ${googleActivo ? "" : "mt-7"}`}>
          <FormError message={state.error} />

          <Field
            id="login-email"
            name="email"
            label="Correo del colegio"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={`nombre.apellido${SCHOOL_EMAIL_SUFFIX}`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setEmailTouched(email !== "")}
            required
            error={emailError}
            hint={`Solo valen correos que terminan en ${SCHOOL_EMAIL_SUFFIX}`}
            icon={<MailIcon className="size-5" />}
          />

          <PasswordField
            id="login-password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            error={password === "" ? state.fieldErrors?.password : undefined}
          />

          <SubmitButton pending={pending} pendingLabel="Entrando…">
            Entrar
            <ArrowRightIcon className="size-5" />
          </SubmitButton>
        </form>
      </div>

      <DemoCredentials users={demoUsers} onPick={fillWith} />
    </>
  );
}
