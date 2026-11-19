// Cuánto se parece el programa de un alumno a la solución oficial.
//
// Para qué: en la matriz de seguimiento, el profesor necesita ver de un
// vistazo cómo va cada alumno en las 4 prácticas de cada unidad. Saber solo
// si están guardadas no dice nada: lo que quiere saber es si están bien.
//
// QUÉ NO ES ESTO: no es una nota, y la pantalla lo dice. Es una comparación
// mecánica con UNA solución, la oficial. Un programa distinto y correcto
// —que los hay, y además es lo que queremos que pase— saldrá en naranja. El
// cuadrado sirve para decidir a quién mirar primero, no para calificar.
//
// Cómo se mide, en dos partes:
//
//  · La estructura: qué bloques hay, en qué orden y a qué nivel de sangría.
//    Se busca la subsecuencia común más larga entre los dos programas, que
//    es tolerante con un bloque de más o de menos pero no con tenerlo todo
//    cambiado de sitio. Meter una acción dentro de un bucle o dejarla fuera
//    es un programa distinto, así que la sangría cuenta.
//
//  · Los valores: los huecos de los bloques que sí coinciden —el puerto, los
//    segundos, el color—. Pesan menos a propósito: equivocarse en «2
//    segundos» en lugar de «3» es un desliz; montar la secuencia al revés,
//    no.
//
// La fórmula es estructura^1,5 × (0,6 + 0,4 × valores), y no una media de
// las dos. Elevar la estructura castiga de más los programas que solo se
// parecen de lejos, que es justo el problema: las prácticas de una misma
// unidad comparten bloques, así que con una media ponderada el programa de
// OTRA práctica salía verde claro una de cada cuatro veces. Medido sobre las
// 108 soluciones oficiales, con esta fórmula pasa una de cada nueve, y a
// cambio un cambio de orden cae a 0,76 —naranja—, que es donde debe estar un
// error de lógica.

import type { ProgramRow } from "@/lib/types";

/** Lo bien que ha salido una práctica, para pintar el cuadrado. */
export type Nivel = "bien" | "casi" | "regular" | "flojo" | "sin-hacer";

/** La identidad de un bloque: qué es y dónde está. */
function claveDe(fila: ProgramRow): string {
  return `${fila.nivel}|${fila.texto.trim().toLowerCase()}`;
}

/** Lo que el alumno ha escrito en los huecos de ese bloque. */
function valoresDe(fila: ProgramRow): string[] {
  if (fila.valores && fila.valores.length > 0) {
    return fila.valores.map((v) => String(v ?? "").trim());
  }
  return fila.valor === undefined ? [] : [String(fila.valor).trim()];
}

/** «2» y «2.0» son el mismo valor; «Rojo» y «rojo», también. */
function mismoValor(a: string | undefined, b: string | undefined): boolean {
  const x = (a ?? "").trim();
  const y = (b ?? "").trim();
  if (x === "" && y === "") return true;
  const nx = Number(x.replace(",", "."));
  const ny = Number(y.replace(",", "."));
  if (Number.isFinite(nx) && Number.isFinite(ny)) return nx === ny;
  return x.localeCompare(y, "es", { sensitivity: "base" }) === 0;
}

/** Los pares de bloques que coinciden, en orden: la subsecuencia común más larga. */
function paresComunes(a: string[], b: string[]): [number, number][] {
  const tabla: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      tabla[i][j] =
        a[i] === b[j] ? tabla[i + 1][j + 1] + 1 : Math.max(tabla[i + 1][j], tabla[i][j + 1]);
    }
  }

  const pares: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pares.push([i, j]);
      i += 1;
      j += 1;
    } else if (tabla[i + 1][j] >= tabla[i][j + 1]) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return pares;
}

/**
 * De 0 a 1. 1 es clavado a la solución oficial.
 *
 * Un programa vacío da 0 aunque la solución también lo esté: si no hay nada
 * montado, no hay nada que haya salido bien.
 */
export function parecidoDeProgramas(
  alumno: ProgramRow[],
  solucion: ProgramRow[],
): number {
  if (alumno.length === 0 || solucion.length === 0) return 0;

  const pares = paresComunes(alumno.map(claveDe), solucion.map(claveDe));
  const estructura = (2 * pares.length) / (alumno.length + solucion.length);

  let huecos = 0;
  let acertados = 0;
  for (const [i, j] of pares) {
    const suyos = valoresDe(alumno[i]);
    const buenos = valoresDe(solucion[j]);
    const cuantos = Math.max(suyos.length, buenos.length);
    huecos += cuantos;
    for (let k = 0; k < cuantos; k += 1) {
      if (mismoValor(suyos[k], buenos[k])) acertados += 1;
    }
  }
  // Un programa sin huecos que rellenar no pierde puntos por ello.
  const valores = huecos === 0 ? 1 : acertados / huecos;

  return Math.round(Math.pow(estructura, 1.5) * (0.6 + 0.4 * valores) * 1000) / 1000;
}

/**
 * El color del cuadrado.
 *
 * Los cortes están puestos para que «bien» signifique clavado: un solo valor
 * cambiado deja el programa en 0,93, que es «casi», y un bloque de menos en
 * 0,87. Más vale que el profesor mire de más a que un programa a medias pase
 * por bueno.
 */
export function nivelDeParecido(parecido: number | null): Nivel {
  if (parecido === null) return "sin-hacer";
  if (parecido >= 0.97) return "bien";
  if (parecido >= 0.8) return "casi";
  if (parecido >= 0.5) return "regular";
  return "flojo";
}
