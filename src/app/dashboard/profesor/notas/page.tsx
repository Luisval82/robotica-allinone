import type { Metadata } from "next";
import Link from "next/link";
import { AvisoAlcance } from "@/components/profesor/AvisoAlcance";
import { CourseTabs } from "@/components/profesor/CourseTabs";
import { requireRole } from "@/lib/auth";
import { cursoDeLaUrl, getCursosVisibles, getNotasPruebas, type NotaPrueba } from "@/lib/db";
import { firstParam, formatNota } from "@/lib/format";
import { COURSE_LABEL, TEST_QUESTIONS, UNIT_NUMBERS } from "@/lib/types";

export const metadata: Metadata = { title: "Nota pruebas" };

/** El color de la casilla. Una prueba a medias no se pinta de aprobada ni de suspensa. */
function tonoDe(prueba: NotaPrueba): string {
  if (prueba.final === null) return "text-ink-400";
  if (!prueba.completa) return "bg-ink-100 text-ink-600";
  return prueba.final >= 5 ? "bg-spike-50 text-spike-800" : "bg-red-50 text-red-700";
}

/**
 * Qué le falta a esta prueba. Distingue lo que el alumno no ha entregado de
 * lo que el profesor no ha corregido: una cosa es deuda suya y la otra, tuya.
 */
function queFalta(prueba: NotaPrueba): string {
  const corregidas = prueba.practicas.filter((p) => p !== null).length;
  const sinEntregar = 2 - prueba.entregadas;
  const sinCorregir = prueba.entregadas - corregidas;

  const falta: string[] = [];
  if (prueba.aciertos === null) falta.push("el test");
  if (sinEntregar > 0) {
    falta.push(sinEntregar === 1 ? "una programación sin entregar" : "las 2 programaciones");
  }
  if (sinCorregir > 0) {
    falta.push(
      sinCorregir === 1 ? "una programación por corregir" : "2 programaciones por corregir",
    );
  }
  return falta.join(" y ");
}

/** Programaciones entregadas que el profesor todavía no ha corregido. */
function pendientesDe(prueba: NotaPrueba): number {
  return prueba.entregadas - prueba.practicas.filter((p) => p !== null).length;
}

export default async function ProfesorNotasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireRole(["profesor", "superadmin"]);

  const visibles = await getCursosVisibles(session);
  const curso = cursoDeLaUrl(visibles, firstParam((await searchParams).curso));
  const filas = await getNotasPruebas(curso);

  // Lo que te toca a ti: entregado por el alumno y sin corregir.
  const porCorregir = filas.reduce(
    (total, fila) => total + fila.pruebas.reduce((n, prueba) => n + pendientesDe(prueba), 0),
    0,
  );

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">Nota pruebas</h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        Cada PRUEBA vale <b className="text-ink-700">10 puntos de 1</b>: las {TEST_QUESTIONS}{" "}
        preguntas del test, que se corrigen solas al entregar, y las 2 programaciones, que corriges
        tú. La nota que ves es la suma. Pulsa una casilla para corregir.
      </p>

      <AvisoAlcance alcance={visibles.alcance} cursos={visibles.cursos} />

      <div className="mt-6">
        <CourseTabs basePath="/dashboard/profesor/notas" active={curso} cursos={visibles.cursos} />
      </div>

      {filas.length === 0 ? (
        <p className="mt-8 rounded-card bg-white p-6 font-semibold text-ink-500 shadow-card">
          Todavía no se ha registrado nadie de {COURSE_LABEL[curso]}.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-card bg-white shadow-card">
          <table className="w-full min-w-[52rem] text-left">
            <caption className="sr-only">
              Nota de las pruebas de {COURSE_LABEL[curso]}, una columna por unidad
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
              {filas.map(({ alumno, pruebas, media }) => (
                <tr key={alumno.id} className="border-b border-ink-100 last:border-b-0">
                  <th scope="row" className="px-6 py-3 font-bold text-ink-900">
                    {alumno.name}
                  </th>
                  {pruebas.map((prueba) => {
                    const falta = queFalta(prueba);
                    const chip = `relative inline-block min-w-12 rounded-xl px-2 py-1.5 text-sm font-extrabold tabular-nums ${tonoDe(prueba)}`;
                    return (
                      <td key={prueba.unidad} className="px-2 py-3 text-center">
                        <Link
                          href={`/dashboard/profesor/notas/${alumno.id}/${prueba.unidad}`}
                          className={`${chip} transition hover:ring-2 hover:ring-spike-400 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-spike-400`}
                          title={
                            prueba.final === null
                              ? `${alumno.name} no ha hecho todavía la prueba de la UD ${prueba.unidad}`
                              : prueba.completa
                                ? `Prueba completa: ${formatNota(prueba.final)} de 10`
                                : `Lleva ${formatNota(prueba.final)} de 10, pero falta ${falta}`
                          }
                        >
                          {formatNota(prueba.final)}
                          {/* El punto avisa de que esa nota todavía puede subir. */}
                          {prueba.final !== null && !prueba.completa ? (
                            <span
                              aria-hidden="true"
                              className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-hub-500"
                            />
                          ) : null}
                          {prueba.final !== null && !prueba.completa ? (
                            <span className="sr-only"> (provisional, falta {falta})</span>
                          ) : null}
                        </Link>
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

      <div className="mt-4 grid gap-1 text-sm font-semibold text-ink-500">
        <p>
          <span className="mr-1 inline-block size-2 rounded-full bg-hub-500 align-middle" />
          La nota todavía puede subir: falta el test o alguna programación por corregir. Esas
          pruebas no entran en la media.
        </p>
        <p>«—» es que el alumno no ha hecho nada todavía de esa prueba.</p>
        {porCorregir > 0 ? (
          <p className="font-bold text-ink-700">
            Tienes {porCorregir}{" "}
            {porCorregir === 1 ? "programación entregada" : "programaciones entregadas"} sin
            corregir.
          </p>
        ) : null}
      </div>
    </>
  );
}
