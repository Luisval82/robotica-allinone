import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PerfilForm } from "@/components/auth/PerfilForm";
import { getSession } from "@/lib/auth";
import { LOGIN_PATH, ROLE_HOME } from "@/lib/routes";

export const metadata: Metadata = { title: "Bienvenido" };

/**
 * Primera entrada con la cuenta del colegio: el alumno dice su nombre y
 * elige curso. Quien ya lo tiene hecho no pasa por aquí.
 */
export default async function BienvenidaPage() {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);
  if (session.role !== "alumno" || session.course !== null) redirect(ROLE_HOME[session.role]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6">
        <div className="rounded-card bg-white p-6 shadow-card sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-widest text-spike-700">
            Primera vez por aquí
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">
            ¡Bienvenido a ROBOTICA ALLINONE!
          </h1>
          <p className="mt-2 font-semibold text-ink-600">
            Has entrado con <span className="font-mono text-ink-900">{session.email}</span>. Solo
            falta saber quién eres y a qué curso vas.
          </p>
          <PerfilForm nombreSugerido={session.name} />
        </div>
      </main>
    </div>
  );
}
