import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PerfilForm } from "@/components/auth/PerfilForm";
import { getSession } from "@/lib/auth";
import { getAnioActivo, getUltimaMatricula } from "@/lib/db";
import { LOGIN_PATH, ROLE_HOME, necesitaPerfil } from "@/lib/routes";
import { COURSE_LABEL, COURSES } from "@/lib/types";

export const metadata: Metadata = { title: "Matrícula" };

/**
 * Matrícula del alumno: dice su nombre y elige curso. Pasan por aquí los que
 * entran por primera vez con la cuenta del colegio y, al empezar cada año
 * escolar, todos: así cada uno se matricula en su nuevo nivel.
 */
export default async function BienvenidaPage() {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);
  // Quien ya tiene curso —y todo profesor o superadministrador— va a su panel.
  if (!necesitaPerfil(session)) redirect(ROLE_HOME[session.role]);

  const [anio, ultima] = await Promise.all([getAnioActivo(), getUltimaMatricula(session.id)]);
  const vuelve = ultima !== null;

  // A quien vuelve se le propone el curso siguiente al que hizo.
  const siguiente = ultima ? COURSES[COURSES.indexOf(ultima.course) + 1] : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6">
        <div className="rounded-card bg-white p-6 shadow-card sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-widest text-spike-700">
            {vuelve ? `Curso ${anio}` : "Primera vez por aquí"}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">
            {vuelve ? "¡Curso nuevo!" : "¡Bienvenido a ROBOTICA ALLINONE!"}
          </h1>
          <p className="mt-2 font-semibold text-ink-600">
            {vuelve ? (
              <>
                Empieza el curso {anio}. El año pasado estabas en{" "}
                {COURSE_LABEL[ultima.course]}: dinos a qué curso vas ahora y empiezas tus unidades
                nuevas. Lo que hiciste el curso anterior lo guarda tu profesor.
              </>
            ) : (
              <>
                Has entrado con <span className="font-mono text-ink-900">{session.email}</span>.
                Solo falta saber quién eres y a qué curso vas.
              </>
            )}
          </p>
          <PerfilForm nombreSugerido={session.name} cursoSugerido={siguiente} />
        </div>
      </main>
    </div>
  );
}
