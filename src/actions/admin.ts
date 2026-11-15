"use server";

// Acciones del superadministrador: dar o quitar el rol de Profesor.

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { setProfesorRole } from "@/lib/db";
import { isCourse } from "@/lib/types";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function setProfesorRoleAction(formData: FormData): Promise<void> {
  // Solo el superadministrador puede cambiar roles (se comprueba en el servidor).
  await requireRole(["superadmin"]);

  const userId = field(formData, "userId");
  const accion = field(formData, "accion");
  const course = field(formData, "course");
  if (userId === "" || (accion !== "asignar" && accion !== "revocar")) return;

  await setProfesorRole(userId, accion === "asignar", isCourse(course) ? course : undefined);
  revalidatePath("/dashboard", "layout");
}
