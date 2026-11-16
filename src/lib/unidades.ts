// Temario: 9 unidades por curso (src/data/unidades.json, generado desde TEMARIO.md)
// y esquema de puertos del Hub, deducido del hardware de cada unidad.

import data from "@/data/unidades.json";
import { COURSES, type Course, type Unidad } from "@/lib/types";

const unidades = data.unidades as Unidad[];

export function getUnidadesDeCurso(curso: Course): Unidad[] {
  return unidades.filter((unidad) => unidad.curso === curso).sort((a, b) => a.numero - b.numero);
}

export function getUnidad(curso: Course, numero: number): Unidad | null {
  return unidades.find((unidad) => unidad.curso === curso && unidad.numero === numero) ?? null;
}

/**
 * Unidades anteriores a una dada, contando también los cursos anteriores:
 * lo que el alumno ya debería haber visto al llegar a ella.
 */
export function getUnidadesAnteriores(curso: Course, numero: number): Unidad[] {
  const cursoIndex = COURSES.indexOf(curso);
  return unidades
    .filter((unidad) => {
      const index = COURSES.indexOf(unidad.curso);
      return index < cursoIndex || (index === cursoIndex && unidad.numero < numero);
    })
    .sort(
      (a, b) => COURSES.indexOf(a.curso) - COURSES.indexOf(b.curso) || a.numero - b.numero,
    );
}

// ── Esquema de puertos ───────────────────────────────────────────────────
//
// Convenio de toda la plataforma, para que los cables vayan siempre igual:
//   · Motores, por orden de aparición: A, B y C.
//   · Sensor de color: D · Sensor de distancia: E · Sensor de fuerza: F.

export type PortLetter = "A" | "B" | "C" | "D" | "E" | "F";
export type DeviceKind = "motor" | "sensor";

export interface PortDevice {
  puerto: PortLetter;
  nombre: string;
  tipo: DeviceKind;
  /** Papel del dispositivo en el modelo: «izquierdo», «dial»… */
  papel?: string;
}

export interface HubSetup {
  /** Lo que la unidad usa del propio Hub: matriz de luces, altavoz, giroscopio… */
  internos: string[];
  dispositivos: PortDevice[];
}

const MOTOR_PORTS: PortLetter[] = ["A", "B", "C"];
const SENSOR_PORT: Record<string, PortLetter> = {
  "sensor de color": "D",
  "sensor de distancia": "E",
  "sensor de fuerza": "F",
};

export const PORT_LETTERS: PortLetter[] = ["A", "B", "C", "D", "E", "F"];

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getHubSetup(unidad: Unidad): HubSetup {
  const [hub, ...partes] = unidad.hardware.split("+").map((parte) => parte.trim());

  const dentro = /\((.+)\)/.exec(hub)?.[1] ?? "";
  const internos = dentro
    .split(/,| y /)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(capitalize);

  const dispositivos: PortDevice[] = [];
  let motores = 0;

  for (const parte of partes) {
    const match = /^(\d+)?\s*([^()]+?)\s*(?:\((.+)\))?$/.exec(parte);
    if (!match) continue;
    const cantidad = match[1] ? Number(match[1]) : 1;
    const nombre = match[2].toLowerCase();
    const papel = match[3];

    if (nombre.startsWith("motor")) {
      const singular = nombre.includes("grande") ? "Motor grande" : "Motor mediano";
      for (let i = 0; i < cantidad; i += 1) {
        const puerto = MOTOR_PORTS[motores];
        if (!puerto) break;
        motores += 1;
        dispositivos.push({
          puerto,
          nombre: singular,
          tipo: "motor",
          papel: papel ?? (cantidad === 2 ? (i === 0 ? "izquierdo" : "derecho") : undefined),
        });
      }
    } else if (SENSOR_PORT[nombre]) {
      dispositivos.push({ puerto: SENSOR_PORT[nombre], nombre: capitalize(nombre), tipo: "sensor", papel });
    }
  }

  return { internos, dispositivos };
}
