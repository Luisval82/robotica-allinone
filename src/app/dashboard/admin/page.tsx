import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { RoleControl } from "@/components/admin/RoleControl";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { requireRole } from "@/lib/auth";
import { listUsers } from "@/lib/db";
import { COURSE_LABEL, ROLES, type Role } from "@/lib/types";

export const metadata: Metadata = { title: "Gestión de usuarios" };

const ROLE_PLURAL: Record<Role, string> = {
  superadmin: "Superadministradores",
  profesor: "Profesores",
  alumno: "Alumnos",
};

export default async function AdminDashboardPage() {
  // Pestaña exclusiva del superadministrador.
  const session = await requireRole(["superadmin"]);

  // Orden: superadministrador, profesores y alumnos; dentro de cada rol, por nombre.
  const users = (await listUsers()).sort(
    (a, b) =>
      ROLES.indexOf(a.role) - ROLES.indexOf(b.role) || a.name.localeCompare(b.name, "es"),
  );
  const superadmins = users.filter((user) => user.role === "superadmin").length;

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">Gestión de usuarios</h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        Quien entra con la cuenta del colegio empieza como alumno. Aquí decides el rol de cada
        cuenta —Alumno, Profesor o Superadministrador—: el cambio se aplica al momento, aunque esa
        persona tenga la sesión abierta. Si entra un compañero docente con su correo del colegio,
        aparecerá en la lista como alumno y basta con pasarlo a Profesor.
      </p>
      <Link
        href="/dashboard/profesor/alumnos"
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-2xl bg-ink-900 px-5 font-display font-semibold text-white transition hover:bg-ink-700"
      >
        Fichas del alumnado
        <ArrowRightIcon className="size-4" />
      </Link>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {ROLES.map((role) => (
          <div key={role} className="rounded-card bg-white p-6 shadow-card">
            <dt className="text-sm font-extrabold uppercase tracking-wide text-ink-500">
              {ROLE_PLURAL[role]}
            </dt>
            <dd className="mt-1 font-display text-5xl font-semibold text-ink-900">
              {users.filter((user) => user.role === role).length}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 overflow-x-auto rounded-card bg-white shadow-card">
        <table className="w-full min-w-[52rem] text-left">
          <caption className="sr-only">Usuarios registrados y su rol</caption>
          <thead>
            <tr className="border-b-2 border-ink-100 text-xs font-extrabold uppercase tracking-wide text-ink-500">
              <th scope="col" className="px-6 py-4">
                Nombre
              </th>
              <th scope="col" className="px-6 py-4">
                Correo
              </th>
              <th scope="col" className="px-6 py-4">
                Rol
              </th>
              <th scope="col" className="px-6 py-4">
                Curso
              </th>
              <th scope="col" className="px-6 py-4">
                Cambiar rol
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-ink-100 last:border-b-0">
                <th scope="row" className="px-6 py-4 font-bold text-ink-900">
                  {user.name}
                </th>
                <td className="px-6 py-4 font-mono text-sm text-ink-700">{user.email}</td>
                <td className="px-6 py-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-semibold text-ink-700">
                  {user.role === "alumno" && user.course ? COURSE_LABEL[user.course] : "—"}
                </td>
                <td className="px-6 py-3">
                  <RoleControl
                    user={user}
                    esTuCuenta={user.id === session.id}
                    esUnicoSuperadmin={user.role === "superadmin" && superadmins <= 1}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
