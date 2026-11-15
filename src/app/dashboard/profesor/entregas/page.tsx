import type { Metadata } from "next";
import Link from "next/link";
import { CourseTabs } from "@/components/profesor/CourseTabs";
import { COURSE_TONE } from "@/components/profesor/courseTone";
import { GradeForm } from "@/components/profesor/GradeForm";
import { requireRole } from "@/lib/auth";
import { listEntregas, type EntregaEstado } from "@/lib/db";
import { firstParam, formatFecha, formatNota } from "@/lib/format";
import { getPractica } from "@/lib/practicas";
import { COURSE_LABEL, isCourse } from "@/lib/types";
import { getUnidadesDeCurso } from "@/lib/unidades";

export const metadata: Metadata = { title: "Entregas" };

const PATH = "/dashboard/profesor/entregas";

export default async function ProfesorEntregasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["profesor", "superadmin"]);

  const params = await searchParams;
  const cursoParam = firstParam(params.curso);
  const curso = isCourse(cursoParam) ? cursoParam : null;
  const estado: EntregaEstado =
    firstParam(params.estado) === "corregidas" ? "corregidas" : "pendientes";

  const [pendientes, corregidas] = await Promise.all([
    listEntregas({ estado: "pendientes", course: curso ?? undefined }),
    listEntregas({ estado: "corregidas", course: curso ?? undefined }),
  ]);
  const lista = estado === "pendientes" ? pendientes : corregidas;
  const cursoQuery = `curso=${curso ?? "todos"}`;

  const estados: { id: EntregaEstado; label: string; total: number }[] = [
    { id: "pendientes", label: "Por corregir", total: pendientes.length },
    { id: "corregidas", label: "Corregidas", total: corregidas.length },
  ];

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">Entregas</h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        Cada unidad tiene dos entregas de programación. Revisa el programa, compáralo con la
        solución oficial y ponle nota y comentario.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        <nav aria-label="Estado" className="grid grid-cols-2 gap-1 rounded-2xl bg-ink-100 p-1">
          {estados.map((item) => (
            <Link
              key={item.id}
              href={`${PATH}?${cursoQuery}&estado=${item.id}`}
              aria-current={estado === item.id ? "page" : undefined}
              className={`rounded-xl px-4 py-2 text-center text-sm font-extrabold transition-colors ${
                estado === item.id
                  ? "bg-white text-ink-900 shadow-sm"
                  : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {item.label} · {item.total}
            </Link>
          ))}
        </nav>
        <CourseTabs
          basePath={PATH}
          active={curso}
          allLabel="Todos los cursos"
          extraQuery={`&estado=${estado}`}
        />
      </div>

      {lista.length === 0 ? (
        <p className="mt-8 rounded-card bg-white p-6 font-semibold text-ink-500 shadow-card">
          {estado === "pendientes"
            ? "No queda ninguna entrega por corregir."
            : "Todavía no has corregido ninguna entrega."}
        </p>
      ) : (
        <ul className="mt-8 grid gap-6">
          {lista.map(({ entrega, alumno }) => {
            const cursoAlumno = alumno.course ?? "1ESO";
            const unidad = getUnidadesDeCurso(cursoAlumno).find(
              (item) => item.numero === entrega.unidad,
            );
            const practica = getPractica(cursoAlumno, entrega.unidad, entrega.practica);

            return (
              <li key={entrega.id} className="overflow-hidden rounded-card bg-white shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink-100 px-6 py-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink-900">
                      {alumno.name}
                    </h2>
                    <p className="text-sm font-bold text-ink-600">
                      UD {entrega.unidad}
                      {unidad ? ` · ${unidad.titulo}` : ""} — Práctica {entrega.practica}
                      {practica ? `: ${practica.titulo}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${COURSE_TONE[cursoAlumno]}`}
                    >
                      {COURSE_LABEL[cursoAlumno]}
                    </span>
                    {entrega.nota !== null ? (
                      <span className="rounded-full bg-spike-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
                        Nota {formatNota(entrega.nota)}
                      </span>
                    ) : (
                      <span className="rounded-full bg-hub-400 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink-900">
                        Por corregir
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 p-6">
                  <div>
                    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink-500">
                        Programa entregado
                      </h3>
                      <p className="text-sm font-semibold text-ink-500">
                        Entregado el {formatFecha(entrega.entregadaEn)}
                      </p>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-ink-50 p-4 font-mono text-sm leading-relaxed text-ink-900">
                      {entrega.texto}
                    </pre>
                    <Link
                      href={`/dashboard/profesor/soluciones?curso=${cursoAlumno}&ud=${entrega.unidad}#practica-${entrega.practica}`}
                      className="mt-3 inline-block text-sm font-extrabold text-spike-700 underline decoration-2 underline-offset-4 hover:text-spike-900"
                    >
                      Ver la solución oficial de esta práctica
                    </Link>
                  </div>

                  <div className="border-t-2 border-ink-100 pt-6">
                    <GradeForm
                      key={entrega.id}
                      entregaId={entrega.id}
                      nota={entrega.nota}
                      comentario={entrega.comentario}
                    />
                    {entrega.corregidaEn ? (
                      <p className="mt-3 text-sm font-semibold text-ink-500">
                        Corregida el {formatFecha(entrega.corregidaEn)}
                        {entrega.corregidaPor ? ` por ${entrega.corregidaPor}` : ""}.
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
