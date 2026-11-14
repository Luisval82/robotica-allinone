"use server";

// Acciones de servidor de los formularios: iniciar sesión, registrarse y salir.

import { redirect } from "next/navigation";
import { endSession, startSession } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { LOGIN_PATH, ROLE_HOME } from "@/lib/routes";
import { isCourse } from "@/lib/types";
import {
  normalizeEmail,
  validateLogin,
  validateRegistration,
  type AuthFormState,
} from "@/lib/validation";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function loginAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(field(formData, "email"));
  const password = field(formData, "password");

  const fieldErrors = validateLogin({ email, password });
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "El correo o la contraseña no coinciden. Revísalos y vuelve a intentarlo." };
  }

  await startSession(user);
  // Redirección automática al panel de su rol: admin, profesor o alumno.
  redirect(ROLE_HOME[user.role]);
}

export async function registerAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = field(formData, "name").trim();
  const email = normalizeEmail(field(formData, "email"));
  const password = field(formData, "password");
  const course = field(formData, "course");

  const fieldErrors = validateRegistration({ name, email, password, course });
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
  if (!isCourse(course)) return { fieldErrors: { course: "Elige tu curso." } };

  if (await findUserByEmail(email)) {
    return { error: "Ya hay una cuenta con este correo. Ve a «Iniciar sesión» y entra con ella." };
  }

  const user = await createUser({ name, email, password, course });
  await startSession(user);
  redirect(ROLE_HOME[user.role]);
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect(LOGIN_PATH);
}
