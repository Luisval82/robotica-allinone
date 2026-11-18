import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { PracticasDelAlumno } from "@/components/profesor/PracticasDelAlumno";
import { requireRole } from "@/lib/auth";
import { getPracticasIntermediasDeUnidad } from "@/lib/contenido";
import {
  findUserById,
  getCursosVisibles,
  getPracticasIntermedias,
  puedeVerCurso,
} from "@/lib/db";
import { COURSE_LABEL, isUuid, UNIT_NUMBERS } from "@/lib/types";
import { getUnidad } from "@/lib/unidades";

export const metadata: Metadata = { title: "Prácticas del alumno" };

/**
 * Las 4 prácticas de programación de un alumno en una unidad.
 *
 * Sin nota y sin nada que corregir: se mira el programa que ha montado y, si
 * cerró una por error, se le reabre. La nota de la unidad está en la PRUEBA,
 * que vive en otra pestaña.
 */
export default async function PracticasDelAlumnoPage({
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

  const visibles = await getCursosVisibles(session);
  if (!puedeVerCurso(visibles, curso)) notFound();

  const guardadas = await getPracticasIntermedias(alumnoId, unidad);
  const practicas = getPracticasIntermediasDeUnidad(curso, unidad);
  const titulo = getUnidad(curso, unidad)?.titulo ?? `Unidad ${unidad}`;

  return (
    <div className="grid gap-6">
      <Link
        href={`/dashboard/profesor/practicas?curso=${curso}`}
        className="inline-flex items-center gap-2 font-bold text-ink-600 transition hover:text-ink-900"
      >
        <ArrowLeftIcon className="size-4" />
        Prácticas de programación
      </Link>

      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
          {COURSE_LABEL[curso]} · UD {unidad} · {titulo}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">{alumno.name}</h1>
      </div>

      <PracticasDelAlumno
        alumnoId={alumnoId}
        unidad={unidad}
        practicas={practicas}
        guardadas={guardadas}
      />

      <Link
        href={`/dashboard/profesor/notas/${alumnoId}/${unidad}`}
        className="font-extrabold text-spike-700 underline decoration-2 underline-offset-4 hover:text-spike-900"
      >
        Ir a la PRUEBA de esta unidad para ponerle nota
      </Link>
    </div>
  );
}
