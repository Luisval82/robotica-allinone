import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { SHOW_DEMO_CREDENTIALS } from "@/config/site";
import { getDemoCredentials } from "@/lib/db";
import { googleConfigurado } from "@/lib/google";
import { SCHOOL_EMAIL_SUFFIX } from "@/lib/validation";

export const metadata: Metadata = { title: "Iniciar sesión" };

const AVISOS: Record<string, string> = {
  dominio: `Esa cuenta no es del colegio. Entra con tu correo ${SCHOOL_EMAIL_SUFFIX}.`,
  google: "No se ha podido completar la entrada con Google. Inténtalo otra vez.",
  inactiva:
    "Esta cuenta está desactivada. Habla con el administrador de la plataforma para que la vuelva a activar.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Las credenciales de prueba solo viajan al navegador si están activadas.
  const demoUsers = SHOW_DEMO_CREDENTIALS ? await getDemoCredentials() : [];
  const { error } = await searchParams;

  return (
    <LoginForm
      demoUsers={demoUsers}
      googleActivo={googleConfigurado()}
      aviso={error ? AVISOS[error] : undefined}
    />
  );
}
