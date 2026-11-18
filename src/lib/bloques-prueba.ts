// Prueba de Blockly de verdad: los bloques, la caja de herramientas y los
// generadores de código de la ruta /bloques.
//
// Esto NO toca el editor de las unidades (src/components/unidad/EditorBloques.tsx).
// Aquel dibuja los bloques de palabras de SPIKE a partir del catálogo del
// curso y sirve para que el alumno entregue un programa; este es un banco de
// pruebas con los bloques reales de Google Blockly —los que se encastran, se
// duplican, se tiran a la papelera y generan código— para ver si ese camino
// nos sirve. Por eso van en archivos distintos y con nombres distintos: si
// mañana se tira esta prueba, se borra sin tocar nada de lo que ya funciona.
//
// Aquí no se importa Blockly: este módulo es solo datos y funciones que
// reciben lo que necesitan. Así la ruta puede cargar Blockly en el navegador
// y el servidor no lo ve nunca.

/** Los colores de las categorías, de la paleta de SPIKE. */
export const COLOR = {
  eventos: "#f2c500",
  robotica: "#1e72c8",
  bucles: "#0fbd8c",
  logica: "#4c97ff",
  matematicas: "#9966ff",
} as const;

/**
 * Los bloques que no trae Blockly. Son tres:
 *
 *  · «al empezar», porque Blockly de serie NO tiene categoría de eventos
 *    (eso es de Scratch). Es un sombrero: nada se le engancha por arriba.
 *  · «mover motor», que es una acción y por eso se apila.
 *  · «distancia», que devuelve un número y por eso tiene forma de pieza que
 *    encaja dentro de otra, no de bloque apilable.
 */
export const BLOQUES_ROBOTICA = [
  {
    type: "robotica_al_empezar",
    message0: "▶ al empezar",
    nextStatement: null,
    colour: COLOR.eventos,
    hat: "cap",
    tooltip: "Por aquí empieza el programa. Engancha debajo lo que tenga que hacer.",
  },
  {
    type: "robotica_mover_motor",
    message0: "girar motor %1 al %2 %% durante %3 s",
    args0: [
      {
        type: "field_dropdown",
        name: "MOTOR",
        options: [
          ["A", "A"],
          ["B", "B"],
          ["C", "C"],
          ["D", "D"],
          ["E", "E"],
          ["F", "F"],
        ],
      },
      { type: "input_value", name: "VELOCIDAD", check: "Number" },
      { type: "input_value", name: "SEGUNDOS", check: "Number" },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: COLOR.robotica,
    tooltip: "Mueve el motor del puerto elegido. La velocidad va de -100 a 100.",
  },
  {
    type: "robotica_sensor_distancia",
    message0: "distancia (cm)",
    output: "Number",
    colour: COLOR.robotica,
    tooltip: "Lo que mide el sensor de distancia ahora mismo, en centímetros.",
  },
];

/** La caja de herramientas: las cuatro categorías de Blockly más la nuestra. */
export const CAJA_DE_HERRAMIENTAS = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Eventos",
      colour: COLOR.eventos,
      contents: [{ kind: "block", type: "robotica_al_empezar" }],
    },
    {
      kind: "category",
      name: "Robótica",
      colour: COLOR.robotica,
      contents: [
        {
          kind: "block",
          type: "robotica_mover_motor",
          inputs: {
            VELOCIDAD: { shadow: { type: "math_number", fields: { NUM: 50 } } },
            SEGUNDOS: { shadow: { type: "math_number", fields: { NUM: 1 } } },
          },
        },
        { kind: "block", type: "robotica_sensor_distancia" },
      ],
    },
    {
      kind: "category",
      name: "Bucles",
      colour: COLOR.bucles,
      contents: [
        {
          kind: "block",
          type: "controls_repeat_ext",
          inputs: { TIMES: { shadow: { type: "math_number", fields: { NUM: 4 } } } },
        },
        { kind: "block", type: "controls_whileUntil" },
      ],
    },
    {
      kind: "category",
      name: "Lógica",
      colour: COLOR.logica,
      contents: [
        { kind: "block", type: "controls_if" },
        {
          kind: "block",
          type: "logic_compare",
          inputs: {
            B: { shadow: { type: "math_number", fields: { NUM: 20 } } },
          },
        },
        { kind: "block", type: "logic_operation" },
        { kind: "block", type: "logic_negate" },
        { kind: "block", type: "logic_boolean" },
      ],
    },
    {
      kind: "category",
      name: "Matemáticas",
      colour: COLOR.matematicas,
      contents: [
        { kind: "block", type: "math_number", fields: { NUM: 10 } },
        {
          kind: "block",
          type: "math_arithmetic",
          inputs: {
            A: { shadow: { type: "math_number", fields: { NUM: 1 } } },
            B: { shadow: { type: "math_number", fields: { NUM: 1 } } },
          },
        },
        {
          kind: "block",
          type: "math_random_int",
          inputs: {
            FROM: { shadow: { type: "math_number", fields: { NUM: 1 } } },
            TO: { shadow: { type: "math_number", fields: { NUM: 100 } } },
          },
        },
      ],
    },
  ],
};

/** Un programa de ejemplo para que la mesa no empiece vacía. */
export const PROGRAMA_DE_EJEMPLO = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: "robotica_al_empezar",
        x: 60,
        y: 50,
        next: {
          block: {
            type: "controls_repeat_ext",
            inputs: {
              TIMES: { shadow: { type: "math_number", fields: { NUM: 3 } } },
              DO: {
                block: {
                  type: "controls_if",
                  inputs: {
                    IF0: {
                      block: {
                        type: "logic_compare",
                        fields: { OP: "LT" },
                        inputs: {
                          A: { block: { type: "robotica_sensor_distancia" } },
                          B: { shadow: { type: "math_number", fields: { NUM: 20 } } },
                        },
                      },
                    },
                    DO0: {
                      block: {
                        type: "robotica_mover_motor",
                        fields: { MOTOR: "A" },
                        inputs: {
                          VELOCIDAD: { shadow: { type: "math_number", fields: { NUM: -40 } } },
                          SEGUNDOS: { shadow: { type: "math_number", fields: { NUM: 1 } } },
                        },
                      },
                    },
                  },
                  next: {
                    block: {
                      type: "robotica_mover_motor",
                      fields: { MOTOR: "B" },
                      inputs: {
                        VELOCIDAD: { shadow: { type: "math_number", fields: { NUM: 60 } } },
                        SEGUNDOS: { shadow: { type: "math_number", fields: { NUM: 2 } } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
};

/** Lo que el programa generado puede pedirle al robot. */
export type Accion =
  | { tipo: "motor"; motor: string; velocidad: number; segundos: number }
  | { tipo: "mide"; valor: number };

/**
 * Registra en el generador de JavaScript cómo se traduce cada bloque nuestro.
 *
 * Los bloques de Blockly ya saben traducirse solos; estos tres no, porque son
 * nuestros. El código que sale llama a `motor(...)` y a `distancia()`, dos
 * funciones que pone el simulador: así el programa del alumno no toca nada
 * del navegador, solo apunta lo que quiere hacer.
 */
export function registrarGeneradores(
  generador: { forBlock: Record<string, unknown> },
  orden: { NONE: number; FUNCTION_CALL: number },
): void {
  // El sombrero no genera nada: lo que cuenta es lo que lleva enganchado,
  // y de eso ya se encarga Blockly al recorrer la pila.
  generador.forBlock.robotica_al_empezar = () => "";

  generador.forBlock.robotica_mover_motor = (
    bloque: { getFieldValue(n: string): unknown },
    gen: { valueToCode(b: unknown, n: string, o: number): string },
  ) => {
    const motor = String(bloque.getFieldValue("MOTOR") ?? "A");
    const velocidad = gen.valueToCode(bloque, "VELOCIDAD", orden.NONE) || "0";
    const segundos = gen.valueToCode(bloque, "SEGUNDOS", orden.NONE) || "0";
    return `motor(${JSON.stringify(motor)}, ${velocidad}, ${segundos});\n`;
  };

  generador.forBlock.robotica_sensor_distancia = () => ["distancia()", orden.FUNCTION_CALL];
}
