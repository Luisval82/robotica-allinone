"use server";

// Acciones del panel de profesor: interruptores de unidades y pruebas, y corrección de entregas.

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { gradeEntrega, setClassAccess, setStudentAccess } from "@/lib/db";
import { UNIT_NUMBERS, isCourse, type AccessKind, type GradeFormState } from "@/lib/types";

const TEACHER_ROLES = ["profesor", "superadmin"] as const;
const MAX_COMMENT_LENGTH = 1000;

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Interruptor de una unidad o de su PRUEBA UD-X.
 * ambito = "clase"  → vale para todo el curso (interruptor global).
 * ambito = "alumno" → vale solo para ese alumno (interruptor individual).
 */
export async function setAccessAction(formData: FormData): Promise<void> {
  await requireRole(TEACHER_ROLES);

  const ambito = field(formData, "ambito");
  const tipo = field(formData, "tipo");
  const unidad = Number(field(formData, "unidad"));
  const abrir = field(formData, "abrir") === "1";

  if (tipo !== "unidad" && tipo !== "prueba") return;
  if (!(UNIT_NUMBERS as readonly number[]).includes(unidad)) return;
  const kind: AccessKind = tipo;

  if (ambito === "clase") {
    const curso = field(formData, "curso");
    if (!isCourse(curso)) return;
    await setClassAccess(curso, unidad, kind, abrir);
  } else if (ambito === "alumno") {
    const alumnoId = field(formData, "alumnoId");
    if (alumnoId === "") return;
    await setStudentAccess(alumnoId, unidad, kind, abrir);
  } else {
    return;
  }

  // El cambio se ve al momento en el panel del profesor y en el del alumno.
  revalidatePath("/dashboard", "layout");
}

/** Guarda la nota (0–10) y el comentario del profesor en una entrega. */
export async function gradeEntregaAction(
  _previous: GradeFormState,
  formData: FormData,
): Promise<GradeFormState> {
  const session = await requireRole(TEACHER_ROLES);

  const entregaId = field(formData, "entregaId");
  const notaTexto = field(formData, "nota").trim().replace(",", ".");
  const comentario = field(formData, "comentario").trim();

  const nota = Number(notaTexto);
  if (notaTexto === "" || !Number.isFinite(nota) || nota < 0 || nota > 10) {
    return { error: "Escribe una nota entre 0 y 10." };
  }
  if (comentario.length > MAX_COMMENT_LENGTH) {
    return { error: `El comentario no puede pasar de ${MAX_COMMENT_LENGTH} caracteres.` };
  }

  const saved = await gradeEntrega(entregaId, {
    nota: Math.round(nota * 100) / 100,
    comentario,
    profesor: session.name,
  });
  if (!saved) return { error: "No se ha encontrado la entrega. Recarga la página." };

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
