import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { PracticasDelAlumno } from "@/components/profesor/PracticasDelAlumno";
import { CabeceraNota, RevisionTest } from "@/components/unidad/RevisionTest";
import { requireRole } from "@/lib/auth";
import {
  getPracticasIntermediasDeUnidad,
  getTestForStudent,
  getTestReview,
} from "@/lib/contenido";
import {
  findUserById,
  getCursosVisibles,
  getPracticasIntermedias,
  getUnitProgress,
  puedeVerCurso,
  testScore,
} from "@/lib/db";
import { COURSE_LABEL, isUuid, UNIT_NUMBERS } from "@/lib/types";
import { getUnidad } from "@/lib/unidades";

export const metadata: Metadata = { title: "Seguimiento del alumno" };

/**
 * Lo que un alumno ha hecho en una unidad: el test pregunta a pregunta y las
 * cuatro prácticas de programación con el programa que dejó en cada una. Se
 * llega desde la tabla de notas pulsando en la nota.
 */
export default async function SeguimientoAlumnoPage({
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

  const [progreso, practicasGuardadas] = await Promise.all([
    getUnitProgress(alumnoId, unidad),
    getPracticasIntermedias(alumnoId, unidad),
  ]);
  const preguntas = getTestForStudent(alumno.course, unidad);
  const intermedias = getPracticasIntermediasDeUnidad(alumno.course, unidad);
  const titulo = getUnidad(alumno.course, unidad)?.titulo ?? `Unidad ${unidad}`;

  return (
    <div className="grid gap-6">
      <Link
        href={`/dashboard/profesor/notas?curso=${alumno.course}`}
        className="inline-flex items-center gap-2 font-bold text-ink-600 transition hover:text-ink-900"
      >
        <ArrowLeftIcon className="size-4" />
        Notas de los tests
      </Link>

      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
          {COURSE_LABEL[alumno.course]} · UD {unidad} · {titulo}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">{alumno.name}</h1>
      </div>

      {progreso.testAciertos === null ? (
        <p className="rounded-card bg-white p-6 font-semibold text-ink-600 shadow-card">
          Todavía no ha entregado el test de esta unidad.
        </p>
      ) : (
        <>
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
        </>
      )}

      <PracticasDelAlumno
        alumnoId={alumnoId}
        unidad={unidad}
        practicas={intermedias}
        guardadas={practicasGuardadas}
      />
    </div>
  );
}
