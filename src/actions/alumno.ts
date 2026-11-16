"use server";

// Acciones del alumno dentro de una unidad: terminar un paso de teoría,
// entregar el test y entregar un programa de bloques.
//
// Todo se comprueba en el servidor: que quien llama es alumno, que la unidad
// está abierta para él y, en la PRUEBA, que la tiene desbloqueada.

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getPracticasForStudent, getTestForStudent, gradeTest } from "@/lib/contenido";
import { completeTheoryStep, getStudentAccess, saveEntrega, saveTestResult } from "@/lib/db";
import { getAllowedBlocks } from "@/lib/paleta";
import {
  UNIT_NUMBERS,
  type Course,
  type ProgramRow,
  type StudentFormState,
  type StudentUnitAccess,
} from "@/lib/types";

const MAX_ROWS = 40;
const MAX_LEVEL = 5;
const MAX_VALUE_LENGTH = 60;
const MAX_EXPLANATION_LENGTH = 500;

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

interface UnitContext {
  alumnoId: string;
  curso: Course;
  unidad: number;
  acceso: StudentUnitAccess;
}

/** Quién llama, de qué unidad se trata y qué tiene abierto. null si algo no cuadra. */
async function loadUnitContext(formData: FormData): Promise<UnitContext | null> {
  const session = await requireRole(["alumno"]);
  const unidad = Number(field(formData, "unidad"));
  if (!session.course || !(UNIT_NUMBERS as readonly number[]).includes(unidad)) return null;

  const accesos = await getStudentAccess({ id: session.id, course: session.course });
  const acceso = accesos.find((item) => item.unidad === unidad);
  if (!acceso || !acceso.abierta) return null;

  return { alumnoId: session.id, curso: session.course, unidad, acceso };
}

/** Botón «He terminado este paso»: abre el contenedor siguiente. */
export async function completeStepAction(formData: FormData): Promise<void> {
  const context = await loadUnitContext(formData);
  if (!context) return;

  await completeTheoryStep(context.alumnoId, context.unidad, Number(field(formData, "paso")));
  revalidatePath("/dashboard", "layout");
}

/**
 * Botón «Entregar» del test. Corrige en el servidor (las respuestas correctas
 * nunca viajan al navegador) y guarda la nota para el profesor. Un solo intento.
 */
export async function submitTestAction(
  _previous: StudentFormState,
  formData: FormData,
): Promise<StudentFormState> {
  const context = await loadUnitContext(formData);
  if (!context) return { error: "Esta unidad no está abierta. Vuelve a tus unidades." };
  if (!context.acceso.pruebaAbierta) {
    return { error: "La PRUEBA de esta unidad está bloqueada. Termina antes los cuatro pasos." };
  }

  const preguntas = getTestForStudent(context.curso, context.unidad);
  if (preguntas.length === 0) return { error: "El test de esta unidad todavía no está disponible." };

  const respuestas: number[] = [];
  let sinResponder = 0;
  preguntas.forEach((pregunta, index) => {
    const texto = field(formData, `p${index}`);
    const elegida = texto === "" ? -1 : Number(texto);
    if (Number.isInteger(elegida) && elegida >= 0 && elegida < pregunta.opciones.length) {
      respuestas.push(elegida);
    } else {
      sinResponder += 1;
    }
  });
  if (sinResponder > 0) {
    return {
      error:
        sinResponder === 1
          ? "Te falta 1 pregunta por responder."
          : `Te faltan ${sinResponder} preguntas por responder.`,
    };
  }

  const aciertos = gradeTest(context.curso, context.unidad, respuestas);
  const saved = await saveTestResult(context.alumnoId, context.unidad, respuestas, aciertos);
  if (!saved) return { error: "Ya habías entregado este test. Recarga la página para ver tu nota." };

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

function parseProgram(raw: string, allowed: Set<string>): ProgramRow[] | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(data) || data.length === 0 || data.length > MAX_ROWS) return null;

  const rows: ProgramRow[] = [];
  for (const item of data) {
    if (typeof item !== "object" || item === null) return null;
    const { texto, valor, nivel } = item as { texto?: unknown; valor?: unknown; nivel?: unknown };
    if (typeof texto !== "string" || !allowed.has(texto)) return null;
    if (typeof nivel !== "number" || !Number.isInteger(nivel) || nivel < 0 || nivel > MAX_LEVEL) {
      return null;
    }
    const value = typeof valor === "string" ? valor.trim().slice(0, MAX_VALUE_LENGTH) : "";
    rows.push(value === "" ? { texto, nivel } : { texto, valor: value, nivel });
  }
  return rows;
}

/** Caja de entrega: guarda el programa de bloques de una de las 2 prácticas. */
export async function submitEntregaAction(
  _previous: StudentFormState,
  formData: FormData,
): Promise<StudentFormState> {
  const context = await loadUnitContext(formData);
  if (!context) return { error: "Esta unidad no está abierta. Vuelve a tus unidades." };
  if (!context.acceso.pruebaAbierta) {
    return { error: "La PRUEBA de esta unidad está bloqueada. Termina antes los cuatro pasos." };
  }

  const numero = Number(field(formData, "practica"));
  const practica = getPracticasForStudent(context.curso, context.unidad).find(
    (item) => item.practica === numero,
  );
  if (!practica) return { error: "Esta práctica todavía no está disponible." };

  const bloques = parseProgram(
    field(formData, "programa"),
    getAllowedBlocks(context.curso, context.unidad),
  );
  if (!bloques) return { error: "Añade al menos un bloque a tu programa antes de entregar." };

  const explicacion = field(formData, "explicacion").trim().slice(0, MAX_EXPLANATION_LENGTH);
  const result = await saveEntrega(context.alumnoId, {
    unidad: context.unidad,
    practica: practica.practica,
    bloques,
    explicacion,
  });
  if (result === "corregida") {
    return { error: "Tu profesor ya ha corregido esta entrega y no se puede cambiar." };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
