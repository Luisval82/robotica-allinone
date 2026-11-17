// Ficha de un alumno para el profesor y el superadministrador: con qué correo
// entró, cómo se llama (se le puede corregir si puso un nombre falso) y a qué
// curso va (se le puede mover).

import { actualizarAlumnoAction } from "@/actions/profesor";
import { PendingButton } from "@/components/ui/PendingButton";
import { COURSES, COURSE_LABEL, type PublicUser } from "@/lib/types";

export function FichaAlumno({ alumno }: { alumno: PublicUser }) {
  return (
    <form
      action={actualizarAlumnoAction}
      className="grid items-end gap-x-4 gap-y-3 rounded-2xl border-2 border-ink-100 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
    >
      <input type="hidden" name="userId" value={alumno.id} />

      <div className="min-w-0">
        <label
          htmlFor={`nombre-${alumno.id}`}
          className="mb-1 block text-xs font-extrabold uppercase tracking-widest text-ink-500"
        >
          Nombre y apellidos
        </label>
        <input
          id={`nombre-${alumno.id}`}
          name="name"
          type="text"
          defaultValue={alumno.name}
          maxLength={80}
          className="h-11 w-full rounded-xl border-2 border-ink-200 bg-white px-3 font-semibold text-ink-900 transition-colors focus:border-spike-500"
        />
        <p className="mt-1 break-all font-mono text-xs text-ink-500">{alumno.email}</p>
      </div>

      <div>
        <label
          htmlFor={`curso-${alumno.id}`}
          className="mb-1 block text-xs font-extrabold uppercase tracking-widest text-ink-500"
        >
          Curso
        </label>
        <select
          id={`curso-${alumno.id}`}
          name="course"
          defaultValue={alumno.course ?? ""}
          className="h-11 rounded-xl border-2 border-ink-200 bg-white px-3 font-semibold text-ink-900 transition-colors focus:border-spike-500"
        >
          {alumno.course === null ? <option value="">Sin curso</option> : null}
          {COURSES.map((curso) => (
            <option key={curso} value={curso}>
              {COURSE_LABEL[curso]}
            </option>
          ))}
        </select>
      </div>

      <PendingButton pendingLabel="Guardando…">Guardar</PendingButton>
    </form>
  );
}
