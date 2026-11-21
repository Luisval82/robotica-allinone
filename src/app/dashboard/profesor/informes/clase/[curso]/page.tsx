import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraficoEvolucion } from "@/components/informes/GraficoEvolucion";
import { HojaInforme } from "@/components/informes/HojaInforme";
import { requireRole } from "@/lib/auth";
import { getCursosVisibles, getMatrizSeguimiento, puedeVerCurso } from "@/lib/db";
import { formatNota } from "@/lib/format";
import { informeDeClase } from "@/lib/informes";
import { COURSE_LABEL, isCourse } from "@/lib/types";

export const metadata: Metadata = { title: "Informe de la clase" };

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
 * Informe resumen de un grupo, maquetado para imprimirlo o guardarlo como
 * PDF desde el navegador.
 *
 * Una fila por alumno con su avance, sus prácticas, sus pruebas cerradas y
 * su media, más la media por evaluación. El gráfico es el mismo del informe
 * individual, con los datos del grupo: así se compara un alumno con su clase
 * mirando dos dibujos iguales.
 */
export default async function InformeClasePage({
  params,
}: {
  params: Promise<{ curso: string }>;
}) {
  const session = await requireRole(["profesor", "superadmin"]);
  const { curso } = await params;
  if (!isCourse(curso)) return notFound();

  const visibles = await getCursosVisibles(session);
  if (!puedeVerCurso(visibles, curso)) return notFound();

  const matriz = await getMatrizSeguimiento(curso);
  const informe = informeDeClase(matriz, curso);
  const evaluaciones = informe.alumnos[0]?.evaluaciones ?? [];

  return (
    <HojaInforme
      titulo={`${COURSE_LABEL[curso]} · informe del grupo`}
      subtitulo={`${informe.alumnos.length} ${
        informe.alumnos.length === 1 ? "alumno" : "alumnos"
      } · ${COURSE_LABEL[curso]}`}
      volverA="/dashboard/profesor/alumnos"
      volverTexto="Volver a Alumnado"
    >
      {informe.alumnos.length === 0 ? (
        <p className="font-semibold text-ink-600">
          Todavía no hay ningún alumno en {COURSE_LABEL[curso]}, así que no hay nada que resumir.
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Dato rotulo="Alumnos" valor={String(informe.alumnos.length)} />
            <Dato rotulo="Avance medio" valor={`${informe.porcentaje} %`} />
            <Dato rotulo="Nota media" valor={formatNota(informe.media)} />
            <Dato rotulo="Sin empezar" valor={String(informe.sinEmpezar)} />
            <Dato rotulo="Por corregir" valor={String(informe.porCorregir)} />
          </dl>

          <section className="mt-6">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Cómo va el grupo, unidad por unidad
            </h2>
            <div className="mt-2">
              <GraficoEvolucion
                puntos={informe.evolucion}
                titulo="Media del grupo: avance por unidad y nota de la PRUEBA"
              />
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-xl font-semibold text-ink-900">Alumno por alumno</h2>
            <table className="mt-2 w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-ink-100">
                  <th scope="col" className={CABECERA}>
                    Alumno
                  </th>
                  <th scope="col" className={CABECERA}>
                    Avance
                  </th>
                  <th scope="col" className={CABECERA}>
                    Prácticas
                  </th>
                  <th scope="col" className={CABECERA}>
                    Pruebas
                  </th>
                  {evaluaciones.map((evaluacion) => (
                    <th key={evaluacion.numero} scope="col" className={CABECERA}>
                      {evaluacion.numero}.ª ev.
                    </th>
                  ))}
                  <th scope="col" className={CABECERA}>
                    Media
                  </th>
                  <th scope="col" className={CABECERA}>
                    Por corregir
                  </th>
                </tr>
              </thead>
              <tbody>
                {informe.alumnos.map((alumno) => (
                  <tr key={alumno.fila.alumno.id} className="evitar-corte border-b border-ink-100">
                    <th scope="row" className={`${CELDA} text-left font-bold text-ink-900`}>
                      {alumno.fila.alumno.name}
                    </th>
                    <td className={`${CELDA} whitespace-nowrap font-semibold text-ink-800`}>
                      {alumno.fila.porcentaje} %
                    </td>
                    <td className={`${CELDA} whitespace-nowrap text-ink-700`}>
                      {alumno.practicasComprobadas} / {alumno.practicasTotales}
                    </td>
                    <td className={`${CELDA} whitespace-nowrap text-ink-700`}>
                      {alumno.pruebasCompletas} / {alumno.unidades.length}
                    </td>
                    {alumno.evaluaciones.map((evaluacion) => (
                      <td
                        key={evaluacion.numero}
                        className={`${CELDA} whitespace-nowrap text-ink-700`}
                      >
                        {formatNota(evaluacion.media)}
                      </td>
                    ))}
                    <td
                      className={`${CELDA} whitespace-nowrap font-display text-lg font-semibold text-ink-900`}
                    >
                      {formatNota(alumno.fila.media)}
                    </td>
                    <td className={`${CELDA} whitespace-nowrap text-ink-700`}>
                      {alumno.fila.porCorregir === 0 ? "—" : alumno.fila.porCorregir}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs font-semibold text-ink-500">
              El avance cuenta los cuatro hitos de cada unidad: terminar la teoría, entregar el
              test y entregar las 2 programaciones. En las medias solo entran las PRUEBAS
              cerradas del todo —test corregido y las dos programaciones puntuadas—: una prueba a
              medias daría una media baja que no diría nada. «Por corregir» son las
              programaciones entregadas que esperan corrección.
            </p>
          </section>
        </>
      )}
    </HojaInforme>
  );
}
