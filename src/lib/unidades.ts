// Temario: 9 unidades por curso (src/data/unidades.json, generado desde TEMARIO.md).

import data from "@/data/unidades.json";
import type { Course, Unidad } from "@/lib/types";

const unidades = data.unidades as Unidad[];

export function getUnidadesDeCurso(curso: Course): Unidad[] {
  return unidades.filter((unidad) => unidad.curso === curso).sort((a, b) => a.numero - b.numero);
}
