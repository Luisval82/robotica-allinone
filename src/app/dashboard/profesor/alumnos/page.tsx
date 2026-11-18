import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { FichaAlumno } from "@/components/profesor/FichaAlumno";
import { COURSE_TONE } from "@/components/profesor/courseTone";
import { requireRole } from "@/lib/auth";
import { listUsers } from "@/lib/db";
import { COURSES, COURSE_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "Fichas del alumnado" };

/**
 * Fichas del alumnado: el correo con el que entró cada uno, su nombre —que se
 * puede corregir si puso uno falso— y su curso, que se puede cambiar.
 */
export default async function FichasPage() {
  const session = await requireRole(["profesor", "superadmin"]);

  const alumnos = (await listUsers()).filter((user) => user.role === "alumno");
  const sinCurso = alumnos.filter((alumno) => alumno.course === null);

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">Fichas del alumnado</h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        Aquí ves con qué correo ha entrado cada alumno. Puedes corregirle el nombre si puso uno
        que no es el suyo, y moverlo de curso si se equivocó al elegir.
      </p>

      {session.role === "superadmin" ? (
        <Link
          href="/dashboard/admin"
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-2xl bg-ink-900 px-5 font-display font-semibold text-white transition hover:bg-ink-700"
        >
          Cambiar el rol de una cuenta
          <ArrowRightIcon className="size-4" />
        </Link>
      ) : (
        <p className="mt-3 font-semibold text-ink-500">
          ¿Ha entrado un compañero docente con su correo del colegio? Aparecerá aquí como alumno
          hasta que el superadministrador le dé el rol de Profesor.
        </p>
      )}

      {sinCurso.length > 0 ? (
        <section className="mt-8 overflow-hidden rounded-card bg-white shadow-card">
          <div className="bg-hub-400 px-6 py-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900">
              Sin curso todavía
              <span className="ml-3 text-base font-semibold opacity-80">{sinCurso.length}</span>
            </h2>
            <p className="mt-1 font-semibold text-ink-800">
              Han entrado con su cuenta del colegio pero no han terminado de decir quiénes son.
            </p>
          </div>
          <div className="grid gap-3 p-5">
            {sinCurso.map((alumno) => (
              <FichaAlumno key={alumno.id} alumno={alumno} />
            ))}
          </div>
        </section>
      ) : null}

      {COURSES.map((course) => {
        const delCurso = alumnos.filter((alumno) => alumno.course === course);
        return (
          <section
            key={course}
            aria-labelledby={`fichas-${course}`}
            className="mt-8 overflow-hidden rounded-card bg-white shadow-card"
          >
            <div className={`px-6 py-4 ${COURSE_TONE[course]}`}>
              <h2 id={`fichas-${course}`} className="font-display text-2xl font-semibold">
                {COURSE_LABEL[course]}
                <span className="ml-3 text-base font-semibold opacity-90">
                  {delCurso.length} {delCurso.length === 1 ? "alumno" : "alumnos"}
                </span>
              </h2>
            </div>

            {delCurso.length === 0 ? (
              <p className="p-6 font-semibold text-ink-500">
                Todavía no ha entrado nadie de este curso.
              </p>
            ) : (
              <div className="grid gap-3 p-5">
                {delCurso.map((alumno) => (
                  <FichaAlumno key={alumno.id} alumno={alumno} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
