import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { listUsers } from "@/lib/db";
import { COURSES, COURSE_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "Panel de profesor" };

const COURSE_TONES = [
  "bg-block-sensores text-ink-900",
  "bg-block-luz text-white",
  "bg-block-movimiento text-white",
];

export default async function ProfesorDashboardPage() {
  // El superadministrador también es docente y puede entrar aquí.
  const session = await requireRole(["profesor", "superadmin"]);
  const alumnos = (await listUsers()).filter((user) => user.role === "alumno");

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">Panel de profesor</h1>
      <p className="mt-2 text-lg font-semibold text-ink-500">
        Hola, {session.name.split(" ")[0]}. Este es el alumnado registrado en cada curso.
      </p>

      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {COURSES.map((course, index) => {
          const delCurso = alumnos.filter((alumno) => alumno.course === course);
          return (
            <li key={course} className="overflow-hidden rounded-card bg-white shadow-card">
              <div className={`px-6 py-4 ${COURSE_TONES[index]}`}>
                <h2 className="font-display text-2xl font-semibold">{COURSE_LABEL[course]}</h2>
              </div>
              <div className="p-6">
                <p className="font-display text-5xl font-semibold text-ink-900">
                  {delCurso.length}
                </p>
                <p className="text-sm font-extrabold uppercase tracking-wide text-ink-500">
                  {delCurso.length === 1 ? "alumno registrado" : "alumnos registrados"}
                </p>
                {delCurso.length > 0 ? (
                  <ul className="mt-4 grid gap-1.5 border-t-2 border-ink-100 pt-4">
                    {delCurso.map((alumno) => (
                      <li key={alumno.id} className="truncate text-sm font-semibold text-ink-700">
                        {alumno.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 border-t-2 border-ink-100 pt-4 text-sm font-semibold text-ink-500">
                    Todavía no se ha registrado nadie de este curso.
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 rounded-card border-2 border-dashed border-ink-300 p-6 font-semibold text-ink-600">
        Aquí se añadirán el desbloqueo de unidades (por alumno o por clase) y la corrección de las
        entregas de programación.
      </p>
    </>
  );
}
