import type { Metadata } from "next";
import Link from "next/link";
import { AvisoAlcance } from "@/components/profesor/AvisoAlcance";
import { CourseTabs } from "@/components/profesor/CourseTabs";
import { requireRole } from "@/lib/auth";
import { cursoDeLaUrl, getCursosVisibles, getSeguimientoPracticas } from "@/lib/db";
import { firstParam } from "@/lib/format";
import { COURSE_LABEL, UNIT_NUMBERS } from "@/lib/types";

export const metadata: Metadata = { title: "Prácticas de programación" };

/** Las 4 de cada unidad, pintadas como 4 cuadraditos. */
function Marcas({ guardadas, comprobadas }: { guardadas: number; comprobadas: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`size-2.5 rounded-sm ${
            i < comprobadas ? "bg-spike-600" : i < guardadas ? "bg-hub-400" : "bg-ink-200"
          }`}
        />
      ))}
    </span>
  );
}

export default async function ProfesorPracticasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireRole(["profesor", "superadmin"]);

  const visibles = await getCursosVisibles(session);
  const curso = cursoDeLaUrl(visibles, firstParam((await searchParams).curso));
  const filas = await getSeguimientoPracticas(curso);

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">
        Prácticas de programación
      </h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        Las 4 programaciones de cada unidad, alumno a alumno.{" "}
        <b className="text-ink-700">Aquí no hay notas</b>: estas prácticas son con las que el
        alumno aprende, no el examen. Lo que se sigue es si las ha montado y si las ha dado por
        terminadas con «Guardar y comprobar». La nota está en Nota pruebas.
      </p>

      <AvisoAlcance alcance={visibles.alcance} cursos={visibles.cursos} />

      <div className="mt-6">
        <CourseTabs
          basePath="/dashboard/profesor/practicas"
          active={curso}
          cursos={visibles.cursos}
        />
      </div>

      {filas.length === 0 ? (
        <p className="mt-8 rounded-card bg-white p-6 font-semibold text-ink-500 shadow-card">
          Todavía no se ha registrado nadie de {COURSE_LABEL[curso]}.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-card bg-white shadow-card">
          <table className="w-full min-w-[56rem] text-left">
            <caption className="sr-only">
              Prácticas de programación de {COURSE_LABEL[curso]}, una columna por unidad
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
                  Terminadas
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ alumno, unidades, comprobadasTotal }) => (
                <tr key={alumno.id} className="border-b border-ink-100 last:border-b-0">
                  <th scope="row" className="px-6 py-3 font-bold text-ink-900">
                    {alumno.name}
                  </th>
                  {unidades.map(({ unidad, guardadas, comprobadas }) => (
                    <td key={unidad} className="px-2 py-3 text-center">
                      <Link
                        href={`/dashboard/profesor/practicas/${alumno.id}/${unidad}`}
                        title={`${alumno.name}, UD ${unidad}: ${comprobadas} terminadas y ${
                          guardadas - comprobadas
                        } a medias, de 4`}
                        className="inline-flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition hover:bg-ink-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-spike-400"
                      >
                        <Marcas guardadas={guardadas} comprobadas={comprobadas} />
                        <span className="text-xs font-extrabold tabular-nums text-ink-600">
                          {comprobadas}/4
                        </span>
                      </Link>
                    </td>
                  ))}
                  <td className="px-6 py-3 text-center font-display text-xl font-semibold tabular-nums text-ink-900">
                    {comprobadasTotal}
                    <span className="font-sans text-sm font-bold text-ink-500">
                      {" "}
                      / {UNIT_NUMBERS.length * 4}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 grid gap-1 text-sm font-semibold text-ink-500">
        <p>
          <span className="mr-1 inline-block size-2.5 rounded-sm bg-spike-600 align-middle" />
          Terminada: el alumno pulsó «Guardar y comprobar» y ya ha visto la solución.
        </p>
        <p>
          <span className="mr-1 inline-block size-2.5 rounded-sm bg-hub-400 align-middle" />A
          medias: la tiene guardada como borrador y todavía puede cambiarla.
        </p>
        <p>Pulsa una casilla para ver los programas que ha montado en esa unidad.</p>
      </div>
    </>
  );
}
