import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { FichaPractica } from "@/components/profesor/FichaPractica";
import { requireRole } from "@/lib/auth";
import { getPracticasIntermediasDeUnidad } from "@/lib/contenido";
import {
  findUserById,
  getCursosVisibles,
  getPracticasIntermedias,
  puedeVerCurso,
} from "@/lib/db";
import { nivelDeParecido, parecidoDeProgramas, type Nivel } from "@/lib/parecido";
import { COURSE_LABEL, isUuid, UNIT_NUMBERS } from "@/lib/types";
import { getUnidad } from "@/lib/unidades";

export const metadata: Metadata = { title: "Práctica del alumno" };

/** Lo que dice el cuadrado de la matriz, en palabras. */
const EXPLICACION: Record<Nivel, { titulo: string; clase: string }> = {
  bien: { titulo: "Igual que la solución de ejemplo", clase: "bg-nivel-bien text-white" },
  casi: { titulo: "Casi igual a la solución de ejemplo", clase: "bg-nivel-casi text-ink-900" },
  regular: {
    titulo: "Se parece a medias a la solución de ejemplo",
    clase: "bg-nivel-regular text-white",
  },
  flojo: { titulo: "Se parece poco a la solución de ejemplo", clase: "bg-nivel-flojo text-white" },
  "sin-hacer": { titulo: "Sin empezar", clase: "bg-ink-100 text-ink-700" },
};

/**
 * Una sola práctica de programación de un alumno.
 *
 * Es a donde lleva cada uno de los 4 cuadrados de la matriz: se pulsa el
 * cuadrado naranja y se abre ESA práctica, con su programa y la solución al
 * lado, sin tener que bajar por las otras tres.
 *
 * Tiene dirección propia a propósito, en vez de ser una ventana flotante:
 * así se puede compartir, recargar y volver con el botón de atrás, que
 * devuelve la matriz donde estaba.
 */
export default async function UnaPracticaPage({
  params,
}: {
  params: Promise<{ alumno: string; unidad: string; practica: string }>;
}) {
  const session = await requireRole(["profesor", "superadmin"]);

  const { alumno: alumnoId, unidad: unidadTexto, practica: practicaTexto } = await params;
  const unidad = Number(unidadTexto);
  const numero = Number(practicaTexto);
  const valida = UNIT_NUMBERS.some((n) => n === unidad);
  if (!isUuid(alumnoId) || !valida || !Number.isInteger(numero) || numero < 1 || numero > 4) {
    return notFound();
  }

  const alumno = await findUserById(alumnoId);
  if (!alumno || alumno.role !== "alumno" || !alumno.course) return notFound();
  const curso = alumno.course;

  // Un profesor solo mira a los alumnos de los cursos que imparte.
  const visibles = await getCursosVisibles(session);
  if (!puedeVerCurso(visibles, curso)) return notFound();

  const practicas = getPracticasIntermediasDeUnidad(curso, unidad);
  const practica = practicas.find((p) => p.practica === numero);
  if (!practica) return notFound();

  const guardadas = await getPracticasIntermedias(alumnoId, unidad);
  const guardada = guardadas.find((item) => item.practica === numero);

  const parecido = guardada ? parecidoDeProgramas(guardada.bloques, practica.solucion) : null;
  const nivel = nivelDeParecido(parecido);
  const explicacion = EXPLICACION[nivel];

  const titulo = getUnidad(curso, unidad)?.titulo ?? `Unidad ${unidad}`;

  return (
    <div className="grid gap-6">
      <Link
        href={`/dashboard/profesor?curso=${curso}`}
        className="inline-flex items-center gap-2 font-bold text-ink-600 transition hover:text-ink-900"
      >
        <ArrowLeftIcon className="size-4" />
        Progreso y notas alumnado
      </Link>

      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
          {COURSE_LABEL[curso]} · UD {unidad} · {titulo}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">{alumno.name}</h1>
      </div>

      <FichaPractica
        practica={practica}
        guardada={guardada}
        alumnoId={alumnoId}
        unidad={unidad}
        deCuantas={practicas.length}
        solucionAbierta
      >
        {/* La comparación que pinta el cuadrado, dicha con todas las letras. */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide ${explicacion.clase}`}
          >
            {explicacion.titulo}
          </span>
          {parecido !== null ? (
            <span className="text-sm font-semibold text-ink-500">
              Se parece un {Math.round(parecido * 100)} % a la solución, comparando bloque a
              bloque. <b className="text-ink-700">No es una nota</b>: un programa distinto que
              funcione también cuenta como bueno.
            </span>
          ) : null}
        </div>
      </FichaPractica>

      {/* Saltar a las otras tres sin volver a la matriz. */}
      <nav aria-label="Las otras prácticas de la unidad" className="flex flex-wrap gap-2">
        {practicas.map((otra) => {
          const activa = otra.practica === numero;
          return (
            <Link
              key={otra.practica}
              href={`/dashboard/profesor/practicas/${alumnoId}/${unidad}/${otra.practica}`}
              aria-current={activa ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition-colors ${
                activa
                  ? "bg-ink-900 text-white"
                  : "border-2 border-ink-200 bg-white text-ink-700 hover:border-ink-900"
              }`}
            >
              Práctica {otra.practica}
            </Link>
          );
        })}
        <Link
          href={`/dashboard/profesor/practicas/${alumnoId}/${unidad}`}
          className="rounded-full border-2 border-ink-200 bg-white px-4 py-2 text-sm font-extrabold text-ink-700 transition-colors hover:border-ink-900"
        >
          Verlas todas seguidas
        </Link>
        <Link
          href={`/dashboard/profesor/notas/${alumnoId}/${unidad}`}
          className="rounded-full border-2 border-spike-200 bg-white px-4 py-2 text-sm font-extrabold text-spike-700 transition-colors hover:border-spike-600"
        >
          Ir a la PRUEBA de la unidad
        </Link>
      </nav>
    </div>
  );
}
