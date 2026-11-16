// Un color de categoría de bloques para cada una de las 9 unidades.
// Se usa en las tarjetas del panel del alumno y en la cabecera de cada unidad.

const UNIT_TONES = [
  "bg-block-eventos",
  "bg-block-motores",
  "bg-block-movimiento",
  "bg-block-control",
  "bg-block-sensores",
  "bg-block-luz",
  "bg-block-sonido",
  "bg-block-operadores",
  "bg-block-variables",
];

export function unitTone(numero: number): string {
  return `${UNIT_TONES[(numero - 1) % UNIT_TONES.length]} text-ink-900`;
}
