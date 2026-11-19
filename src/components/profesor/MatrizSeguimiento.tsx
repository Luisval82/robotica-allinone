// La matriz de seguimiento: todo el curso en una pantalla.
//
// Una fila por alumno y, dentro, una casilla por unidad con cinco cuadrados
// —la teoría y las 4 prácticas de programación— y, al lado, la nota de la
// PRUEBA. Pulsando la nota se entra directamente a corregir ese examen.
//
// Por qué así: antes esto eran tres pestañas —progreso, notas y prácticas— y
// para saber cómo iba un alumno en la unidad 3 había que mirar en las tres.
// Puestas en una matriz, el profesor ve de un vistazo dónde está el problema
// y entra solo donde hace falta.
//
// El color de los cuadrados de las prácticas sale de comparar el programa
// del alumno con la solución oficial. NO es una nota y la leyenda lo dice:
// un programa distinto y correcto saldrá en naranja. Sirve para decidir a
// quién mirar primero.

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import type { CeldaUnidad, FilaMatriz } from "@/lib/db";
import type { Nivel } from "@/lib/parecido";
import { formatNota } from "@/lib/format";
import { COURSE_LABEL, THEORY_STEPS, UNIT_NUMBERS, type Course } from "@/lib/types";

const COLOR_NIVEL: Record<Nivel, string> = {
  bien: "bg-nivel-bien",
  casi: "bg-nivel-casi",
  regular: "bg-nivel-regular",
  flojo: "bg-nivel-flojo",
  "sin-hacer": "bg-nivel-nada",
};

const TEXTO_NIVEL: Record<Nivel, string> = {
  bien: "igual que la solución oficial",
  casi: "casi igual a la solución oficial",
  regular: "se parece a medias a la solución oficial",
  flojo: "se parece poco a la solución oficial",
  "sin-hacer": "sin empezar",
};

/** Un cuadradito. Es un enlace cuando hay algo que mirar detrás. */
function Cuadro({
  className,
  titulo,
  href,
  children,
}: {
  className: string;
  titulo: string;
  href?: string;
  children?: ReactNode;
}) {
  const clase = `grid size-5 place-items-center rounded-[0.2rem] text-[0.6rem] font-extrabold leading-none ${className}`;
  if (!href) {
    return (
      <span className={clase} title={titulo}>
        <span className="sr-only">{titulo}</span>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      title={titulo}
      className={`${clase} transition hover:ring-2 hover:ring-ink-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink-900`}
    >
      <span className="sr-only">{titulo}</span>
      {children}
    </Link>
  );
}

/** Los cinco cuadrados de una unidad: la teoría y las 4 prácticas. */
function CuadrosDeUnidad({
  celda,
  alumnoId,
  alumnoNombre,
}: {
  celda: CeldaUnidad;
  alumnoId: string;
  alumnoNombre: string;
}) {
  const practicas = `/dashboard/profesor/practicas/${alumnoId}/${celda.unidad}`;
  const teoriaCompleta = celda.teoria >= THEORY_STEPS;

  return (
    <div className="flex items-center gap-[3px]">
      {/* La teoría va primero y algo separada: no es una práctica. */}
      <Cuadro
        className={`mr-1 ${
          teoriaCompleta
            ? "bg-nivel-bien text-white"
            : celda.teoria > 0
              ? "bg-nivel-regular text-white"
              : "bg-nivel-nada text-ink-500"
        }`}
        titulo={`${alumnoNombre}, UD ${celda.unidad}: teoría ${celda.teoria} de ${THEORY_STEPS}`}
      >
        <span aria-hidden="true">T</span>
      </Cuadro>

      {celda.practicas.map((practica) => (
        <Cuadro
          key={practica.practica}
          className={`${COLOR_NIVEL[practica.nivel]} ${
            practica.nivel === "sin-hacer" ? "" : "hover:opacity-80"
          }`}
          href={practica.nivel === "sin-hacer" ? undefined : practicas}
          titulo={`${alumnoNombre}, UD ${celda.unidad}, práctica ${practica.practica}: ${
            TEXTO_NIVEL[practica.nivel]
          }${practica.comprobada ? " · terminada" : practica.nivel === "sin-hacer" ? "" : " · a medias"}`}
        >
          {/* Un punto marca lo que el alumno todavía no ha dado por terminado. */}
          {practica.nivel !== "sin-hacer" && !practica.comprobada ? (
            <span aria-hidden="true" className="size-1.5 rounded-full bg-white/80" />
          ) : null}
        </Cuadro>
      ))}
    </div>
  );
}

/** La nota de la PRUEBA. Pulsarla abre la revisión de ese examen. */
function NotaDeLaPrueba({
  celda,
  alumnoId,
  alumnoNombre,
}: {
  celda: CeldaUnidad;
  alumnoId: string;
  alumnoNombre: string;
}) {
  const { prueba } = celda;
  const corregidas = prueba.practicas.filter((p) => p !== null).length;
  const pendientes = prueba.entregadas - corregidas;

  const tono =
    prueba.final === null
      ? "bg-ink-50 text-ink-400"
      : !prueba.completa
        ? "bg-ink-100 text-ink-700"
        : prueba.final >= 5
          ? "bg-nivel-bien text-white"
          : "bg-nivel-flojo text-white";

  const explicacion =
    prueba.final === null
      ? `${alumnoNombre} no ha hecho todavía la prueba de la UD ${celda.unidad}. Pulsa para abrirla.`
      : prueba.completa
        ? `Prueba de la UD ${celda.unidad} completa: ${formatNota(prueba.final)} de 10. Pulsa para revisarla.`
        : `Lleva ${formatNota(prueba.final)} de 10 en la UD ${celda.unidad}${
            pendientes > 0 ? `, con ${pendientes} por corregir` : ""
          }. Pulsa para corregir.`;

  return (
    <Link
      href={`/dashboard/profesor/notas/${alumnoId}/${celda.unidad}`}
      title={explicacion}
      className={`relative grid h-7 w-11 place-items-center rounded-lg text-sm font-extrabold tabular-nums transition hover:ring-2 hover:ring-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900 ${tono}`}
    >
      <span className="sr-only">{explicacion}</span>
      <span aria-hidden="true">{formatNota(prueba.final)}</span>
      {/* Amarillo: hay entregas esperando corrección. */}
      {pendientes > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-white bg-hub-400"
        />
      ) : null}
    </Link>
  );
}

export function MatrizSeguimiento({ filas, curso }: { filas: FilaMatriz[]; curso: Course }) {
  if (filas.length === 0) {
    return (
      <p className="mt-8 rounded-card bg-white p-6 font-semibold text-ink-500 shadow-card">
        Todavía no se ha registrado nadie de {COURSE_LABEL[curso]}.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-card bg-white shadow-card">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Seguimiento de {COURSE_LABEL[curso]}: por cada alumno y unidad, la teoría, las 4
          prácticas de programación y la nota de la prueba
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              rowSpan={2}
              className="sticky left-0 z-20 border-b-2 border-r-2 border-ink-100 bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-ink-500"
            >
              Alumno
            </th>
            {UNIT_NUMBERS.map((unidad) => (
              <th
                key={unidad}
                scope="colgroup"
                colSpan={2}
                className="border-b border-l-2 border-ink-100 bg-spike-600 px-2 py-2 text-center text-xs font-extrabold uppercase tracking-wide text-white"
              >
                UD {unidad}
              </th>
            ))}
            <th
              scope="col"
              rowSpan={2}
              className="border-b-2 border-l-2 border-ink-100 px-4 py-3 text-center text-xs font-extrabold uppercase tracking-wide text-ink-500"
            >
              Avance
            </th>
            <th
              scope="col"
              rowSpan={2}
              className="border-b-2 border-ink-100 px-4 py-3 text-center text-xs font-extrabold uppercase tracking-wide text-ink-500"
            >
              Media
            </th>
          </tr>
          <tr className="text-[0.65rem] font-extrabold uppercase tracking-wide text-ink-400">
            {UNIT_NUMBERS.map((unidad) => (
              <Fragment key={unidad}>
                <th scope="col" className="border-b-2 border-l-2 border-ink-100 px-2 py-1.5">
                  Teoría y prácticas
                </th>
                <th scope="col" className="border-b-2 border-ink-100 px-2 py-1.5 text-center">
                  Prueba
                </th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map(({ alumno, unidades, porcentaje, media }) => (
            <tr key={alumno.id} className="border-b border-ink-100 last:border-b-0">
              <th
                scope="row"
                className="sticky left-0 z-10 border-r-2 border-ink-100 bg-white px-5 py-2 text-sm font-bold text-ink-900"
              >
                <Link
                  href={`/dashboard/profesor/notas/${alumno.id}/1`}
                  className="underline decoration-ink-200 decoration-2 underline-offset-4 transition hover:decoration-spike-500"
                >
                  {alumno.name}
                </Link>
              </th>

              {unidades.map((celda) => (
                <Fragment key={celda.unidad}>
                  <td className="border-l-2 border-ink-100 px-2 py-2">
                    <CuadrosDeUnidad
                      celda={celda}
                      alumnoId={alumno.id}
                      alumnoNombre={alumno.name}
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <NotaDeLaPrueba
                      celda={celda}
                      alumnoId={alumno.id}
                      alumnoNombre={alumno.name}
                    />
                  </td>
                </Fragment>
              ))}

              <td className="border-l-2 border-ink-100 px-4 py-2 text-center text-sm font-bold tabular-nums text-ink-700">
                {porcentaje} %
              </td>
              <td className="px-4 py-2 text-center font-display text-lg font-semibold tabular-nums text-ink-900">
                {formatNota(media)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
