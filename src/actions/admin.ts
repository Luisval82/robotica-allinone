"use server";

// Acciones del superadministrador: el rol de cada cuenta, los cursos que
// imparte cada docente y el cierre de año escolar.

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { cerrarAnioAcademico, getAnioActivo, setCursosDocente, setUserRole } from "@/lib/db";
import { COURSES, isCourse, isRole, isUuid, type CierreFormState, type Course } from "@/lib/types";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Pasa una cuenta a Alumno, Profesor o Superadministrador.
 *
 * Solo el superadministrador puede hacerlo, y se comprueba en el servidor: no
 * basta con que el selector no aparezca en pantalla. Los dos casos que la base
 * de datos rechaza —cambiarse el rol a uno mismo y dejar la plataforma sin
 * ningún superadministrador— ya no se ofrecen en la tabla, así que aquí basta
 * con no hacer nada.
 */
export async function setUserRoleAction(formData: FormData): Promise<void> {
  const session = await requireRole(["superadmin"]);

  const userId = field(formData, "userId");
  const role = field(formData, "role");
  const course = field(formData, "course");
  if (!isUuid(userId) || !isRole(role)) return;

  await setUserRole(userId, role, {
    actorId: session.id,
    fallbackCourse: isCourse(course) ? course : undefined,
  });

  // El cambio se nota al momento, incluso si esa persona tiene la sesión
  // abierta: al entrar en cualquier panel se le renueva la cookie.
  revalidatePath("/dashboard", "layout");
}

/** Guarda los cursos que imparte un docente este año académico. */
export async function setCursosDocenteAction(formData: FormData): Promise<void> {
  await requireRole(["superadmin"]);

  const docenteId = field(formData, "docenteId");
  if (!isUuid(docenteId)) return;

  // Las casillas marcadas llegan todas con el mismo nombre.
  const marcados = formData.getAll("cursos").filter((valor): valor is string => typeof valor === "string");
  const cursos: Course[] = COURSES.filter((course) => marcados.includes(course));

  await setCursosDocente(docenteId, cursos);
  revalidatePath("/dashboard", "layout");
}

/**
 * Cierra el año escolar y abre el siguiente.
 *
 * Es la operación más delicada de la plataforma, así que pide dos cosas: el
 * año nuevo y, escrito a mano, el año que se cierra. Si lo escrito no coincide
 * con el año activo, no se toca nada.
 */
export async function cerrarAnioAction(
  _previous: CierreFormState,
  formData: FormData,
): Promise<CierreFormState> {
  await requireRole(["superadmin"]);

  const activo = await getAnioActivo();
  const confirmacion = field(formData, "confirmacion").trim();
  const anioNuevo = field(formData, "anioNuevo").trim();
  const copiar = field(formData, "copiarDocentes") === "1";

  if (confirmacion !== activo) {
    return { error: `Para cerrarlo tienes que escribir «${activo}» tal cual.` };
  }
  if (!/^\d{4}-\d{4}$/.test(anioNuevo)) {
    return { error: "El año nuevo se escribe así: 2027-2028." };
  }
  if (anioNuevo === activo) {
    return { error: `${anioNuevo} es el año que estás cerrando. Escribe el siguiente.` };
  }

  try {
    const cierre = await cerrarAnioAcademico(anioNuevo, { copiarAsignacionesDocentes: copiar });
    revalidatePath("/dashboard", "layout");
    return { cierre };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `No se ha podido cerrar el año: ${error.message}`
          : "No se ha podido cerrar el año.",
    };
  }
}
