import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSE_TONE } from "@/components/profesor/courseTone";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { requireRole } from "@/lib/auth";
import { esAnioValido, getHistorico, listAnios } from "@/lib/db";
import { formatNota } from "@/lib/format";
import { COURSE_LABEL, UNIT_NUMBERS } from "@/lib/types";

export const metadata: Metadata = { title: "Curso archivado" };

/**
 * Un año escolar archivado, tal y como quedó: en qué curso estaba cada
 * alumno, sus notas de los tests y sus entregas. Solo lectura.
 */
export default async function AnioArchivadoPage({
  params,
}: {
  params: Promise<{ anio: string }>;
}) {
  await requireRole(["superadmin"]);

  const { anio } = await params;
  if (!esAnioValido(anio)) notFound();

  const anios = await listAnios();
  const ficha = anios.find((item) => item.anio === anio);
  if (!ficha) notFound();

  const cursos = await getHistorico(anio);

  return (
    <>
      <Link
        href="/dashboard/admin/anio"
        className="inline-flex items-center gap-2 font-bold text-ink-600 transition hover:text-ink-900"
      >
        <ArrowLeftIcon className="size-4" />
        Gestión de año escolar
      </Link>

      <p className="mt-4 text-xs font-extrabold uppercase tracking-widest text-ink-500">
        {ficha.activo ? "Año en marcha" : "Curso archivado"}
      </p>
      <h1 className="mt-1 font-display text-4xl font-semibold text-ink-900">{anio}</h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        Así quedó el curso. El curso de cada alumno es el que tenía ese año, no el de ahora. No se
        puede modificar nada desde aquí.
      </p>

      {cursos.length === 0 ? (
        <p className="mt-8 rounded-card bg-white p-6 font-semibold text-ink-500 shadow-card">
          No hay nada guardado de este año.
        </p>
      ) : (
        cursos.map(({ course, filas }) => (
          <section
            key={course}
            aria-labelledby={`archivo-${course}`}
            className="mt-8 overflow-hidden rounded-card bg-white shadow-card"
          >
            <div className={`px-6 py-4 ${COURSE_TONE[course]}`}>
              <h2 id={`archivo-${course}`} className="font-display text-2xl font-semibold">
                {COURSE_LABEL[course]}
                <span className="ml-3 text-base font-semibold opacity-90">
                  {filas.length} {filas.length === 1 ? "alumno" : "alumnos"}
                </span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] text-left">
                <caption className="sr-only">
                  Notas de {COURSE_LABEL[course]} en el curso {anio}
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
                    <th scope="col" className="px-4 py-4 text-center">
                      Media tests
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      Entregas
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      Media programaciones
                      <span className="block font-sans text-[0.65rem] normal-case text-ink-400">
                        sobre 1 punto
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map(({ alumno, notasTest, mediaTest, entregas, entregasCorregidas, mediaEntregas }) => (
                    <tr key={alumno.id} className="border-b border-ink-100 last:border-b-0">
                      <th scope="row" className="px-6 py-3 font-bold text-ink-900">
                        {alumno.name}
                        <span className="block font-mono text-xs font-normal text-ink-500">
                          {alumno.email}
                        </span>
                      </th>
                      {notasTest.map((nota, index) => (
                        <td
                          key={UNIT_NUMBERS[index]}
                          className="px-2 py-3 text-center font-bold tabular-nums text-ink-800"
                        >
                          {formatNota(nota)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center font-display text-xl font-semibold tabular-nums text-ink-900">
                        {formatNota(mediaTest)}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold tabular-nums text-ink-700">
                        {entregasCorregidas} de {entregas}
                      </td>
                      <td className="px-4 py-3 text-center font-display text-xl font-semibold tabular-nums text-ink-900">
                        {formatNota(mediaEntregas)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </>
  );
}
