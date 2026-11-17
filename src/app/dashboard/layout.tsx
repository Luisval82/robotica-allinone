import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { getSession } from "@/lib/auth";
import { BIENVENIDA_PATH, LOGIN_PATH } from "@/lib/routes";

// Marco común de los tres paneles. Nadie llega aquí sin sesión.
export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);

  // Un alumno sin curso es alguien que acaba de entrar con Google y todavía
  // no ha dicho quién es: no puede usar la plataforma hasta completarlo.
  if (session.role === "alumno" && session.course === null) redirect(BIENVENIDA_PATH);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header user={session} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
