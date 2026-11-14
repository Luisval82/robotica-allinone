import type { Metadata } from "next";
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
  await requireRole(["superadmin"]);
  const users = await listUsers();

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">Gestión de usuarios</h1>
      <p className="mt-2 text-lg font-semibold text-ink-500">
        Todas las cuentas de la plataforma. Quien se registra entra como alumno.
      </p>

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
        <table className="w-full min-w-[40rem] text-left">
          <caption className="sr-only">Usuarios registrados</caption>
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
                <td className="px-6 py-4 font-semibold text-ink-700">
                  {user.course ? COURSE_LABEL[user.course] : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 rounded-card border-2 border-dashed border-ink-300 p-6 font-semibold text-ink-600">
        Aquí se añadirán los botones para dar o quitar el rol de Profesor a cada cuenta.
      </p>
    </>
  );
}
