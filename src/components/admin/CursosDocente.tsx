// Qué cursos imparte un docente este año académico. Casillas, no desplegable:
// casi siempre son varios, y así se ven todos de un vistazo.

import { setCursosDocenteAction } from "@/actions/admin";
import { PendingButton } from "@/components/ui/PendingButton";
import { COURSES, COURSE_LABEL, type Course, type PublicUser } from "@/lib/types";

export function CursosDocente({
  docente,
  asignados,
}: {
  docente: PublicUser;
  asignados: Course[];
}) {
  return (
    <form action={setCursosDocenteAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="docenteId" value={docente.id} />

      <fieldset className="flex flex-wrap items-center gap-1.5">
        <legend className="sr-only">Cursos que imparte {docente.name}</legend>
        {COURSES.map((course) => (
          <label
            key={course}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-ink-200 bg-white px-2.5 py-1.5 text-sm font-bold text-ink-800 transition-colors has-checked:border-spike-500 has-checked:bg-spike-50 has-checked:text-spike-800"
          >
            <input
              type="checkbox"
              name="cursos"
              value={course}
              defaultChecked={asignados.includes(course)}
              className="size-4 accent-spike-600"
            />
            {COURSE_LABEL[course]}
          </label>
        ))}
      </fieldset>

      <PendingButton tone="neutral" pendingLabel="Guardando…">
        Guardar cursos
      </PendingButton>
    </form>
  );
}
