"use client";

import { useActionState, useState } from "react";
import { registerAction } from "@/actions/auth";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { FormError } from "@/components/auth/FormError";
import { PasswordField } from "@/components/auth/PasswordField";
import { Field } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { MailIcon, UserIcon } from "@/components/ui/icons";
import { COURSES, type Course } from "@/lib/types";
import {
  EMPTY_AUTH_STATE,
  MIN_PASSWORD_LENGTH,
  SCHOOL_EMAIL_SUFFIX,
  validateEmail,
  validatePassword,
} from "@/lib/validation";

// "1ESO" → "1º"
function courseNumber(course: Course): string {
  return `${course.charAt(0)}º`;
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, EMPTY_AUTH_STATE);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [course, setCourse] = useState<Course | "">("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Tras tocar un campo, su comprobación es inmediata; antes se muestra
  // lo que haya respondido el servidor.
  const emailError = emailTouched ? validateEmail(email) : state.fieldErrors?.email;
  const passwordError = passwordTouched
    ? validatePassword(password)
    : state.fieldErrors?.password;
  const nameError = name.trim().length >= 2 ? undefined : state.fieldErrors?.name;
  const courseError = course === "" ? state.fieldErrors?.course : undefined;

  return (
    <div className="rounded-card bg-white p-6 shadow-card sm:p-9">
      <AuthTabs active="registro" />

      <h1 className="font-display text-3xl font-semibold text-ink-900">Crea tu cuenta</h1>
      <p className="mt-1.5 font-semibold text-ink-500">
        Necesitas tu correo del colegio. Tardas menos de un minuto.
      </p>

      <form action={formAction} noValidate className="mt-7 grid gap-5">
        <FormError message={state.error} />

        <Field
          id="register-name"
          name="name"
          label="Nombre y apellidos"
          type="text"
          autoComplete="name"
          placeholder="Nombre Apellido"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          error={nameError}
          icon={<UserIcon className="size-5" />}
        />

        <Field
          id="register-email"
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

        <div onBlur={() => setPasswordTouched(password !== "")}>
          <PasswordField
            id="register-password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            error={passwordError}
            hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
          />
        </div>

        <fieldset aria-describedby="register-course-help">
          <legend className="mb-1.5 text-sm font-extrabold text-ink-800">Curso</legend>
          <div className="grid grid-cols-3 gap-3">
            {COURSES.map((option) => (
              <label key={option} className="cursor-pointer">
                <input
                  type="radio"
                  name="course"
                  value={option}
                  checked={course === option}
                  onChange={() => setCourse(option)}
                  className="peer sr-only"
                />
                <span className="flex flex-col items-center rounded-2xl border-2 border-ink-200 bg-white py-3 text-ink-700 shadow-press-ink transition peer-checked:border-spike-600 peer-checked:bg-spike-600 peer-checked:text-white peer-checked:shadow-press-spike peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-spike-400">
                  <span className="font-display text-3xl font-semibold leading-none">
                    {courseNumber(option)}
                  </span>
                  <span className="mt-1 text-xs font-extrabold uppercase tracking-widest">ESO</span>
                </span>
              </label>
            ))}
          </div>
          {courseError ? (
            <p role="alert" className="mt-2.5 text-sm font-bold text-red-700">
              {courseError}
            </p>
          ) : null}
          <p id="register-course-help" className="mt-2.5 text-sm text-ink-500">
            ¿Eres docente? Elige cualquier curso: el superadministrador te dará después el rol de
            Profesor.
          </p>
        </fieldset>

        <SubmitButton pending={pending} pendingLabel="Creando tu cuenta…">
          Crear cuenta
        </SubmitButton>
      </form>
    </div>
  );
}
