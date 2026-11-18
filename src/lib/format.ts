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

/**
 * El nombre de pila con el que la plataforma se dirige a cada persona:
 * «Luis Sánchez» → «Luis».
 *
 * Se queda con la primera palabra. Si el nombre viene todo en minúsculas o
 * todo en mayúsculas —como suele llegar de las cuentas del colegio—, lo pone
 * bien: «LUIS» → «Luis». Si ya viene con mayúsculas y minúsculas mezcladas no
 * lo toca, para no estropear un «McCarthy» o un «O'Brien».
 *
 * Con `respaldo` se decide qué poner cuando no hay nombre guardado todavía.
 */
export function firstName(fullName: string | null | undefined, respaldo = ""): string {
  const pila = (fullName ?? "").trim().split(/\s+/)[0] ?? "";
  if (pila === "") return respaldo;
  const mezclado = pila !== pila.toLowerCase() && pila !== pila.toUpperCase();
  return mezclado ? pila : pila.charAt(0).toLocaleUpperCase("es") + pila.slice(1).toLocaleLowerCase("es");
}

/**
 * Último respaldo cuando una cuenta todavía no tiene nombre guardado: lo que
 * va delante de la arroba, presentable. «luis.sanchez@…» → «Luis».
 */
export function nombreDelCorreo(email: string): string {
  const local = email.split("@")[0] ?? "";
  return firstName(local.replace(/[._+-]+/g, " "));
}

/**
 * Cómo saluda la plataforma a quien tiene delante, en cualquier rol:
 * «Hola, Luis». Si todavía no sabemos cómo se llama —cuenta recién creada sin
 * nombre— saluda sin nombre en vez de dejar un «Hola,» colgando.
 */
export function saludo(user: { name: string; email: string }): string {
  const nombre = firstName(user.name) || nombreDelCorreo(user.email);
  return nombre === "" ? "Hola" : `Hola, ${nombre}`;
}

/** Lee ?clave=valor de la URL quedándose con el primer valor. */
export function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/** Lee el curso de la URL; si falta o no es válido, 1º ESO. */
export function parseCourse(value: string): Course {
  return isCourse(value) ? value : "1ESO";
}
