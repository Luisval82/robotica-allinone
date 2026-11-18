import type { Metadata } from "next";
import Link from "next/link";
import { AvisoAlcance } from "@/components/profesor/AvisoAlcance";
import { COURSE_TONE } from "@/components/profesor/courseTone";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { requireRole } from "@/lib/auth";
import { getCursosVisibles, listStudentsWithSummary } from "@/lib/db";
import { formatNota, saludo } from "@/lib/format";
import { COURSE_LABEL, UNIT_NUMBERS } from "@/lib/types";

export const metadata: Metadata = { title: "Alumnado" };

export default async function ProfesorAlumnadoPage() {
  // El superadministrador también es docente y puede entrar aquí.
  const session = await requireRole(["profesor", "superadmin"]);

  // Un profesor ve solo los cursos que imparte; el superadministrador, todos.
  const visibles = await getCursosVisibles(session);
  const grupos = await Promise.all(
    visibles.cursos.map(async (course) => ({
      course,
      filas: await listStudentsWithSummary(course),
    })),
  );

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">Alumnado</h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        {saludo(session)}. Así va cada curso. El progreso cuenta la teoría, el test y
        las dos entregas de cada una de las {UNIT_NUMBERS.length} unidades.
      </p>

      <AvisoAlcance alcance={visibles.alcance} cursos={visibles.cursos} />

      {grupos.map(({ course, filas }) => (
        <section
          key={course}
          aria-labelledby={`curso-${course}`}
          className="mt-8 overflow-hidden rounded-card bg-white shadow-card"
        >
          <div
            className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 ${COURSE_TONE[course]}`}
          >
            <h2 id={`curso-${course}`} className="font-display text-2xl font-semibold">
              {COURSE_LABEL[course]}
              <span className="ml-3 text-base font-semibold opacity-90">
                {filas.length} {filas.length === 1 ? "alumno" : "alumnos"}
              </span>
            </h2>
            <Link
              href={`/dashboard/profesor/unidades?curso=${course}`}
              className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-ink-900 transition-colors hover:bg-ink-100"
            >
              Unidades y pruebas
            </Link>
          </div>

          {filas.length === 0 ? (
            <p className="p-6 font-semibold text-ink-500">
              Todavía no se ha registrado nadie de este curso.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[46rem] text-left">
                <caption className="sr-only">Alumnado de {COURSE_LABEL[course]}</caption>
                <thead>
                  <tr className="border-b-2 border-ink-100 text-xs font-extrabold uppercase tracking-wide text-ink-500">
                    <th scope="col" className="px-6 py-3.5">
                      Alumno
                    </th>
                    <th scope="col" className="w-56 px-4 py-3.5">
                      Progreso general
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Unidades abiertas
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Media de tests
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Por corregir
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map(({ alumno, resumen }) => (
                    <tr key={alumno.id} className="border-b border-ink-100 last:border-b-0">
                      <th scope="row" className="px-6 py-3.5">
                        <Link
                          href={`/dashboard/profesor/unidades?curso=${course}&alumno=${alumno.id}#por-alumno`}
                          className="font-bold text-ink-900 underline decoration-ink-300 decoration-2 underline-offset-4 hover:decoration-spike-500"
                        >
                          {alumno.name}
                        </Link>
                        <span className="block font-mono text-xs font-normal text-ink-500">
                          {alumno.email}
                        </span>
                      </th>
                      <td className="px-4 py-3.5">
                        <ProgressBar
                          value={resumen.porcentaje}
                          label={`Progreso de ${alumno.name}`}
                        />
                      </td>
                      <td className="px-4 py-3.5 font-bold tabular-nums text-ink-800">
                        {resumen.unidadesAbiertas} de {UNIT_NUMBERS.length}
                      </td>
                      <td className="px-4 py-3.5 font-bold tabular-nums text-ink-800">
                        {formatNota(resumen.mediaTests)}
                        {resumen.testsHechos > 0 ? (
                          <span className="ml-1.5 text-xs font-semibold text-ink-500">
                            ({resumen.testsHechos} {resumen.testsHechos === 1 ? "test" : "tests"})
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5">
                        {resumen.entregasPorCorregir > 0 ? (
                          <Link
                            href={`/dashboard/profesor/notas?curso=${course}`}
                            className="inline-flex rounded-full bg-hub-400 px-3 py-1 text-xs font-extrabold text-ink-900 hover:bg-hub-300"
                          >
                            {resumen.entregasPorCorregir}{" "}
                            {resumen.entregasPorCorregir === 1 ? "entrega" : "entregas"}
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-ink-500">Nada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </>
  );
}
