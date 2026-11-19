import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AvisoAlcance } from "@/components/profesor/AvisoAlcance";
import { CourseTabs } from "@/components/profesor/CourseTabs";
import { MatrizSeguimiento } from "@/components/profesor/MatrizSeguimiento";
import { requireRole } from "@/lib/auth";
import { cursoDeLaUrl, getCursosVisibles, getMatrizSeguimiento } from "@/lib/db";
import { firstParam, saludo } from "@/lib/format";
import { COURSE_LABEL, THEORY_STEPS } from "@/lib/types";

export const metadata: Metadata = { title: "Progreso y notas alumnado" };

/** Un cuadradito de la leyenda. */
function Muestra({ clase, children }: { clase: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={`inline-block size-3.5 rounded-[0.2rem] ${clase}`} />
      {children}
    </span>
  );
}

export default async function ProgresoYNotasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // El superadministrador también es docente y puede entrar aquí.
  const session = await requireRole(["profesor", "superadmin"]);

  // Un profesor ve solo los cursos que imparte; el superadministrador, todos.
  const visibles = await getCursosVisibles(session);
  const curso = cursoDeLaUrl(visibles, firstParam((await searchParams).curso));
  const filas = await getMatrizSeguimiento(curso);

  const porCorregir = filas.reduce((total, fila) => total + fila.porCorregir, 0);

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">
        Progreso y notas alumnado
      </h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        {saludo(session)}. Cada fila es un alumno y cada bloque, una unidad: la teoría, las 4
        prácticas de programación y la nota de la prueba. Pulsa una nota para corregir ese examen.
      </p>

      <AvisoAlcance alcance={visibles.alcance} cursos={visibles.cursos} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <CourseTabs basePath="/dashboard/profesor" active={curso} cursos={visibles.cursos} />
        <Link
          href={`/dashboard/profesor/unidades?curso=${curso}`}
          className="rounded-full bg-ink-900 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-ink-700"
        >
          Abrir y cerrar unidades
        </Link>
      </div>

      {porCorregir > 0 ? (
        <p className="mt-4 rounded-card bg-hub-50 p-4 font-bold text-ink-800">
          Tienes {porCorregir}{" "}
          {porCorregir === 1 ? "programación entregada" : "programaciones entregadas"} sin
          corregir en {COURSE_LABEL[curso]}. Están marcadas con un punto amarillo.
        </p>
      ) : null}

      <MatrizSeguimiento filas={filas} curso={curso} />

      {/* ── Qué significa cada color ───────────────────────────────────── */}
      <section className="mt-5 grid gap-3 rounded-card bg-white p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold text-ink-900">Cómo se lee</h2>

        <div className="grid gap-2 text-sm font-semibold text-ink-600 sm:grid-cols-2">
          <p>
            <b className="text-ink-900">T</b> es la teoría: verde cuando ha leído los{" "}
            {THEORY_STEPS} pasos, naranja si va por la mitad.
          </p>
          <p>
            Los <b className="text-ink-900">4 cuadrados</b> siguientes son las 4 prácticas de
            programación de esa unidad.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:col-span-2">
            <Muestra clase="bg-nivel-bien">igual que la solución</Muestra>
            <Muestra clase="bg-nivel-casi">casi igual</Muestra>
            <Muestra clase="bg-nivel-regular">a medias</Muestra>
            <Muestra clase="bg-nivel-flojo">se parece poco</Muestra>
            <Muestra clase="bg-nivel-nada">sin empezar</Muestra>
          </p>
          <p className="sm:col-span-2">
            Un <b className="text-ink-900">punto blanco</b> dentro del cuadrado quiere decir que
            la tiene guardada pero no ha pulsado «Guardar y comprobar» todavía.
          </p>
        </div>

        <p className="rounded-2xl bg-ink-50 p-4 text-sm font-semibold text-ink-700">
          <b className="text-ink-900">El color de las prácticas no es una nota.</b> Sale de
          comparar el programa del alumno con la solución oficial, bloque a bloque y contando la
          sangría. Un programa distinto que funcione —y queremos que los haya— saldrá en naranja.
          Sirve para decidir a quién mirar primero, no para calificar: las prácticas de programación
          no llevan nota. La nota está en la prueba.
        </p>

        <p className="text-sm font-semibold text-ink-600">
          En la columna de la prueba, el{" "}
          <span className="inline-flex items-center gap-1 align-middle">
            <span aria-hidden="true" className="inline-block size-2.5 rounded-full bg-hub-400" />
            punto amarillo
          </span>{" "}
          avisa de que hay una programación entregada esperando tu corrección. Una nota en gris es
          provisional: le falta el test o alguna programación, y no entra en la media.
        </p>
      </section>
    </>
  );
}
