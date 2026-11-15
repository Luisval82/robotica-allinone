import { setProfesorRoleAction } from "@/actions/admin";
import { PendingButton } from "@/components/ui/PendingButton";
import { COURSES, COURSE_LABEL, type PublicUser } from "@/lib/types";

/** Botones para dar o quitar el rol de Profesor a una cuenta. */
export function RoleControl({ user }: { user: PublicUser }) {
  if (user.role === "superadmin") {
    return <span className="text-sm font-semibold text-ink-500">Rol fijo</span>;
  }

  if (user.role === "alumno") {
    return (
      <form action={setProfesorRoleAction}>
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="accion" value="asignar" />
        <PendingButton pendingLabel="Guardando…">Dar rol de Profesor</PendingButton>
      </form>
    );
  }

  // Profesor: al quitarle el rol vuelve a ser alumno. Si la cuenta no tenía
  // curso guardado (p. ej. el profesor de prueba), hay que elegirle uno.
  return (
    <form action={setProfesorRoleAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={user.id} />
      <input type="hidden" name="accion" value="revocar" />
      {user.course ? null : (
        <label className="flex items-center gap-2 text-sm font-bold text-ink-600">
          <span>Pasa a</span>
          <select
            name="course"
            defaultValue={COURSES[0]}
            className="h-10 rounded-xl border-2 border-ink-200 bg-white px-2 text-sm font-bold text-ink-900"
          >
            {COURSES.map((course) => (
              <option key={course} value={course}>
                {COURSE_LABEL[course]}
              </option>
            ))}
          </select>
        </label>
      )}
      <PendingButton tone="neutral" pendingLabel="Guardando…">
        Quitar rol de Profesor
      </PendingButton>
    </form>
  );
}
