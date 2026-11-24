import type { Metadata } from "next";
import Link from "next/link";
import { ChapaEstado } from "@/components/calificaciones/EstadoPrueba";
import { ArrowRightIcon } from "@/components/ui/icons";
import { requireRole } from "@/lib/auth";
import { calificacionesDeAlumno, type PruebaCalificada } from "@/lib/calificaciones";
import { getCalificacionesDelAlumno } from "@/lib/db";
import { formatFecha, formatNota } from "@/lib/format";
import { COURSE_LABEL, TEST_QUESTIONS } from "@/lib/types";
import { unitTone } from "@/lib/unitTone";

export const metadata: Metadata = { title: "Mis calificaciones" };

const ORDINAL = ["", "1.ª", "2.ª", "3.ª"];

/** Un número grande de nota, con su escala al lado. */
function Nota({ valor, sobre = 10 }: { valor: number | null; sobre?: number }) {
  return (
    <span className="font-display text-3xl font-semibold text-ink-900">
      {formatNota(valor)}
      <span className="ml-0.5 text-base font-bold text-ink-500">/{sobre}</span>
    </span>
  );
}

/** El desglose de una prueba: el test y las 2 programaciones del profesor. */
function Desglose({ prueba }: { prueba: PruebaCalificada }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl bg-spike-50 p-4">
        <p className="text-xs font-extrabold uppercase tracking-widest text-spike-800">Test</p>
        <p className="mt-1 font-display text-2xl font-semibold text-ink-900">
          {formatNota(prueba.test)}
          <span className="ml-0.5 text-sm font-bold text-ink-500">/10</span>
        </p>
        <p className="mt-0.5 text-xs font-bold text-ink-600">
          {prueba.aciertos === null
            ? "sin entregar"
            : `${prueba.aciertos} de ${TEST_QUESTIONS} aciertos`}
        </p>
      </div>

      {prueba.programaciones.map((programacion) => (
        <div key={programacion.practica} className="rounded-xl bg-ink-50 p-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
            Programación {programacion.practica}
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink-900">
            {formatNota(programacion.puntos)}
            <span className="ml-0.5 text-sm font-bold text-ink-500">/1</span>
          </p>
          <p className="mt-0.5 text-xs font-bold text-ink-600">
            {programacion.entregadaEn === null
              ? "sin entregar"
              : programacion.corregidaEn === null
                ? "entregada, sin corregir"
                : `corregida el ${formatFecha(programacion.corregidaEn)}`}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Lo que escribió el profesor al corregir, si escribió algo. */
function Comentarios({ prueba }: { prueba: PruebaCalificada }) {
  const conComentario = prueba.programaciones.filter((p) => p.comentario.trim() !== "");
  if (conComentario.length === 0) return null;

  return (
    <div className="mt-3 grid gap-2">
      <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
        Observaciones de tu profesor
      </p>
      {conComentario.map((programacion) => (
        <blockquote
          key={programacion.practica}
          className="rounded-xl border-l-4 border-spike-400 bg-spike-50 p-3"
        >
          <p className="text-xs font-extrabold uppercase tracking-wide text-spike-800">
            Programación {programacion.practica}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink-800">{programacion.comentario}</p>
        </blockquote>
      ))}
    </div>
  );
}

function TarjetaPrueba({ prueba }: { prueba: PruebaCalificada }) {
  const corregida = prueba.estado === "corregida";

  return (
    <li className="overflow-hidden rounded-card bg-white shadow-card">
      <div
        className={`flex flex-wrap items-center justify-between gap-2 px-6 py-4 ${
          prueba.estado === "bloqueada" ? "bg-ink-200 text-ink-600" : unitTone(prueba.unidad)
        }`}
      >
        <span className="font-display text-xl font-semibold">PRUEBA UD {prueba.unidad}</span>
        <ChapaEstado estado={prueba.estado} />
      </div>

      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h4 className="max-w-md font-display text-lg font-semibold leading-snug text-ink-900">
            {prueba.titulo}
          </h4>
          {corregida ? (
            <div className="text-right">
              <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
                Nota de la prueba
              </p>
              <Nota valor={prueba.nota} />
            </div>
          ) : null}
        </div>

        {/* Mientras falte una programación por puntuar no hay nota que dar: una
            suma a medias presentada como nota sería engañarle. */}
        {prueba.estado === "pendiente" ? (
          <p className="mt-3 rounded-xl bg-hub-50 p-3 text-sm font-bold text-ink-800">
            Ya la has entregado entera. Tu profesor todavía tiene que corregir las
            programaciones, así que aquí no hay nota final hasta que lo haga. El test ya está
            corregido y lo tienes abajo.
          </p>
        ) : null}

        {prueba.estado === "sin-entregar" ? (
          <p className="mt-3 rounded-xl bg-ink-50 p-3 text-sm font-bold text-ink-700">
            {prueba.falta.length === 0
              ? "Todavía no la has hecho."
              : `Te falta por entregar ${prueba.falta.join(" y ")}.`}{" "}
            {prueba.disponible ? (
              <Link
                href={`/dashboard/alumno/unidad/${prueba.unidad}`}
                className="inline-flex items-center gap-1 text-spike-700 underline decoration-2 underline-offset-2"
              >
                Ir a la unidad
                <ArrowRightIcon className="size-3.5" />
              </Link>
            ) : (
              <span className="text-ink-600">
                Tu profesor tiene la prueba cerrada ahora mismo.
              </span>
            )}
          </p>
        ) : null}

        {prueba.estado === "bloqueada" ? (
          <p className="mt-3 rounded-xl bg-ink-50 p-3 text-sm font-bold text-ink-700">
            Esta prueba todavía no está disponible. Se abre al terminar la teoría de la unidad, o
            cuando tu profesor la abra.
          </p>
        ) : (
          <>
            <Desglose prueba={prueba} />
            <Comentarios prueba={prueba} />
          </>
        )}
      </div>
    </li>
  );
}

export default async function CalificacionesPage() {
  const session = await requireRole(["alumno"]);

  if (!session.course) {
    return (
      <p className="rounded-card bg-white p-8 font-semibold text-ink-700 shadow-card">
        Tu cuenta no tiene curso asignado. Pide a tu profesor que lo revise.
      </p>
    );
  }

  // El filtro es por la sesión propia: un alumno solo puede pedir sus notas.
  const pruebas = await getCalificacionesDelAlumno({ id: session.id, course: session.course });
  const calificaciones = calificacionesDeAlumno(pruebas, session.course);

  return (
    <>
      <section className="rounded-card bg-spike-600 p-7 text-white sm:p-10">
        <p className="text-sm font-extrabold uppercase tracking-widest text-spike-100">
          {COURSE_LABEL[session.course]} · Tus pruebas
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Calificaciones</h1>
        <p className="mt-3 max-w-xl text-lg font-semibold text-spike-100">
          Cada PRUEBA son 10 puntos: 8 del test, que se corrige solo al entregarlo, y 1 por cada
          una de las 2 programaciones, que corrige tu profesor.
        </p>
      </section>

      {/* El resumen de arriba: solo cuenta lo que está corregido del todo. */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-card bg-white p-6 shadow-card">
          <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
            Media global
          </p>
          <p className="mt-1">
            <Nota valor={calificaciones.media} />
          </p>
          <p className="mt-1 text-sm font-bold text-ink-600">
            {calificaciones.corregidas === 0
              ? "todavía no hay ninguna prueba corregida"
              : `de ${calificaciones.corregidas} ${
                  calificaciones.corregidas === 1 ? "prueba corregida" : "pruebas corregidas"
                } de ${calificaciones.totales}`}
          </p>
        </div>

        {calificaciones.evaluaciones.map((evaluacion) => (
          <div key={evaluacion.numero} className="rounded-card bg-white p-6 shadow-card">
            <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
              {ORDINAL[evaluacion.numero] ?? evaluacion.numero} evaluación
            </p>
            <p className="mt-1">
              <Nota valor={evaluacion.media} />
            </p>
            <p className="mt-1 text-sm font-bold text-ink-600">
              {evaluacion.corregidas === 0
                ? "sin pruebas corregidas"
                : `${evaluacion.corregidas} de ${evaluacion.pruebas.length} corregidas`}
              {evaluacion.pendientes > 0
                ? `, ${evaluacion.pendientes} por corregir`
                : ""}
            </p>
          </div>
        ))}
      </section>

      {calificaciones.pendientes > 0 ? (
        <p className="mt-5 rounded-card bg-hub-50 p-5 font-bold text-ink-800">
          Tienes {calificaciones.pendientes}{" "}
          {calificaciones.pendientes === 1 ? "prueba entregada" : "pruebas entregadas"} esperando
          la corrección de tu profesor. Las medias de arriba no las cuentan todavía.
        </p>
      ) : null}

      {calificaciones.evaluaciones.map((evaluacion) => (
        <section key={evaluacion.numero} className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-ink-100 pb-2">
            <h2 className="font-display text-2xl font-semibold text-ink-900">
              {ORDINAL[evaluacion.numero] ?? evaluacion.numero} evaluación
            </h2>
            <p className="text-sm font-bold text-ink-500">
              Unidades {evaluacion.pruebas.map((p) => p.unidad).join(", ")}
            </p>
          </div>

          <ol className="mt-5 grid gap-5 lg:grid-cols-2">
            {evaluacion.pruebas.map((prueba) => (
              <TarjetaPrueba key={prueba.unidad} prueba={prueba} />
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}
