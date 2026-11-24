import type { Metadata } from "next";
import { ENLACES_ALUMNO, MatrizSeguimiento } from "@/components/profesor/MatrizSeguimiento";
import { Muestra } from "@/components/profesor/MuestraColor";
import { requireRole } from "@/lib/auth";
import { getFilaMatrizDeAlumno } from "@/lib/db";
import { COURSE_LABEL, THEORY_STEPS } from "@/lib/types";

export const metadata: Metadata = { title: "Mis calificaciones" };

/**
 * La misma tabla de seguimiento que ve el profesor, con la fila propia sola.
 *
 * Es el MISMO componente, no una copia: los enlaces y las columnas de resumen
 * son parámetros (ver MatrizSeguimiento). Así lo que el alumno ve de sí mismo
 * y lo que ve su profesor no pueden acabar diciendo cosas distintas.
 *
 * Sin medias ni resúmenes: aquí se viene a ver el seguimiento y a entrar en lo
 * que haga falta, no a mirar un número.
 */
export default async function CalificacionesPage() {
  const session = await requireRole(["alumno"]);

  if (!session.course) {
    return (
      <p className="rounded-card bg-white p-8 font-semibold text-ink-700 shadow-card">
        Tu cuenta no tiene curso asignado. Pide a tu profesor que lo revise.
      </p>
    );
  }

  // Por la sesión propia: un alumno solo puede pedir su fila.
  const fila = await getFilaMatrizDeAlumno({ ...session, course: session.course });

  return (
    <>
      <section className="rounded-card bg-spike-600 p-7 text-white sm:p-10">
        <p className="text-sm font-extrabold uppercase tracking-widest text-spike-100">
          {COURSE_LABEL[session.course]} · Tu seguimiento
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Calificaciones</h1>
        <p className="mt-3 max-w-2xl text-lg font-semibold text-spike-100">
          Pulsa cualquier cuadrado para ver esa práctica con la solución oficial al lado, o la nota
          de una prueba para ver tu corrección entera.
        </p>
      </section>

      <MatrizSeguimiento
        filas={[fila]}
        curso={session.course}
        enlaces={ENLACES_ALUMNO}
        resumen={false}
        propia
      />

      {/* ── Qué significa cada color ───────────────────────────────────── */}
      <section className="mt-5 grid gap-3 rounded-card bg-white p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold text-ink-900">Cómo se lee</h2>

        <div className="grid gap-2 text-sm font-semibold text-ink-600 sm:grid-cols-2">
          <p>
            <b className="text-ink-900">T</b> es la teoría: verde cuando has leído los{" "}
            {THEORY_STEPS} pasos, naranja si vas por la mitad.
          </p>
          <p>
            Los <b className="text-ink-900">4 cuadrados</b> siguientes son las 4 prácticas de
            programación de esa unidad. Pulsa uno para verla.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:col-span-2">
            <Muestra clase="bg-nivel-bien">igual que la solución</Muestra>
            <Muestra clase="bg-nivel-casi">casi igual</Muestra>
            <Muestra clase="bg-nivel-regular">a medias</Muestra>
            <Muestra clase="bg-nivel-flojo">se parece poco</Muestra>
            <Muestra clase="bg-nivel-nada">sin empezar</Muestra>
          </p>
          <p className="sm:col-span-2">
            Un <b className="text-ink-900">punto blanco</b> dentro del cuadrado quiere decir que la
            tienes guardada pero todavía no has pulsado «Guardar y comprobar».
          </p>
        </div>

        {/* Lo mismo que se le dice al profesor, porque es igual de importante
            que lo sepa quien recibe el color: no es su nota. */}
        <p className="rounded-2xl bg-ink-50 p-4 text-sm font-semibold text-ink-700">
          <b className="text-ink-900">El color de las prácticas no es una nota.</b> Sale de
          comparar tu programa con la solución oficial, bloque a bloque. Un programa distinto que
          funcione —y queremos que los haya— saldrá en naranja, y eso no quiere decir que esté mal.
          Las prácticas de programación no llevan nota: la nota está en la prueba.
        </p>

        <p className="text-sm font-semibold text-ink-600">
          En la columna de la prueba verás la nota sobre 10 cuando tu profesor haya corregido las
          dos programaciones. Mientras falte alguna pone <b className="text-ink-900">—</b> con un{" "}
          <span className="inline-flex items-center gap-1 align-middle">
            <span aria-hidden="true" className="inline-block size-2.5 rounded-full bg-hub-400" />
            punto amarillo
          </span>
          : está entregada y esperando corrección. No se enseña una suma a medias como si fuera tu
          nota.
        </p>
      </section>
    </>
  );
}
