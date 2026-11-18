import type { Metadata } from "next";
import Link from "next/link";
import { CourseTabs } from "@/components/profesor/CourseTabs";
import { ProgramBlocks } from "@/components/brand/ProgramBlocks";
import { BotonSpike } from "@/components/unidad/BotonSpike";
import { requireRole } from "@/lib/auth";
import { firstParam, parseCourse } from "@/lib/format";
import { countSoluciones, getPractica } from "@/lib/contenido";
import { COURSE_LABEL, UNIT_NUMBERS } from "@/lib/types";
import { getUnidadesDeCurso } from "@/lib/unidades";

export const metadata: Metadata = { title: "Soluciones oficiales" };

const PATH = "/dashboard/profesor/soluciones";
const PRACTICAS = [1, 2] as const;

export default async function ProfesorSolucionesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Solo profesorado: los alumnos nunca llegan a esta ruta ni a estos datos.
  await requireRole(["profesor", "superadmin"]);

  const params = await searchParams;
  const curso = parseCourse(firstParam(params.curso));
  const udParam = Number(firstParam(params.ud));
  const numero = (UNIT_NUMBERS as readonly number[]).includes(udParam) ? udParam : 1;

  const unidades = getUnidadesDeCurso(curso);
  const unidad = unidades.find((item) => item.numero === numero);

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">Soluciones oficiales</h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        El programa de referencia de las dos prácticas de cada unidad. Solo lo ve el profesorado.
      </p>

      <div className="mt-6">
        <CourseTabs basePath={PATH} active={curso} />
      </div>

      <nav aria-label="Unidad" className="mt-4 flex flex-wrap gap-2">
        {UNIT_NUMBERS.map((item) => {
          const active = item === numero;
          const listas = countSoluciones(curso, item);
          return (
            <Link
              key={item}
              href={`${PATH}?curso=${curso}&ud=${item}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-extrabold transition-colors ${
                active
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-900"
              }`}
            >
              UD {item}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  listas === PRACTICAS.length
                    ? "bg-spike-500 text-white"
                    : active
                      ? "bg-ink-700 text-white"
                      : "bg-ink-100 text-ink-600"
                }`}
              >
                {listas}/{PRACTICAS.length}
              </span>
            </Link>
          );
        })}
      </nav>

      <section className="mt-8 rounded-card bg-white p-6 shadow-card sm:p-8">
        <p className="text-sm font-extrabold uppercase tracking-widest text-ink-500">
          {COURSE_LABEL[curso]} · Unidad {numero}
        </p>
        <h2 className="mt-1 font-display text-3xl font-semibold text-ink-900">
          {unidad?.titulo ?? `Unidad ${numero}`}
        </h2>
        {unidad ? (
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-extrabold uppercase tracking-wide text-ink-500">Hardware</dt>
              <dd className="mt-1 font-semibold text-ink-800">{unidad.hardware}</dd>
            </div>
            <div>
              <dt className="font-extrabold uppercase tracking-wide text-ink-500">Modelo final</dt>
              <dd className="mt-1 font-semibold text-ink-800">{unidad.modelo}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {PRACTICAS.map((n) => {
          const practica = getPractica(curso, numero, n);
          return (
            <section
              key={n}
              id={`practica-${n}`}
              aria-labelledby={`practica-${n}-titulo`}
              className="scroll-mt-24 rounded-card bg-white p-6 shadow-card sm:p-8"
            >
              <p className="text-sm font-extrabold uppercase tracking-widest text-ink-500">
                Práctica {n}
              </p>

              {practica ? (
                <>
                  <h3
                    id={`practica-${n}-titulo`}
                    className="mt-1 font-display text-2xl font-semibold text-ink-900"
                  >
                    {practica.titulo}
                  </h3>
                  <p className="mt-3 font-semibold text-ink-700">{practica.enunciado}</p>
                  {/* El mismo botón que ve el alumno: así el profesor puede
                      montar la solución en su iPad antes de la clase. */}
                  <BotonSpike />

                  <h4 className="mb-3 mt-6 text-sm font-extrabold uppercase tracking-wide text-ink-500">
                    Solución
                  </h4>
                  <ProgramBlocks rows={practica.solucion} label="Programa de la solución" />

                  {practica.notas ? (
                    <p className="mt-6 rounded-2xl bg-hub-50 p-4 text-sm font-semibold text-ink-800">
                      <span className="font-extrabold">Al corregir: </span>
                      {practica.notas}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <h3
                    id={`practica-${n}-titulo`}
                    className="mt-1 font-display text-2xl font-semibold text-ink-900"
                  >
                    Solución sin redactar
                  </h3>
                  <p className="mt-3 rounded-2xl border-2 border-dashed border-ink-300 p-4 text-sm font-semibold text-ink-600">
                    Esta unidad todavía no tiene contenido redactado. Créalo en{" "}
                    <code className="font-mono">
                      src/data/contenido/{curso}-{numero}.json
                    </code>{" "}
                    copiando el archivo de una unidad ya hecha.
                  </p>
                </>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
