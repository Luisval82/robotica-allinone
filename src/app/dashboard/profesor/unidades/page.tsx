import type { Metadata } from "next";
import Link from "next/link";
import { AccessTable, type AccessRow } from "@/components/profesor/AccessTable";
import { CourseTabs } from "@/components/profesor/CourseTabs";
import { requireRole } from "@/lib/auth";
import { getClassAccess, getStudentAccess, listStudents } from "@/lib/db";
import { firstParam, parseCourse } from "@/lib/format";
import { COURSE_LABEL } from "@/lib/types";
import { getUnidadesDeCurso } from "@/lib/unidades";

export const metadata: Metadata = { title: "Unidades y pruebas" };

const PATH = "/dashboard/profesor/unidades";

export default async function ProfesorUnidadesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["profesor", "superadmin"]);

  const params = await searchParams;
  const curso = parseCourse(firstParam(params.curso));
  const alumnoId = firstParam(params.alumno);

  const unidades = getUnidadesDeCurso(curso);
  const tituloDe = (unidad: number) =>
    unidades.find((item) => item.numero === unidad)?.titulo ?? `Unidad ${unidad}`;

  const [accesoClase, alumnos] = await Promise.all([getClassAccess(curso), listStudents(curso)]);
  const alumno = alumnos.find((item) => item.id === alumnoId) ?? null;
  const accesoAlumno = alumno ? await getStudentAccess({ id: alumno.id, course: curso }) : [];

  const filasClase: AccessRow[] = accesoClase.map((item) => ({
    unidad: item.unidad,
    titulo: tituloDe(item.unidad),
    abierta: item.abierta,
    pruebaMarcada: item.pruebaInterruptor,
    pruebaDesactivada: !item.abierta,
    pruebaAlPulsar: !item.pruebaInterruptor,
    pruebaNota: !item.abierta
      ? "Abre antes la unidad"
      : item.pruebaInterruptor
        ? "Abierta para todos"
        : "Se abre sola al terminar la teoría",
  }));

  const filasAlumno: AccessRow[] = accesoAlumno.map((item) => ({
    unidad: item.unidad,
    titulo: tituloDe(item.unidad),
    abierta: item.abierta,
    unidadNota: item.unidadIndividual ? "Ajuste individual" : undefined,
    pruebaMarcada: item.pruebaInterruptor || item.pruebaPorTeoria,
    pruebaDesactivada: !item.abierta || item.pruebaPorTeoria,
    pruebaAlPulsar: !item.pruebaInterruptor,
    pruebaNota: !item.abierta
      ? "Abre antes la unidad"
      : item.pruebaPorTeoria
        ? "Abierta: terminó la teoría"
        : item.pruebaIndividual
          ? "Ajuste individual"
          : undefined,
  }));

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">Unidades y pruebas</h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        Abre o bloquea cada unidad y su PRUEBA final. Por defecto solo está abierta la unidad 1.
      </p>

      <div className="mt-6">
        <CourseTabs basePath={PATH} active={curso} />
      </div>

      <section aria-labelledby="toda-la-clase" className="mt-8">
        <h2 id="toda-la-clase" className="font-display text-2xl font-semibold text-ink-900">
          Toda la clase de {COURSE_LABEL[curso]}
        </h2>
        <p className="mb-4 mt-1 max-w-3xl font-semibold text-ink-500">
          Estos interruptores valen para todo el curso. Al pulsar uno, se borran los ajustes
          individuales de esa unidad y toda la clase queda igual.
        </p>
        <AccessTable
          rows={filasClase}
          scope={{ ambito: "clase", curso }}
          quien={`toda la clase de ${COURSE_LABEL[curso]}`}
        />
      </section>

      <section id="por-alumno" aria-labelledby="por-alumno-titulo" className="mt-12 scroll-mt-24">
        <h2 id="por-alumno-titulo" className="font-display text-2xl font-semibold text-ink-900">
          Alumno por alumno
        </h2>
        <p className="mb-4 mt-1 max-w-3xl font-semibold text-ink-500">
          Elige un alumno para abrirle o bloquearle una unidad solo a él, sin cambiar la del resto.
        </p>

        {alumnos.length === 0 ? (
          <p className="rounded-card bg-white p-6 font-semibold text-ink-500 shadow-card">
            Todavía no se ha registrado nadie de {COURSE_LABEL[curso]}.
          </p>
        ) : (
          <>
            <ul className="mb-5 flex flex-wrap gap-2">
              {alumnos.map((item) => {
                const active = item.id === alumno?.id;
                return (
                  <li key={item.id}>
                    <Link
                      href={`${PATH}?curso=${curso}&alumno=${item.id}#por-alumno`}
                      aria-current={active ? "true" : undefined}
                      className={`inline-flex rounded-full border-2 px-4 py-2 text-sm font-extrabold transition-colors ${
                        active
                          ? "border-ink-900 bg-ink-900 text-white"
                          : "border-ink-200 bg-white text-ink-700 hover:border-ink-900"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {alumno ? (
              <AccessTable
                rows={filasAlumno}
                scope={{ ambito: "alumno", alumnoId: alumno.id }}
                quien={alumno.name}
              />
            ) : (
              <p className="rounded-card border-2 border-dashed border-ink-300 p-6 font-semibold text-ink-600">
                Pulsa un nombre para ver y cambiar sus unidades.
              </p>
            )}
          </>
        )}
      </section>
    </>
  );
}
