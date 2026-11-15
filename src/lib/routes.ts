// Mapa de rutas por rol. Lo usan el proxy (src/proxy.ts), las acciones de
// login/registro y las propias páginas, para que la regla viva en un solo sitio.

import type { Role } from "@/lib/types";

export const LOGIN_PATH = "/login";
export const REGISTER_PATH = "/registro";

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
