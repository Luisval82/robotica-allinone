import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { SHOW_DEMO_CREDENTIALS } from "@/config/site";
import { getDemoCredentials } from "@/lib/db";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  // Las credenciales de prueba solo viajan al navegador si están activadas.
  const demoUsers = SHOW_DEMO_CREDENTIALS ? await getDemoCredentials() : [];
  return <LoginForm demoUsers={demoUsers} />;
}
