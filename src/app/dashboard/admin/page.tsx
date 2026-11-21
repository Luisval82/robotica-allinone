import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PanelCuentas } from "@/components/admin/PanelCuentas";
import type { CuentaEnLista } from "@/components/admin/FilaCuenta";
import { requireRole } from "@/lib/auth";
import { getAnioActivo, getCursosDeDocentes, listUsers } from "@/lib/db";
import { saludo } from "@/lib/format";
import { ROLES } from "@/lib/types";

export const metadata: Metadata = { title: "Gestión de usuarios" };

/**
 * Panel de superadministración: las cuentas del centro, su rol, sus cursos y
 * su estado, en un listado de una línea por cuenta.
 *
 * Esta página solo recoge datos y comprueba el rol. Quien filtra y quien
 * pinta cada fila son PanelCuentas y FilaCuenta, en el navegador, para que
 * buscar y filtrar se note al instante.
 */
export default async function AdminDashboardPage() {
  // Única puerta: solo superadministrador. Cada acción del panel lo vuelve a
  // comprobar por su cuenta, porque un formulario se puede enviar a mano.
  const session = await requireRole(["superadmin"]);

  const fecha = new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeZone: "Europe/Madrid" });

  const [users, anio, cursosPorDocente] = await Promise.all([
    listUsers(),
    getAnioActivo(),
    getCursosDeDocentes(),
  ]);

  // Cuántos superadministradores ACTIVOS hay: con uno solo, su fila se
  // bloquea para que nadie se quede fuera de la plataforma.
  const superadminsActivos = users.filter(
    (user) => user.role === "superadmin" && user.activa,
  ).length;

  // Orden: superadministradores, profesores y alumnos; dentro de cada rol, por
  // nombre. Es el orden en el que se busca a alguien cuando hay muchos.
  const cuentas: CuentaEnLista[] = users
    .slice()
    .sort(
      (a, b) =>
        ROLES.indexOf(a.role) - ROLES.indexOf(b.role) || a.name.localeCompare(b.name, "es"),
    )
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      course: user.course,
      activa: user.activa,
      cursos: cursosPorDocente.get(user.id) ?? [],
      conGoogle: user.googleSub !== null,
      perfilCompleto: user.perfilCompleto,
      // Formateada aquí: hacerlo en el navegador puede dar un texto distinto
      // al del HTML del servidor y romper la hidratación.
      creadaEn: fecha.format(new Date(user.createdAt)),
      esTuCuenta: user.id === session.id,
      esUnicoSuperadminActivo:
        user.role === "superadmin" && user.activa && superadminsActivos <= 1,
    }));

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">Gestión de usuarios</h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        {saludo(session)}. Quien entra con la cuenta del colegio empieza como alumno, así que
        cuando llega un compañero docente aparece aquí como alumno y basta con pasarlo a Profesor
        y marcarle sus cursos. El cambio se aplica al momento, aunque tenga la sesión abierta.
      </p>
      <p className="mt-2 max-w-3xl font-semibold text-ink-500">
        Las asignaciones de curso son de este año ({anio}). En su panel, cada docente ve solo el
        alumnado y las entregas de los cursos que tenga marcados; sin ninguno marcado los ve
        todos, con un aviso. Tú lo ves todo siempre.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/dashboard/profesor/alumnos"
          className="inline-flex h-11 items-center gap-2 rounded-2xl border-2 border-ink-200 bg-white px-5 font-display font-semibold text-ink-900 transition hover:border-ink-900"
        >
          Alumnado por cursos
          <ArrowRightIcon className="size-4" />
        </Link>
        <Link
          href="/dashboard/admin/anio"
          className="inline-flex h-11 items-center gap-2 rounded-2xl border-2 border-ink-200 bg-white px-5 font-display font-semibold text-ink-900 transition hover:border-ink-900"
        >
          Año escolar {anio}
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      <PanelCuentas cuentas={cuentas} />
    </>
  );
}
