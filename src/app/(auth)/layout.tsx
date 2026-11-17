import type { ReactNode } from "react";
import { Splash } from "@/components/brand/Splash";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { Header } from "@/components/layout/Header";

// Marco común de /login y /registro: cabecera, panel de bienvenida y formulario.
export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Splash />
      <Header />
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_minmax(0,30rem)] lg:items-stretch lg:py-12">
        <AuthShowcase />
        <div className="mx-auto w-full max-w-lg lg:max-w-none">{children}</div>
      </main>
    </div>
  );
}
