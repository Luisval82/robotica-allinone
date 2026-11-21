import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraficoEvolucion } from "@/components/informes/GraficoEvolucion";
import { HojaInforme } from "@/components/informes/HojaInforme";
import { requireRole } from "@/lib/auth";
import {
  findUserById,
  getCursosVisibles,
  getMatrizSeguimiento,
  puedeVerCurso,
} from "@/lib/db";
import { formatNota } from "@/lib/format";
import { evolucionDeAlumno, informeDeAlumno } from "@/lib/informes";
import { COURSE_LABEL, THEORY_STEPS, isUuid } from "@/lib/types";

export const metadata: Metadata = { title: "Informe del alumno" };

const CELDA = "px-2 py-1.5 text-sm";
const CABECERA =
  "px-2 py-1.5 text-left text-[0.65rem] font-extrabold uppercase tracking-widest text-ink-500";

function Dato({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="evitar-corte rounded-xl border-2 border-ink-100 px-3 py-2">
      <dt className="text-[0.65rem] font-extrabold uppercase tracking-widest text-ink-500">
        {rotulo}
      </dt>
      <dd className="font-display text-2xl font-semibold text-ink-900">{valor}</dd>
    </div>
  );
}

/**
 * Informe individual de un alumno, maquetado para imprimirlo o guardarlo
 * como PDF desde el navegador.
 *
 * Quién puede abrirlo: el profesorado de ese curso y el superadministrador.
 * Se comprueba aquí, con el mismo alcance que el resto del panel: un
 * profesor no saca el informe de un alumno de un curso que no imparte,
 * aunque escriba la dirección a mano.
 */
export default async function InformeAlumnoPage({
  params,
}: {
  params: Promise<{ alumno: string }>;
}) {
  const session = await requireRole(["profesor", "superadmin"]);
  const { alumno: alumnoId } = await params;
  if (!isUuid(alumnoId)) return notFound();

  const alumno = await findUserById(alumnoId);
  if (!alumno || alumno.role !== "alumno" || alumno.course === null) return notFound();

  const visibles = await getCursosVisibles(session);
  if (!puedeVerCurso(visibles, alumno.course)) return notFound();

  const matriz = await getMatrizSeguimiento(alumno.course);
  const fila = matriz.find((f) => f.alumno.id === alumnoId);
  if (!fila) return notFound();

  const informe = informeDeAlumno(fila, alumno.course);

  return (
    <HojaInforme
      titulo={alumno.name || "Informe del alumno"}
      subtitulo={`Informe individual · ${COURSE_LABEL[alumno.course]}`}
      volverA="/dashboard/profesor/alumnos"
      volverTexto="Volver a Alumnado"
    >
      <section className="evitar-corte">
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
          <dt className="font-extrabold uppercase tracking-wide text-ink-500">Alumno</dt>
          <dd className="font-bold text-ink-900">{alumno.name}</dd>
          <dt className="font-extrabold uppercase tracking-wide text-ink-500">Correo</dt>
          <dd className="font-mono text-ink-700">{alumno.email}</dd>
          <dt className="font-extrabold uppercase tracking-wide text-ink-500">Curso</dt>
          <dd className="font-bold text-ink-900">{COURSE_LABEL[alumno.course]}</dd>
        </dl>
      </section>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Dato rotulo="Avance del curso" valor={`${fila.porcentaje} %`} />
        <Dato rotulo="Nota media" valor={formatNota(fila.media)} />
        <Dato
          rotulo="Pruebas cerradas"
          valor={`${informe.pruebasCompletas} de ${informe.unidades.length}`}
        />
        <Dato
          rotulo="Prácticas hechas"
          valor={`${informe.practicasComprobadas} de ${informe.practicasTotales}`}
        />
      </dl>

      <section className="mt-6">
        <h2 className="font-display text-xl font-semibold text-ink-900">Evolución por unidades</h2>
        <div className="mt-2">
          <GraficoEvolucion
            puntos={evolucionDeAlumno(informe)}
            titulo="Avance por unidad y nota de la PRUEBA"
          />
        </div>
      </section>

      {informe.evaluaciones.length > 0 ? (
        <section className="evitar-corte mt-6">
          <h2 className="font-display text-xl font-semibold text-ink-900">Por evaluaciones</h2>
          <table className="mt-2 w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-ink-100">
                <th scope="col" className={CABECERA}>
                  Evaluación
                </th>
                <th scope="col" className={CABECERA}>
                  Unidades
                </th>
                <th scope="col" className={CABECERA}>
                  Avance
                </th>
                <th scope="col" className={CABECERA}>
                  Pruebas cerradas
                </th>
                <th scope="col" className={CABECERA}>
                  Media
                </th>
              </tr>
            </thead>
            <tbody>
              {informe.evaluaciones.map((evaluacion) => (
                <tr key={evaluacion.numero} className="border-b border-ink-100">
                  <th scope="row" className={`${CELDA} text-left font-bold text-ink-900`}>
                    {evaluacion.numero}.ª evaluación
                  </th>
                  <td className={`${CELDA} text-ink-700`}>
                    UD {evaluacion.unidades[0]} a {evaluacion.unidades.at(-1)}
                  </td>
                  <td className={`${CELDA} font-semibold text-ink-800`}>
                    {evaluacion.porcentaje} %
                  </td>
                  <td className={`${CELDA} text-ink-700`}>
                    {evaluacion.completas} de {evaluacion.unidades.length}
                  </td>
                  <td className={`${CELDA} font-display text-lg font-semibold text-ink-900`}>
                    {formatNota(evaluacion.media)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="font-display text-xl font-semibold text-ink-900">Unidad por unidad</h2>
        <table className="mt-2 w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-ink-100">
              <th scope="col" className={CABECERA}>
                Unidad
              </th>
              <th scope="col" className={CABECERA}>
                Teoría
              </th>
              <th scope="col" className={CABECERA}>
                Prácticas
              </th>
              <th scope="col" className={CABECERA}>
                Test
              </th>
              <th scope="col" className={CABECERA}>
                Prog. 1
              </th>
              <th scope="col" className={CABECERA}>
                Prog. 2
              </th>
              <th scope="col" className={CABECERA}>
                Nota
              </th>
            </tr>
          </thead>
          <tbody>
            {informe.unidades.map((unidad) => (
              <tr key={unidad.unidad} className="evitar-corte border-b border-ink-100">
                <th scope="row" className={`${CELDA} text-left`}>
                  <span className="font-bold text-ink-900">UD {unidad.unidad}</span>{" "}
                  <span className="text-ink-600">{unidad.titulo}</span>
                </th>
                <td className={`${CELDA} whitespace-nowrap text-ink-700`}>
                  {unidad.teoria} / {THEORY_STEPS}
                </td>
                <td className={`${CELDA} whitespace-nowrap text-ink-700`}>
                  {unidad.practicasComprobadas} / 4
                </td>
                <td className={`${CELDA} whitespace-nowrap text-ink-700`}>
                  {unidad.test === null ? "—" : `${unidad.test} / 8`}
                </td>
                <td className={`${CELDA} whitespace-nowrap text-ink-700`}>
                  {formatNota(unidad.programaciones[0] ?? null)}
                </td>
                <td className={`${CELDA} whitespace-nowrap text-ink-700`}>
                  {formatNota(unidad.programaciones[1] ?? null)}
                </td>
                <td
                  className={`${CELDA} whitespace-nowrap font-display text-lg font-semibold ${
                    unidad.completa ? "text-ink-900" : "text-ink-500"
                  }`}
                >
                  {formatNota(unidad.nota)}
                  {unidad.nota !== null && !unidad.completa ? (
                    <span className="ml-1 text-[0.65rem] font-bold uppercase text-ink-400">
                      parcial
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs font-semibold text-ink-500">
          La PRUEBA de cada unidad son 10 puntos de 1: las 8 preguntas del test, que se corrigen
          solas, y las 2 programaciones que corrige el profesor. Una nota marcada como «parcial»
          es la suma de lo corregido hasta ahora, no la definitiva. Las 4 prácticas de la unidad
          no llevan nota: son para practicar antes de la PRUEBA.
        </p>
      </section>
    </HojaInforme>
  );
}
