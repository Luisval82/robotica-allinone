// Selector de rol de una cuenta: Alumno, Profesor o Superadministrador.

import { setUserRoleAction } from "@/actions/admin";
import { PendingButton } from "@/components/ui/PendingButton";
import { COURSES, COURSE_LABEL, ROLES, ROLE_LABEL, type PublicUser } from "@/lib/types";

const SELECT_CLASS =
  "h-10 rounded-xl border-2 border-ink-200 bg-white px-2 text-sm font-bold text-ink-900 transition-colors focus:border-spike-500";

export function RoleControl({
  user,
  esTuCuenta,
  esUnicoSuperadmin,
}: {
  user: PublicUser;
  /** La cuenta con la que estás dentro: nadie se cambia el rol a sí mismo. */
  esTuCuenta: boolean;
  /** Si lo quitas, la plataforma se queda sin ningún superadministrador. */
  esUnicoSuperadmin: boolean;
}) {
  if (esTuCuenta) {
    return <span className="text-sm font-semibold text-ink-500">Tu cuenta</span>;
  }

  if (esUnicoSuperadmin) {
    return (
      <span className="text-sm font-semibold text-ink-500">Único superadministrador</span>
    );
  }

  return (
    <form action={setUserRoleAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={user.id} />

      <label className="flex items-center gap-2">
        <span className="sr-only">Rol de {user.name}</span>
        <select name="role" defaultValue={user.role} className={SELECT_CLASS}>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABEL[role]}
            </option>
          ))}
        </select>
      </label>

      {/* Si pasa a alumno y no tiene curso guardado, hay que elegirle uno. */}
      {user.course ? null : (
        <label className="flex items-center gap-2 text-sm font-bold text-ink-600">
          <span>Si es alumno, a</span>
          <select name="course" defaultValue={COURSES[0]} className={SELECT_CLASS}>
            {COURSES.map((course) => (
              <option key={course} value={course}>
                {COURSE_LABEL[course]}
              </option>
            ))}
          </select>
        </label>
      )}

      <PendingButton pendingLabel="Guardando…">Guardar</PendingButton>
    </form>
  );
}
