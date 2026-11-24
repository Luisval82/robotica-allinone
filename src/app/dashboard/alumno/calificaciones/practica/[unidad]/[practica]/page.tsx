import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgramBlocks } from "@/components/brand/ProgramBlocks";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { Enunciado } from "@/components/unidad/Enunciado";
import { RecorridoBaldosas } from "@/components/unidad/RecorridoBaldosas";
import { SueloBaldosas } from "@/components/unidad/SueloBaldosas";
import { requireRole } from "@/lib/auth";
import { getPracticasIntermediasDeUnidad } from "@/lib/contenido";
import { getPracticasIntermedias } from "@/lib/db";
import { formatFecha } from "@/lib/format";
import { nivelDeParecido, parecidoDeProgramas, type Nivel } from "@/lib/parecido";
import { COURSE_LABEL, UNIT_NUMBERS } from "@/lib/types";
import { getUnidad } from "@/lib/unidades";

export const metadata: Metadata = { title: "Mi práctica" };

const EXPLICACION: Record<Nivel, { titulo: string; clase: string }> = {
  bien: { titulo: "igual que la solución", clase: "bg-nivel-bien text-white" },
  casi: { titulo: "casi igual", clase: "bg-nivel-casi text-ink-900" },
  regular: { titulo: "se parece a medias", clase: "bg-nivel-regular text-white" },
  flojo: { titulo: "se parece poco", clase: "bg-nivel-flojo text-white" },
  "sin-hacer": { titulo: "sin empezar", clase: "bg-nivel-nada text-ink-600" },
};

/**
 * Una de las 4 prácticas de programación, como la ve su autor: solo lectura.
 *
 * Aquí la solución oficial se enseña siempre, y no es una concesión: estas 4
 * prácticas no llevan nota y el alumno ya la tiene en la unidad en cuanto
 * pulsa «Guardar y comprobar». Las 2 programaciones de la PRUEBA, que sí
 * llevan nota, van por otro sitio y con otra regla.
 *
 * De aquí no se puede cambiar nada: para rehacer una práctica se va a la
 * unidad, que es donde está el taller.
 */
export default async function MiPracticaPage({
  params,
}: {
  params: Promise<{ unidad: string; practica: string }>;
}) {
  const session = await requireRole(["alumno"]);
  if (!session.course) return notFound();
  const curso = session.course;

  const { unidad: unidadTexto, practica: practicaTexto } = await params;
  const unidad = Number(unidadTexto);
  const numero = Number(practicaTexto);
  if (!UNIT_NUMBERS.some((n) => n === unidad) || ![1, 2, 3, 4].includes(numero)) return notFound();

  const practicas = getPracticasIntermediasDeUnidad(curso, unidad);
  const practica = practicas.find((p) => p.practica === numero);
  if (!practica) return notFound();

  // Siempre con el id de la sesión: no hay forma de pedir la de otro.
  const guardadas = await getPracticasIntermedias(session.id, unidad);
  const guardada = guardadas.find((item) => item.practica === numero);

  const parecido = guardada ? parecidoDeProgramas(guardada.bloques, practica.solucion) : null;
  const nivel = nivelDeParecido(parecido);
  const explicacion = EXPLICACION[nivel];
  const titulo = getUnidad(curso, unidad)?.titulo ?? `Unidad ${unidad}`;

  return (
    <div className="grid gap-6">
      <Link
        href="/dashboard/alumno/calificaciones"
        className="inline-flex items-center gap-2 font-bold text-ink-600 transition hover:text-ink-900"
      >
        <ArrowLeftIcon className="size-4" />
        Calificaciones
      </Link>

      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
          {COURSE_LABEL[curso]} · UD {unidad} · {titulo}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">
          Práctica {numero} · {practica.titulo}
        </h1>
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
              funcione también está bien.
            </span>
          ) : null}
        </div>
      </div>

      <section className="rounded-card bg-white p-6 shadow-card">
        <Enunciado texto={practica.enunciado} pasos={practica.pasos} />
        {practica.suelo ? (
          <div className="mt-3">
            <SueloBaldosas curso={curso} />
          </div>
        ) : null}
        {practica.recorrido ? (
          <div className="mt-3">
            <RecorridoBaldosas recorrido={practica.recorrido} curso={curso} />
          </div>
        ) : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-card bg-white p-6 shadow-card">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-500">
            Lo que guardaste
          </h2>
          {guardada ? (
            <>
              <p className="mt-1 text-sm font-bold text-ink-500">
                {guardada.comprobadaEn
                  ? `Comprobada el ${formatFecha(guardada.comprobadaEn)}: este es el programa con el que la cerraste.`
                  : `Guardada el ${formatFecha(guardada.entregadaEn)}. Todavía la puedes cambiar desde la unidad.`}
              </p>
              <div className="mt-3 overflow-x-auto rounded-2xl bg-ink-50 p-4">
                <ProgramBlocks
                  rows={guardada.bloques}
                  label={`Tu programa de la práctica ${numero}`}
                />
              </div>
              {guardada.explicacion ? (
                <p className="mt-3 text-sm font-semibold text-ink-600">
                  Lo explicaste así: {guardada.explicacion}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-sm font-semibold text-ink-500">
              Todavía no has guardado nada en esta práctica.
            </p>
          )}
        </section>

        <section className="rounded-card bg-white p-6 shadow-card">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-500">
            Solución oficial
          </h2>
          <div className="mt-3 overflow-x-auto rounded-2xl bg-spike-50 p-4">
            <ProgramBlocks
              rows={practica.solucion}
              label={`Solución oficial de la práctica ${numero}`}
            />
          </div>
          {practica.notas ? (
            <p className="mt-2 text-sm font-semibold text-ink-600">{practica.notas}</p>
          ) : null}
        </section>
      </div>

      {/* Saltar a las otras tres sin volver a la tabla, viendo de un vistazo
          cuáles quedan por entregar. Verde y amarillo nunca van solos: cada
          botón dice su estado en el título y para el lector de pantalla. */}
      <nav aria-label="Las otras prácticas de la unidad" className="flex flex-wrap gap-2">
        {practicas.map((otra) => {
          const activa = otra.practica === numero;
          const suya = guardadas.find((item) => item.practica === otra.practica);
          const terminada = suya?.comprobadaEn != null;
          const borrador = suya != null && !terminada;
          const estado = terminada
            ? "entregada"
            : borrador
              ? "empezada, pendiente de entregar"
              : "pendiente de entregar";

          return (
            <Link
              key={otra.practica}
              href={`/dashboard/alumno/calificaciones/practica/${unidad}/${otra.practica}`}
              aria-current={activa ? "page" : undefined}
              title={`Práctica ${otra.practica}: ${estado}`}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition-colors ${
                terminada ? "bg-nivel-bien text-white" : "bg-hub-400 text-ink-900"
              } ${
                // La que estás viendo se marca con el aro, no con otro color:
                // así no pierde el suyo, que es lo que se viene a mirar.
                activa ? "ring-2 ring-ink-900 ring-offset-2" : "hover:opacity-85"
              }`}
            >
              Práctica {otra.practica}
              {/* El mismo punto que en la matriz: guardada pero sin cerrar. */}
              {borrador ? (
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-ink-900/40"
                />
              ) : null}
              <span className="sr-only"> · {estado}</span>
            </Link>
          );
        })}
        <Link
          href={`/dashboard/alumno/unidad/${unidad}`}
          className="rounded-full border-2 border-spike-200 bg-white px-4 py-2 text-sm font-extrabold text-spike-700 transition-colors hover:border-spike-600"
        >
          Ir a la unidad {unidad}
        </Link>
      </nav>

      <p className="-mt-3 text-sm font-semibold text-ink-600">
        En <b className="text-ink-900">verde</b> las que ya has entregado con «Guardar y
        comprobar»; en <b className="text-ink-900">amarillo</b> las que te quedan, con un punto si
        la tienes guardada a medias. Estas 4 no las puntúa tu profesor: el verde quiere decir
        entregada, no aprobada.
      </p>
    </div>
  );
}
