import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgramBlocks } from "@/components/brand/ProgramBlocks";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { Enunciado } from "@/components/unidad/Enunciado";
import { RevisionTest } from "@/components/unidad/RevisionTest";
import { requireRole } from "@/lib/auth";
import { getPractica, getTestForStudent, getTestReview } from "@/lib/contenido";
import { getEntrega, getUnitProgress } from "@/lib/db";
import { formatFecha, formatNota } from "@/lib/format";
import { COURSE_LABEL, UNIT_NUMBERS } from "@/lib/types";
import { getUnidad } from "@/lib/unidades";

export const metadata: Metadata = { title: "Mi corrección" };

/**
 * La corrección de una PRUEBA, tal y como la ve su autor: solo lectura.
 *
 * Es la misma información que tiene el profesor en su pantalla de corregir,
 * con dos diferencias que importan:
 *
 *  - No hay formulario. Ni puntos, ni comentario, ni reabrir: una prueba
 *    entregada está cerrada y de aquí no se puede cambiar nada.
 *  - La solución oficial de cada programación solo se enseña cuando el
 *    profesor YA le ha puesto nota a ESA programación. Antes de eso, enseñarla
 *    sería repartir el examen: las 2 programaciones de la PRUEBA son las que
 *    llevan nota, y todos los alumnos de un curso tienen las mismas.
 */
export default async function MiCorreccionPage({
  params,
}: {
  params: Promise<{ unidad: string }>;
}) {
  const session = await requireRole(["alumno"]);
  if (!session.course) notFound();
  const curso = session.course;

  const { unidad: unidadTexto } = await params;
  const unidad = Number(unidadTexto);
  if (!UNIT_NUMBERS.some((n) => n === unidad)) notFound();

  // Siempre con el id de la sesión: no hay forma de pedir la prueba de otro.
  const [progreso, entrega1, entrega2] = await Promise.all([
    getUnitProgress(session.id, unidad),
    getEntrega(session.id, unidad, 1),
    getEntrega(session.id, unidad, 2),
  ]);

  const preguntas = getTestForStudent(curso, unidad);
  const titulo = getUnidad(curso, unidad)?.titulo ?? `Unidad ${unidad}`;

  const entregas = [entrega1, entrega2];
  const puntos = entregas.map((e) => e?.puntos ?? null);
  const corregidas = puntos.filter((p): p is number => p !== null);
  const completa = progreso.testAciertos !== null && corregidas.length === 2;
  const total = (progreso.testAciertos ?? 0) + corregidas.reduce((t, p) => t + p, 0);
  const sinEmpezar = progreso.testAciertos === null && entregas.every((e) => e === null);

  return (
    <div className="grid gap-6">
      <Link
        href="/dashboard/alumno/calificaciones"
        className="inline-flex items-center gap-2 font-bold text-ink-600 transition hover:text-ink-900"
      >
        <ArrowLeftIcon className="size-4" />
        Calificaciones
      </Link>

      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
          {COURSE_LABEL[curso]} · UD {unidad} · {titulo}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">
          PRUEBA de la unidad {unidad}
        </h1>
      </div>

      {sinEmpezar ? (
        <section className="rounded-card bg-white p-6 shadow-card">
          <p className="font-semibold text-ink-700">
            Todavía no has hecho esta prueba, así que aquí no hay nada que corregir.
          </p>
          <Link
            href={`/dashboard/alumno/unidad/${unidad}`}
            className="mt-3 inline-flex font-extrabold text-spike-700 underline decoration-2 underline-offset-4 hover:text-spike-900"
          >
            Ir a la unidad {unidad}
          </Link>
        </section>
      ) : (
        <>
          {/* ── La nota, desglosada ── */}
          <section className="rounded-card bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
              <p className="font-display text-6xl font-semibold leading-none tabular-nums text-ink-900">
                {/* Sin las dos programaciones puntuadas no hay nota: una suma a
                    medias presentada como nota es engañarle. */}
                {completa ? formatNota(Math.round(total * 100) / 100) : "—"}
                <span className="font-sans text-xl font-bold text-ink-500"> / 10</span>
              </p>
              <dl className="grid flex-1 gap-1 text-sm font-semibold text-ink-600 sm:grid-cols-3">
                <div className="flex justify-between gap-2 sm:block">
                  <dt>Test ({preguntas.length} preguntas)</dt>
                  <dd className="font-display text-lg font-semibold text-ink-900">
                    {progreso.testAciertos === null
                      ? "sin entregar"
                      : `${progreso.testAciertos} pt`}
                  </dd>
                </div>
                {puntos.map((valor, i) => (
                  <div key={i} className="flex justify-between gap-2 sm:block">
                    <dt>Programación {i + 1}</dt>
                    <dd className="font-display text-lg font-semibold text-ink-900">
                      {valor !== null
                        ? `${formatNota(valor)} pt`
                        : entregas[i]
                          ? "por corregir"
                          : "sin entregar"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            {!completa ? (
              <p className="mt-4 rounded-2xl bg-hub-50 p-3 text-sm font-bold text-ink-800">
                Aquí no hay nota final todavía: falta alguna parte por entregar o por corregir. Lo
                que ya está puntuado lo tienes arriba.
              </p>
            ) : null}
          </section>

          {/* ── El test, pregunta a pregunta ── */}
          <section className="grid gap-3">
            <h2 className="font-display text-2xl font-semibold text-ink-900">
              Test ·{" "}
              {progreso.testAciertos === null
                ? "sin entregar"
                : `${progreso.testAciertos} de ${preguntas.length}`}
            </h2>
            {progreso.testAciertos === null ? (
              <p className="rounded-card bg-white p-6 font-semibold text-ink-600 shadow-card">
                Todavía no has entregado el test de esta unidad.
              </p>
            ) : (
              <RevisionTest
                preguntas={preguntas}
                detalle={
                  progreso.testRespuestas
                    ? getTestReview(curso, unidad, progreso.testRespuestas)
                    : null
                }
              />
            )}
          </section>

          {/* ── Las 2 programaciones evaluables ── */}
          <section className="grid gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink-900">
                Programaciones de la prueba
              </h2>
              <p className="font-semibold text-ink-500">
                Cada una vale 1 punto y las corrige tu profesor. Una vez entregadas no se pueden
                cambiar.
              </p>
            </div>

            {([1, 2] as const).map((numero) => {
              const entrega = entregas[numero - 1];
              const practica = getPractica(curso, unidad, numero);
              // La solución oficial, solo con esta programación ya puntuada.
              const puedeVerSolucion = entrega !== null && entrega.puntos !== null;

              return (
                <article
                  key={numero}
                  id={`programacion-${numero}`}
                  className="overflow-hidden rounded-card bg-white shadow-card"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink-100 px-6 py-4">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
                        Programación {numero} de 2
                      </p>
                      <h3 className="font-display text-xl font-semibold text-ink-900">
                        {practica?.titulo ?? `Práctica ${numero}`}
                      </h3>
                    </div>
                    {entrega && entrega.puntos !== null ? (
                      <span className="rounded-full bg-spike-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
                        {formatNota(entrega.puntos)} de 1
                      </span>
                    ) : entrega ? (
                      <span className="rounded-full bg-hub-400 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink-900">
                        Por corregir
                      </span>
                    ) : (
                      <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink-500">
                        Sin entregar
                      </span>
                    )}
                  </div>

                  <div className="grid gap-5 p-6">
                    {practica ? (
                      <Enunciado texto={practica.enunciado} pasos={practica.pasos} />
                    ) : null}

                    {entrega ? (
                      <>
                        <div>
                          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                            <h4 className="text-sm font-extrabold uppercase tracking-wide text-ink-500">
                              Lo que entregaste
                            </h4>
                            <p className="text-sm font-semibold text-ink-500">
                              Entregado el {formatFecha(entrega.entregadaEn)}
                            </p>
                          </div>
                          <div className="overflow-x-auto rounded-2xl bg-ink-50 p-4">
                            <ProgramBlocks
                              rows={entrega.bloques}
                              label={`Tu programa de la programación ${numero}`}
                            />
                          </div>
                          {entrega.explicacion ? (
                            <p className="mt-3 rounded-2xl border-2 border-ink-100 p-4 text-sm font-semibold text-ink-700">
                              <span className="font-extrabold text-ink-900">Lo explicaste así: </span>
                              {entrega.explicacion}
                            </p>
                          ) : null}
                        </div>

                        {entrega.comentario.trim() !== "" ? (
                          <blockquote className="rounded-2xl border-l-4 border-spike-400 bg-spike-50 p-4">
                            <p className="text-xs font-extrabold uppercase tracking-wide text-spike-800">
                              Lo que dice tu profesor
                            </p>
                            <p className="mt-1 text-sm font-semibold text-ink-800">
                              {entrega.comentario}
                            </p>
                          </blockquote>
                        ) : null}

                        {puedeVerSolucion && practica ? (
                          <div>
                            <h4 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-500">
                              Solución oficial
                            </h4>
                            <div className="overflow-x-auto rounded-2xl bg-spike-50 p-4">
                              <ProgramBlocks
                                rows={practica.solucion}
                                label={`Solución oficial de la programación ${numero}`}
                              />
                            </div>
                            {practica.notas ? (
                              <p className="mt-2 text-sm font-semibold text-ink-600">
                                {practica.notas}
                              </p>
                            ) : null}
                            <p className="mt-2 text-sm font-semibold text-ink-500">
                              Si tu programa es distinto y funcionaba, no está mal: hay más de una
                              forma de resolverlo. La nota la pone tu profesor, no el parecido.
                            </p>
                          </div>
                        ) : (
                          <p className="rounded-2xl bg-ink-50 p-4 text-sm font-semibold text-ink-600">
                            La solución oficial de esta programación aparecerá aquí en cuanto tu
                            profesor la corrija.
                          </p>
                        )}

                        {entrega.corregidaEn ? (
                          <p className="text-sm font-semibold text-ink-500">
                            Corregida el {formatFecha(entrega.corregidaEn)}
                            {entrega.corregidaPor ? ` por ${entrega.corregidaPor}` : ""}.
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="font-semibold text-ink-500">
                        No entregaste esta programación.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
