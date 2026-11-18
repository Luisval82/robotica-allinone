import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, LockIcon, LockOpenIcon } from "@/components/ui/icons";
import { requireRole } from "@/lib/auth";
import { getProgress, getStudentAccess, testScore } from "@/lib/db";
import { formatNota, saludo } from "@/lib/format";
import { COURSE_LABEL, THEORY_STEPS } from "@/lib/types";
import { getUnidadesDeCurso } from "@/lib/unidades";
import { unitTone } from "@/lib/unitTone";

export const metadata: Metadata = { title: "Mis unidades" };

export default async function AlumnoDashboardPage() {
  const session = await requireRole(["alumno"]);

  if (!session.course) {
    return (
      <p className="rounded-card bg-white p-8 font-semibold text-ink-700 shadow-card">
        Tu cuenta no tiene curso asignado. Pide a tu profesor que lo revise.
      </p>
    );
  }

  const unidades = getUnidadesDeCurso(session.course);
  // Lo que el profesor ha abierto para toda la clase o solo para este alumno.
  const [acceso, progreso] = await Promise.all([
    getStudentAccess({ id: session.id, course: session.course }),
    getProgress(session.id),
  ]);
  const abiertas = acceso.filter((item) => item.abierta).length;

  return (
    <>
      <section className="rounded-card bg-spike-600 p-7 text-white sm:p-10">
        <p className="text-sm font-extrabold uppercase tracking-widest text-spike-100">
          {COURSE_LABEL[session.course]} · Robótica SPIKE Prime
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
          {saludo(session)}
        </h1>
        <p className="mt-3 max-w-xl text-lg font-semibold text-spike-100">
          {abiertas === 1
            ? `Tienes 1 unidad abierta de ${unidades.length}.`
            : `Tienes ${abiertas} unidades abiertas de ${unidades.length}.`}{" "}
          Tu profesor irá abriendo las demás.
        </p>
        <Link
          href="/dashboard/alumno/taller"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-extrabold text-spike-700 transition hover:bg-spike-50"
        >
          Taller de bloques
          <ArrowRightIcon className="size-4" />
        </Link>
      </section>

      <h2 className="mt-10 font-display text-2xl font-semibold text-ink-900">Tus unidades</h2>

      <ol className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {unidades.map((unidad) => {
          const estado = acceso.find((item) => item.unidad === unidad.numero);
          const avance = progreso.find((item) => item.unidad === unidad.numero);
          const abierta = estado?.abierta ?? false;
          const pruebaAbierta = estado?.pruebaAbierta ?? false;
          const pasos = Math.min(avance?.pasosTeoria ?? 0, THEORY_STEPS);
          const nota =
            avance && avance.testAciertos !== null ? testScore(avance.testAciertos) : null;

          const card = (
            <>
              <div
                className={`flex items-center justify-between px-6 py-4 ${
                  abierta ? unitTone(unidad.numero) : "bg-ink-200 text-ink-600"
                }`}
              >
                <span className="font-display text-2xl font-semibold">UD {unidad.numero}</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${
                    abierta ? "bg-white text-ink-900" : "bg-ink-700 text-white"
                  }`}
                >
                  {abierta ? <LockOpenIcon className="size-3.5" /> : <LockIcon className="size-3.5" />}
                  {abierta ? "Abierta" : "Bloqueada"}
                </span>
              </div>
              <div className={`flex flex-1 flex-col gap-2 p-6 ${abierta ? "" : "text-ink-500"}`}>
                <h3
                  className={`font-display text-xl font-semibold leading-snug ${
                    abierta ? "text-ink-900" : "text-ink-600"
                  }`}
                >
                  {unidad.titulo}
                </h3>
                <p className="text-sm font-semibold">{unidad.modelo}</p>

                {abierta ? (
                  <div className="mt-auto grid gap-2 pt-4">
                    <div
                      role="img"
                      aria-label={`${pasos} de ${THEORY_STEPS} pasos terminados`}
                      className="flex gap-1.5"
                    >
                      {Array.from({ length: THEORY_STEPS }, (_, index) => (
                        <span
                          key={index}
                          className={`h-2 flex-1 rounded-full ${
                            index < pasos ? "bg-spike-500" : "bg-ink-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-extrabold uppercase tracking-wide">
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          pruebaAbierta ? "text-spike-700" : "text-ink-500"
                        }`}
                      >
                        {pruebaAbierta ? (
                          <LockOpenIcon className="size-3.5" />
                        ) : (
                          <LockIcon className="size-3.5" />
                        )}
                        {nota !== null
                          ? `Test: ${formatNota(nota)}`
                          : `PRUEBA UD-${unidad.numero} ${pruebaAbierta ? "abierta" : "bloqueada"}`}
                      </span>
                      <span className="inline-flex items-center gap-1 text-ink-900">
                        Entrar
                        <ArrowRightIcon className="size-3.5" />
                      </span>
                    </p>
                  </div>
                ) : null}
              </div>
            </>
          );

          return (
            <li key={unidad.numero} className="flex">
              {abierta ? (
                <Link
                  href={`/dashboard/alumno/unidad/${unidad.numero}`}
                  className="flex w-full flex-col overflow-hidden rounded-card bg-white shadow-card transition-transform hover:-translate-y-1"
                >
                  {card}
                </Link>
              ) : (
                <div className="flex w-full flex-col overflow-hidden rounded-card bg-white shadow-card">
                  {card}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
