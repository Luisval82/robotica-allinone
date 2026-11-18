"use server";

// Acciones del superadministrador: cambiar el rol de cualquier cuenta.

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { setUserRole } from "@/lib/db";
import { isCourse, isRole, isUuid } from "@/lib/types";

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
