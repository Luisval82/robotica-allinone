// Tipos compartidos por toda la plataforma (servidor y cliente).

export const ROLES = ["superadmin", "profesor", "alumno"] as const;
export type Role = (typeof ROLES)[number];

export const COURSES = ["1ESO", "2ESO", "3ESO"] as const;
export type Course = (typeof COURSES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  superadmin: "Superadmin",
  profesor: "Profesor",
  alumno: "Alumno",
};

export const COURSE_LABEL: Record<Course, string> = {
  "1ESO": "1º ESO",
  "2ESO": "2º ESO",
  "3ESO": "3º ESO",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isCourse(value: unknown): value is Course {
  return typeof value === "string" && (COURSES as readonly string[]).includes(value);
}

/** Usuario tal y como se guarda en la base de datos (nunca se envía al navegador). */
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  /** Solo los alumnos tienen curso; superadmin y profesor llevan null. */
  course: Course | null;
  createdAt: string;
}

/** Usuario sin datos sensibles: lo que sí puede mostrarse en pantalla. */
export type PublicUser = Omit<User, "passwordHash">;

/** Datos mínimos de quien ha iniciado sesión (van dentro de la cookie firmada). */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  course: Course | null;
}

/** Usuario de prueba que se enseña en la pantalla de login. */
export interface DemoCredential {
  name: string;
  email: string;
  password: string;
  role: Role;
  course: Course | null;
}

/** Unidad didáctica del temario (src/data/unidades.json). */
export interface Unidad {
  curso: Course;
  numero: number;
  titulo: string;
  hardware: string;
  modelo: string;
}
