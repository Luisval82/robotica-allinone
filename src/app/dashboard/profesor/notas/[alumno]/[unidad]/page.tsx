import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { CabeceraNota, RevisionTest } from "@/components/unidad/RevisionTest";
import { requireRole } from "@/lib/auth";
import { getTestForStudent, getTestReview } from "@/lib/contenido";
import { findUserById, getCursosVisibles, getUnitProgress, puedeVerCurso, testScore } from "@/lib/db";
import { COURSE_LABEL, isUuid, UNIT_NUMBERS } from "@/lib/types";
import { getUnidad } from "@/lib/unidades";

export const metadata: Metadata = { title: "Corrección del test" };

/**
 * El test de un alumno en una unidad, pregunta a pregunta. Se llega desde la
 * tabla de notas pulsando en la nota.
 */
export default async function CorreccionTestPage({
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

  // Un profesor solo corrige a los alumnos de los cursos que imparte, aunque
  // llegue aquí escribiendo la dirección a mano.
  const visibles = await getCursosVisibles(session);
  if (!puedeVerCurso(visibles, alumno.course)) notFound();

  const progreso = await getUnitProgress(alumnoId, unidad);
  const preguntas = getTestForStudent(alumno.course, unidad);
  const titulo = getUnidad(alumno.course, unidad)?.titulo ?? `Unidad ${unidad}`;

  const volver = (
    <Link
      href={`/dashboard/profesor/notas?curso=${alumno.course}`}
      className="inline-flex items-center gap-2 font-bold text-ink-600 transition hover:text-ink-900"
    >
      <ArrowLeftIcon className="size-4" />
      Notas de los tests
    </Link>
  );

  if (progreso.testAciertos === null) {
    return (
      <div className="grid gap-5">
        {volver}
        <h1 className="font-display text-3xl font-semibold text-ink-900">
          {alumno.name} · UD {unidad}
        </h1>
        <p className="rounded-card bg-white p-6 font-semibold text-ink-600 shadow-card">
          Este alumno todavía no ha entregado el test de esta unidad.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {volver}

      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
          {COURSE_LABEL[alumno.course]} · UD {unidad} · {titulo}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">{alumno.name}</h1>
      </div>

      <CabeceraNota
        nota={testScore(progreso.testAciertos)}
        aciertos={progreso.testAciertos}
        total={preguntas.length}
        pie="Corregido automáticamente al entregar."
      />

      <RevisionTest
        preguntas={preguntas}
        detalle={
          progreso.testRespuestas
            ? getTestReview(alumno.course, unidad, progreso.testRespuestas)
            : null
        }
      />
    </div>
  );
}
