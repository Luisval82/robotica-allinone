"use server";

// Acciones de servidor de los formularios: iniciar sesión, registrarse y salir.

import { redirect } from "next/navigation";
import { endSession, getSession, startSession } from "@/lib/auth";
import { completarPerfil, createUser, findUserByEmail } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { LOGIN_PATH, ROLE_HOME } from "@/lib/routes";
import { isCourse, type Course } from "@/lib/types";
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

  // Quien entró con Google no tiene contraseña aquí: se le dice por dónde va.
  if (user && user.passwordHash === null) {
    return {
      error: "Esta cuenta entra con Google. Usa el botón «Entrar con la cuenta del colegio».",
    };
  }

  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return { error: "El correo o la contraseña no coinciden. Revísalos y vuelve a intentarlo." };
  }

  // La contraseña es correcta pero la cuenta está desactivada: no entra. Se le
  // dice después de comprobar la contraseña, para no revelar a un desconocido
  // qué cuentas existen y están desactivadas.
  if (!user.activa) {
    return {
      error:
        "Esta cuenta está desactivada. Habla con el administrador de la plataforma para que la vuelva a activar.",
    };
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

/** Primera entrada: el alumno dice su nombre y elige curso. */
export async function completarPerfilAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);

  const name = field(formData, "name").trim().replace(/\s+/g, " ").slice(0, 80);
  const course = field(formData, "course");

  const fieldErrors: Record<string, string> = {};
  if (name.length < 3) fieldErrors.name = "Escribe tu nombre y tus apellidos.";
  if (!isCourse(course)) fieldErrors.course = "Elige tu curso.";
  if (Object.keys(fieldErrors).length > 0 || !isCourse(course)) return { fieldErrors };

  await completarPerfil(session.id, { name, course });
  // La cookie lleva el nombre y el curso: hay que rehacerla para que el panel
  // y la cabecera enseñen ya los datos buenos.
  await startSession({ ...session, name, course });
  redirect(ROLE_HOME[session.role]);
}
