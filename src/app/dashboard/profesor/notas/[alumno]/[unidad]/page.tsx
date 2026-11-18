import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { ProgramBlocks } from "@/components/brand/ProgramBlocks";
import { CorreccionPrograma } from "@/components/profesor/CorreccionPrograma";
import { Enunciado } from "@/components/unidad/Enunciado";
import { RevisionTest } from "@/components/unidad/RevisionTest";
import { requireRole } from "@/lib/auth";
import { getPractica, getTestForStudent, getTestReview } from "@/lib/contenido";
import {
  findUserById,
  getCursosVisibles,
  getEntrega,
  getUnitProgress,
  puedeVerCurso,
} from "@/lib/db";
import { formatFecha, formatNota } from "@/lib/format";
import { COURSE_LABEL, isUuid, UNIT_NUMBERS } from "@/lib/types";
import { getUnidad } from "@/lib/unidades";

export const metadata: Metadata = { title: "Corregir la prueba" };

/**
 * La PRUEBA de un alumno en una unidad, entera y en un sitio: el test
 * pregunta a pregunta y debajo las 2 programaciones, cada una con su
 * programa y su corrección.
 *
 * Son 10 puntos de 1 y la nota final es la suma, así que la cabecera enseña
 * en todo momento cuánto lleva y qué falta. Las 4 prácticas de programación
 * de la unidad NO están aquí: esas no llevan nota y viven en su pestaña.
 */
export default async function CorregirPruebaPage({
  params,
}: {
  params: Promise<{ alumno: string; unidad: string }>;
}) {
  const session = await requireRole(["profesor", "superadmin"]);

  const { alumno: alumnoId, unidad: unidadTexto } = await params;
  const unidad = Number(unidadTexto);
  const valida = UNIT_NUMBERS.some((n) => n === unidad);
  if (!isUuid(alumnoId) || !valida) notFound();

  const alumno = await findUserById(alumnoId);
  if (!alumno || alumno.role !== "alumno" || !alumno.course) notFound();
  const curso = alumno.course;

  // Un profesor solo corrige a los alumnos de los cursos que imparte, aunque
  // llegue aquí escribiendo la dirección a mano.
  const visibles = await getCursosVisibles(session);
  if (!puedeVerCurso(visibles, alumno.course)) notFound();

  const [progreso, entrega1, entrega2] = await Promise.all([
    getUnitProgress(alumnoId, unidad),
    getEntrega(alumnoId, unidad, 1),
    getEntrega(alumnoId, unidad, 2),
  ]);
  const preguntas = getTestForStudent(curso, unidad);
  const titulo = getUnidad(curso, unidad)?.titulo ?? `Unidad ${unidad}`;

  const entregas = [entrega1, entrega2];
  const puntosPracticas = entregas.map((e) => e?.puntos ?? null);
  const corregidas = puntosPracticas.filter((p): p is number => p !== null);
  const hayAlgo = progreso.testAciertos !== null || corregidas.length > 0;
  const total = (progreso.testAciertos ?? 0) + corregidas.reduce((t, p) => t + p, 0);
  const completa = progreso.testAciertos !== null && corregidas.length === 2;

  return (
    <div className="grid gap-6">
      <Link
        href={`/dashboard/profesor/notas?curso=${curso}`}
        className="inline-flex items-center gap-2 font-bold text-ink-600 transition hover:text-ink-900"
      >
        <ArrowLeftIcon className="size-4" />
        Nota pruebas
      </Link>

      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
          {COURSE_LABEL[curso]} · UD {unidad} · {titulo}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">{alumno.name}</h1>
      </div>

      {/* ── La nota, desglosada: test + programación 1 + programación 2 ── */}
      <section className="rounded-card bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <p className="font-display text-6xl font-semibold leading-none text-ink-900 tabular-nums">
            {hayAlgo ? formatNota(Math.round(total * 100) / 100) : "—"}
            <span className="font-sans text-xl font-bold text-ink-500"> / 10</span>
          </p>
          <dl className="grid flex-1 gap-1 text-sm font-semibold text-ink-600 sm:grid-cols-3">
            <div className="flex justify-between gap-2 sm:block">
              <dt>Test ({preguntas.length} preguntas)</dt>
              <dd className="font-display text-lg font-semibold text-ink-900">
                {progreso.testAciertos === null ? "sin entregar" : `${progreso.testAciertos} pt`}
              </dd>
            </div>
            {puntosPracticas.map((puntos, i) => (
              <div key={i} className="flex justify-between gap-2 sm:block">
                <dt>Programación {i + 1}</dt>
                <dd className="font-display text-lg font-semibold text-ink-900">
                  {puntos !== null
                    ? `${formatNota(puntos)} pt`
                    : entregas[i]
                      ? "por corregir"
                      : "sin entregar"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        {!completa ? (
          <p className="mt-4 rounded-2xl bg-ink-50 p-3 text-sm font-bold text-ink-600">
            Nota provisional: todavía falta alguna parte, así que esta prueba no cuenta para la
            media.
          </p>
        ) : null}
      </section>

      {/* ── El test, pregunta a pregunta ── */}
      <section className="grid gap-3">
        <h2 className="font-display text-2xl font-semibold text-ink-900">
          Test · {progreso.testAciertos === null ? "sin entregar" : `${progreso.testAciertos} de ${preguntas.length}`}
        </h2>
        {progreso.testAciertos === null ? (
          <p className="rounded-card bg-white p-6 font-semibold text-ink-600 shadow-card">
            Todavía no ha entregado el test de esta unidad.
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

      {/* ── Las 2 programaciones de la prueba, para corregir a mano ── */}
      <section className="grid gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            Programaciones de la prueba
          </h2>
          <p className="font-semibold text-ink-500">
            Cada una vale 1 punto. Compara con la solución oficial y ponle los puntos.
          </p>
        </div>

        {([1, 2] as const).map((numero) => {
          const entrega = entregas[numero - 1];
          const practica = getPractica(curso, unidad, numero);

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
                {practica ? <Enunciado texto={practica.enunciado} pasos={practica.pasos} /> : null}

                {entrega ? (
                  <>
                    <div>
                      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="text-sm font-extrabold uppercase tracking-wide text-ink-500">
                          Programa entregado
                        </h4>
                        <p className="text-sm font-semibold text-ink-500">
                          Entregado el {formatFecha(entrega.entregadaEn)}
                        </p>
                      </div>
                      <div className="overflow-x-auto rounded-2xl bg-ink-50 p-4">
                        <ProgramBlocks
                          rows={entrega.bloques}
                          label={`Programa de ${alumno.name}: programación ${numero}`}
                        />
                      </div>
                      {entrega.explicacion ? (
                        <p className="mt-3 rounded-2xl border-2 border-ink-100 p-4 text-sm font-semibold text-ink-700">
                          <span className="font-extrabold text-ink-900">El alumno explica: </span>
                          {entrega.explicacion}
                        </p>
                      ) : null}
                    </div>

                    {practica ? (
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
                      </div>
                    ) : null}

                    <div className="border-t-2 border-ink-100 pt-5">
                      <CorreccionPrograma
                        key={entrega.id}
                        entregaId={entrega.id}
                        puntos={entrega.puntos}
                        comentario={entrega.comentario}
                      />
                      {entrega.corregidaEn ? (
                        <p className="mt-3 text-sm font-semibold text-ink-500">
                          Corregida el {formatFecha(entrega.corregidaEn)}
                          {entrega.corregidaPor ? ` por ${entrega.corregidaPor}` : ""}.
                        </p>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="font-semibold text-ink-500">
                    {alumno.name} no ha entregado esta programación todavía.
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <Link
        href={`/dashboard/profesor/practicas/${alumnoId}/${unidad}`}
        className="font-extrabold text-spike-700 underline decoration-2 underline-offset-4 hover:text-spike-900"
      >
        Ver las 4 prácticas de programación de esta unidad (sin nota)
      </Link>
    </div>
  );
}
