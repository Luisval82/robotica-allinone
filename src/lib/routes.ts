// Mapa de rutas por rol. Lo usan el proxy (src/proxy.ts), las acciones de
// login/registro y las propias páginas, para que la regla viva en un solo sitio.

import type { Course, Role } from "@/lib/types";

export const LOGIN_PATH = "/login";
export const REGISTER_PATH = "/registro";

/** Primera entrada: el alumno dice su nombre y elige curso. */
export const BIENVENIDA_PATH = "/bienvenida";

/**
 * ¿Hay que llevarle a la pantalla de bienvenida?
 *
 * Solo al ALUMNO que todavía no ha dicho a qué curso va. Un profesor o un
 * superadministrador que entra con la cuenta del colegio nunca pasa por ahí:
 * va directo a su panel con su rol, sin elegir curso ni crearle perfil de
 * alumno. La regla vive aquí para que la usen igual la vuelta de Google, el
 * marco del panel y la propia pantalla de bienvenida.
 */
export function necesitaPerfil(user: { role: Role; course: Course | null }): boolean {
  return user.role === "alumno" && user.course === null;
}

/** Renueva la cookie cuando el rol guardado en ella ya no coincide con la base de datos. */
export const REFRESH_SESSION_PATH = "/sesion/actualizar";

/** Panel al que se envía a cada rol justo después de iniciar sesión. */
export const ROLE_HOME: Record<Role, string> = {
  superadmin: "/dashboard/admin",
  profesor: "/dashboard/profesor",
  alumno: "/dashboard/alumno",
};

/**
 * Qué roles pueden entrar en cada zona.
 * El superadministrador también es docente, así que entra al panel de profesor.
 */
const AREAS: ReadonlyArray<{ prefix: string; roles: readonly Role[] }> = [
  { prefix: "/dashboard/admin", roles: ["superadmin"] },
  { prefix: "/dashboard/profesor", roles: ["profesor", "superadmin"] },
  { prefix: "/dashboard/alumno", roles: ["alumno"] },
];

export function isDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function isAuthPath(pathname: string): boolean {
  return pathname === LOGIN_PATH || pathname === REGISTER_PATH;
}

/** ¿Puede este rol ver esta ruta? Las rutas fuera de las zonas no se restringen aquí. */
export function canAccess(role: Role, pathname: string): boolean {
  const area = AREAS.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return area ? area.roles.includes(role) : true;
}
