// Catálogo de componentes del set LEGO® Education SPIKE™ Prime (45678): lo
// que hay dentro de la caja del aula y con lo que se monta cada modelo.
//
// Qué es seguro y qué no, dicho sin rodeos:
//  · Los seis componentes electrónicos y cuántos trae la caja: seguro.
//  · Las medidas en módulos (la «M» de LEGO: 3M, 5M, 7M…): seguro, es la
//    forma de medir de Technic, un módulo por agujero.
//  · El color de los ejes por longitud —impares gris claro, pares negro— y
//    el de los pasadores: convenio de LEGO Technic de toda la vida.
//  · El color exacto de cada viga en ESTE set: NO está comprobado. Van en
//    gris claro hasta que alguien mire la caja y lo confirme.
//
// Las cantidades de las piezas de construcción no se declaran a propósito:
// el número exacto de vigas de 7M que trae la caja no lo tengo comprobado, y
// un número inventado en la pantalla de un alumno es peor que ningún número.

export type FamiliaPieza = "electronica" | "estructura" | "transmision" | "union" | "otros";

export interface Pieza {
  id: string;
  nombre: string;
  familia: FamiliaPieza;
  /** Longitud en módulos Technic (agujeros). Las piezas sin medida no lo llevan. */
  modulos?: number;
  /** Cuántas trae la caja, solo donde está comprobado. */
  enLaCaja?: number;
  /** Color con el que se dibuja. */
  color: string;
  /** Una línea para el alumno: qué es o para qué sirve. */
  pista?: string;
}

const GRIS = "#b4bcc2";
const GRIS_OSCURO = "#6b7780";
const NEGRO = "#2c3238";
const AZUL = "#1e72c8";
const AMARILLO = "#f2c500";
const BLANCO = "#eef1f2";

/** Las vigas, por su longitud en módulos. */
const LARGOS_VIGA = [3, 5, 7, 9, 11, 15] as const;

/** Los ejes, por su longitud. En Technic, los impares van en gris y los pares en negro. */
const LARGOS_EJE = [2, 3, 4, 5, 6, 7, 8, 10, 12] as const;

export const PIEZAS: Pieza[] = [
  // ── Electrónica ────────────────────────────────────────────────────
  {
    id: "hub",
    nombre: "Hub Inteligente",
    familia: "electronica",
    enLaCaja: 1,
    color: BLANCO,
    pista: "Seis puertos (A–F), matriz de 5×5, altavoz y giroscopio.",
  },
  {
    id: "bateria",
    nombre: "Batería recargable",
    familia: "electronica",
    enLaCaja: 1,
    color: AMARILLO,
    pista: "Va dentro del Hub. Se carga por el cable USB.",
  },
  {
    id: "motor-grande",
    nombre: "Motor grande",
    familia: "electronica",
    enLaCaja: 2,
    color: BLANCO,
    pista: "El de más fuerza: para mover el robot.",
  },
  {
    id: "motor",
    nombre: "Motor mediano",
    familia: "electronica",
    enLaCaja: 1,
    color: BLANCO,
    pista: "Más pequeño y rápido: para pinzas, brazos y mecanismos.",
  },
  {
    id: "distancia",
    nombre: "Sensor de distancia",
    familia: "electronica",
    enLaCaja: 1,
    color: BLANCO,
    pista: "Mide con ultrasonidos lo que tiene delante, en centímetros.",
  },
  {
    id: "color",
    nombre: "Sensor de color",
    familia: "electronica",
    enLaCaja: 1,
    color: BLANCO,
    pista: "Reconoce el color y mide la luz que rebota.",
  },
  {
    id: "fuerza",
    nombre: "Sensor de fuerza",
    familia: "electronica",
    enLaCaja: 1,
    color: BLANCO,
    pista: "Sabe si lo pulsas y con cuánta fuerza.",
  },

  // ── Estructura ─────────────────────────────────────────────────────
  ...LARGOS_VIGA.map(
    (m): Pieza => ({
      id: `viga-${m}m`,
      nombre: `Viga de ${m}`,
      familia: "estructura",
      modulos: m,
      color: GRIS,
      pista: `${m} agujeros de largo.`,
    }),
  ),
  {
    id: "viga",
    nombre: "Viga",
    familia: "estructura",
    color: GRIS,
    pista: "La que te venga bien por longitud.",
  },
  {
    id: "viga-angulo",
    nombre: "Viga en ángulo",
    familia: "estructura",
    color: GRIS,
    pista: "Para esquinas y refuerzos.",
  },
  {
    id: "panel",
    nombre: "Panel",
    familia: "estructura",
    color: BLANCO,
    pista: "Cierra el robot y le da cara.",
  },

  // ── Transmisión ────────────────────────────────────────────────────
  ...LARGOS_EJE.map(
    (m): Pieza => ({
      id: `eje-${m}m`,
      nombre: `Eje de ${m}`,
      familia: "transmision",
      modulos: m,
      color: m % 2 === 0 ? NEGRO : GRIS,
      pista: `${m} módulos. Los impares son grises y los pares, negros.`,
    }),
  ),
  {
    id: "eje",
    nombre: "Eje",
    familia: "transmision",
    color: GRIS,
    pista: "El que llegue de un lado al otro.",
  },
  {
    id: "rueda",
    nombre: "Rueda con neumático",
    familia: "transmision",
    color: NEGRO,
    pista: "Llanta y goma. Van al motor grande.",
  },
  {
    id: "engranaje",
    nombre: "Engranaje",
    familia: "transmision",
    color: GRIS_OSCURO,
    pista: "Cambia la fuerza por velocidad, o al revés.",
  },

  // ── Unión ──────────────────────────────────────────────────────────
  {
    id: "pasador",
    nombre: "Pasador",
    familia: "union",
    modulos: 2,
    color: NEGRO,
    pista: "El negro agarra; el gris gira suelto.",
  },
  {
    id: "pasador-largo",
    nombre: "Pasador largo",
    familia: "union",
    modulos: 3,
    color: AZUL,
    pista: "Azul, de 3 módulos: une tres piezas.",
  },
  {
    id: "conector",
    nombre: "Conector de eje y pasador",
    familia: "union",
    color: GRIS,
    pista: "Pasa de un eje a un pasador.",
  },
  {
    id: "buje",
    nombre: "Buje",
    familia: "union",
    color: GRIS,
    pista: "Hace de tope en un eje. El amarillo es medio buje.",
  },

  // ── Otros ──────────────────────────────────────────────────────────
  {
    id: "pieza-pequena",
    nombre: "Pieza pequeña",
    familia: "otros",
    color: GRIS,
    pista: "Lo que tengas a mano para rematar el modelo.",
  },
];

const POR_ID = new Map(PIEZAS.map((pieza) => [pieza.id, pieza]));

export function getPieza(id: string): Pieza {
  return POR_ID.get(id) ?? { id, nombre: id, familia: "otros", color: GRIS };
}

export function esPiezaConocida(id: string): boolean {
  return POR_ID.has(id);
}

/** Una pieza de la lista de materiales de una unidad. */
export interface Material {
  pieza: string;
  /** Cuántas hacen falta, cuando el modelo lo dice. */
  cantidad?: number;
  /** Lo que el texto añade: «largo», «para los soportes»… */
  nota?: string;
}

const NUMEROS: Record<string, number> = {
  un: 1,
  una: 1,
  uno: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
};

/** El orden en que se enseñan: primero lo que se enchufa, luego lo que se monta. */
const ORDEN: FamiliaPieza[] = ["electronica", "estructura", "transmision", "union", "otros"];

export function ordenarMateriales(materiales: Material[]): Material[] {
  return [...materiales].sort(
    (a, b) =>
      ORDEN.indexOf(getPieza(a.pieza).familia) - ORDEN.indexOf(getPieza(b.pieza).familia),
  );
}

export { NUMEROS as NUMEROS_ESCRITOS };
