// Formato de notas y fechas para mostrarlas en pantalla (es-ES).

import { isCourse, type Course } from "@/lib/types";

const notaFormat = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });

const fechaFormat = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
});

/** 8.75 → "8,75" · null → "—" */
export function formatNota(nota: number | null): string {
  return nota === null ? "—" : notaFormat.format(nota);
}

/** "2026-11-12T10:05:00.000Z" → "12 nov, 11:05" */
export function formatFecha(iso: string): string {
  return fechaFormat.format(new Date(iso));
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0];
}

/** Lee ?clave=valor de la URL quedándose con el primer valor. */
export function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/** Lee el curso de la URL; si falta o no es válido, 1º ESO. */
export function parseCourse(value: string): Course {
  return isCourse(value) ? value : "1ESO";
}
