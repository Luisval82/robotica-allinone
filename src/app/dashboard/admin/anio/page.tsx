import type { Metadata } from "next";
import Link from "next/link";
import { CierreDeAnio } from "@/components/admin/CierreDeAnio";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { requireRole } from "@/lib/auth";
import { anioSiguiente, getAnioActivo, getResumenDeAnios, listAnios, listStudents } from "@/lib/db";
import { formatFecha } from "@/lib/format";

export const metadata: Metadata = { title: "Gestión de año escolar" };

/**
 * Gestión de año escolar: qué año está activo, cómo se cierra para abrir el
 * siguiente y qué años hay archivados.
 */
export default async function AnioEscolarPage() {
  await requireRole(["superadmin"]);

  const [activo, anios, resumen, alumnos] = await Promise.all([
    getAnioActivo(),
    listAnios(),
    getResumenDeAnios(),
    listStudents(),
  ]);
  const archivados = anios.filter((anio) => !anio.activo);
  const conCurso = alumnos.filter((alumno) => alumno.course !== null).length;

  return (
    <>
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 font-bold text-ink-600 transition hover:text-ink-900"
      >
        <ArrowLeftIcon className="size-4" />
        Gestión de usuarios
      </Link>

      <h1 className="mt-4 font-display text-4xl font-semibold text-ink-900">
        Gestión de año escolar
      </h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        Cada entrega, cada test y cada interruptor de unidad lleva guardado el año escolar en el
        que se hizo. Al cerrar un año no se borra nada: se abre el siguiente y todo empieza de
        cero, mientras el anterior queda archivado y se puede consultar.
      </p>

      <section
        aria-labelledby="ano-activo"
        className="mt-8 rounded-card bg-white p-6 shadow-card sm:p-8"
      >
        <p className="text-xs font-extrabold uppercase tracking-widest text-spike-700">
          Año en marcha
        </p>
        <h2 id="ano-activo" className="mt-1 font-display text-5xl font-semibold text-ink-900">
          {activo}
        </h2>
        <p className="mt-2 font-semibold text-ink-600">
          {conCurso} {conCurso === 1 ? "alumno matriculado" : "alumnos matriculados"} ·{" "}
          {resumen.get(activo)?.entregas ?? 0} entregas · {resumen.get(activo)?.tests ?? 0} tests
          hechos
        </p>

        <div className="mt-6 border-t-2 border-ink-100 pt-6">
          <CierreDeAnio
            anioActivo={activo}
            anioPropuesto={anioSiguiente(activo)}
            alumnos={conCurso}
          />
        </div>
      </section>

      <section aria-labelledby="archivados" className="mt-8">
        <h2 id="archivados" className="font-display text-2xl font-semibold text-ink-900">
          Cursos archivados
        </h2>

        {archivados.length === 0 ? (
          <p className="mt-3 rounded-card bg-white p-6 font-semibold text-ink-500 shadow-card">
            Todavía no hay ningún año cerrado. Aparecerán aquí en cuanto cierres el primero.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {archivados.map((anio) => {
              const datos = resumen.get(anio.anio);
              return (
                <li key={anio.anio}>
                  <Link
                    href={`/dashboard/admin/anio/${anio.anio}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-white p-5 shadow-card transition hover:ring-2 hover:ring-spike-400"
                  >
                    <span>
                      <span className="block font-display text-2xl font-semibold text-ink-900">
                        {anio.anio}
                      </span>
                      <span className="block font-semibold text-ink-500">
                        {datos?.alumnos ?? 0} alumnos · {datos?.entregas ?? 0} entregas ·{" "}
                        {datos?.tests ?? 0} tests
                        {anio.cerradoEn ? ` · cerrado el ${formatFecha(anio.cerradoEn)}` : ""}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-2 font-display font-semibold text-spike-700">
                      Ver el curso
                      <ArrowRightIcon className="size-4" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
