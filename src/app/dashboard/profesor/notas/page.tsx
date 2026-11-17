import type { Metadata } from "next";
import Link from "next/link";
import { CourseTabs } from "@/components/profesor/CourseTabs";
import { requireRole } from "@/lib/auth";
import { getTestScores } from "@/lib/db";
import { firstParam, formatNota, parseCourse } from "@/lib/format";
import { COURSE_LABEL, TEST_QUESTIONS, UNIT_NUMBERS } from "@/lib/types";

export const metadata: Metadata = { title: "Notas de los tests" };

function notaClass(nota: number | null): string {
  if (nota === null) return "text-ink-400";
  return nota >= 5 ? "bg-spike-50 text-spike-800" : "bg-red-50 text-red-700";
}

export default async function ProfesorNotasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["profesor", "superadmin"]);

  const curso = parseCourse(firstParam((await searchParams).curso));
  const filas = await getTestScores(curso);

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">Notas de los tests</h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        Cada PRUEBA tiene un test de {TEST_QUESTIONS} preguntas que se corrige solo cuando el alumno
        pulsa «Entregar». La nota es sobre 10.
      </p>

      <div className="mt-6">
        <CourseTabs basePath="/dashboard/profesor/notas" active={curso} />
      </div>

      {filas.length === 0 ? (
        <p className="mt-8 rounded-card bg-white p-6 font-semibold text-ink-500 shadow-card">
          Todavía no se ha registrado nadie de {COURSE_LABEL[curso]}.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-card bg-white shadow-card">
          <table className="w-full min-w-[52rem] text-left">
            <caption className="sr-only">
              Notas de los tests de {COURSE_LABEL[curso]}, una columna por unidad
            </caption>
            <thead>
              <tr className="border-b-2 border-ink-100 text-xs font-extrabold uppercase tracking-wide text-ink-500">
                <th scope="col" className="px-6 py-4">
                  Alumno
                </th>
                {UNIT_NUMBERS.map((unidad) => (
                  <th key={unidad} scope="col" className="px-2 py-4 text-center">
                    UD {unidad}
                  </th>
                ))}
                <th scope="col" className="px-6 py-4 text-center">
                  Media
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ alumno, notas, media }) => (
                <tr key={alumno.id} className="border-b border-ink-100 last:border-b-0">
                  <th scope="row" className="px-6 py-3 font-bold text-ink-900">
                    {alumno.name}
                  </th>
                  {notas.map((nota, index) => {
                    const unidad = UNIT_NUMBERS[index];
                    const chip = `inline-block min-w-12 rounded-xl px-2 py-1.5 text-sm font-extrabold tabular-nums ${notaClass(nota)}`;
                    return (
                      <td key={unidad} className="px-2 py-3 text-center">
                        {nota === null ? (
                          <span className={chip}>{formatNota(nota)}</span>
                        ) : (
                          <Link
                            href={`/dashboard/profesor/notas/${alumno.id}/${unidad}`}
                            className={`${chip} transition hover:ring-2 hover:ring-spike-400 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-spike-400`}
                            title={`Ver la corrección de ${alumno.name} en la UD ${unidad}`}
                          >
                            {formatNota(nota)}
                          </Link>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-3 text-center font-display text-xl font-semibold tabular-nums text-ink-900">
                    {formatNota(media)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-sm font-semibold text-ink-500">
        «—» significa que el alumno todavía no ha entregado ese test. Pulsa en una nota para ver
        su corrección pregunta a pregunta.
      </p>
    </>
  );
}
