// Catálogo de componentes del set LEGO® Education SPIKE™ Prime (45678): lo
// que hay dentro de la caja del aula y con lo que se monta cada modelo.
//
// De dónde salen los datos: de la hoja de inventario del set, mirada pieza a
// pieza. Nombres, cantidades, longitudes y COLORES están comprobados ahí, no
// supuestos. Lo que no esté comprobado no se escribe: un número inventado en
// la pantalla de un alumno es peor que ningún número.
//
// Lo más útil de todo para un alumno de ESO es el código de colores: en esta
// caja la viga y el eje se reconocen por el color antes que por contar
// agujeros. «Coge la viga morada» se entiende a la primera; «coge la viga de
// 5» obliga a contar. Por eso cada medida lleva su color de verdad.
//
// Los dibujos son propios (src/components/unidad/PiezasMontaje.tsx): las
// imágenes y las instrucciones oficiales son de LEGO y no se copian aquí.

export type FamiliaPieza = "electronica" | "estructura" | "transmision" | "union" | "otros";

export interface Pieza {
  id: string;
  nombre: string;
  familia: FamiliaPieza;
  /** Longitud en módulos Technic (agujeros). Las piezas sin medida no lo llevan. */
  modulos?: number;
  /** Cuántas trae la caja del set. */
  enLaCaja?: number;
  /** Color con el que se dibuja. */
  color: string;
  /** El color dicho en voz alta: «la morada». Solo donde sirve para buscarla. */
  colorNombre?: string;
  /** Una línea para el alumno: qué es o para qué sirve. */
  pista?: string;
}

// Colores tomados de la propia hoja del set, no elegidos a ojo.
const GRIS = "#b4bcc2";
const GRIS_OSCURO = "#6b7780";
const NEGRO = "#2c3238";
const AZUR = "#4db6d4";
const MORADO = "#9b3a94";
const AMARILLO = "#f2c500";
const ROJO = "#c01722";
const AZUL = "#2a4ea8";
const BLANCO = "#eef1f2";

/** Las vigas de la caja: medida, color y cuántas hay. */
const VIGAS = [
  { modulos: 3, color: AMARILLO, colorNombre: "amarilla", enLaCaja: 6 },
  { modulos: 5, color: MORADO, colorNombre: "morada", enLaCaja: 4 },
  { modulos: 7, color: AZUR, colorNombre: "azul", enLaCaja: 6 },
  { modulos: 9, color: NEGRO, colorNombre: "negra", enLaCaja: 4 },
  { modulos: 11, color: MORADO, colorNombre: "morada", enLaCaja: 4 },
  { modulos: 13, color: AZUR, colorNombre: "azul", enLaCaja: 4 },
  { modulos: 15, color: NEGRO, colorNombre: "negra", enLaCaja: 6 },
] as const;

/** Los ejes de la caja. Aquí el color tampoco es adorno: dice la medida. */
const EJES = [
  { modulos: 2, color: ROJO, colorNombre: "rojo", enLaCaja: 4 },
  { modulos: 3, color: AMARILLO, colorNombre: "amarillo", enLaCaja: 8 },
  { modulos: 4, color: NEGRO, colorNombre: "negro", enLaCaja: 4 },
  { modulos: 5, color: GRIS, colorNombre: "gris", enLaCaja: 4 },
  { modulos: 7, color: AMARILLO, colorNombre: "amarillo", enLaCaja: 4 },
  { modulos: 8, color: NEGRO, colorNombre: "negro", enLaCaja: 4 },
  { modulos: 9, color: GRIS, colorNombre: "gris", enLaCaja: 4 },
  { modulos: 11, color: AMARILLO, colorNombre: "amarillo", enLaCaja: 2 },
] as const;

/** Las vigas de la caja, de la más corta a la más larga. Para la regla de colores. */
export const VIGAS_DEL_SET = VIGAS.map((v) => `viga-${v.modulos}m`);

/** Los ejes de la caja, de más corto a más largo. */
export const EJES_DEL_SET = EJES.map((e) => `eje-${e.modulos}m`);

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
    enLaCaja: 1,
    color: BLANCO,
    pista: "El de más fuerza, y la caja trae uno solo: para mover el robot.",
  },
  {
    id: "motor",
    nombre: "Motor mediano",
    familia: "electronica",
    enLaCaja: 2,
    color: BLANCO,
    pista: "Más pequeño y rápido, y hay dos: para pinzas, brazos y ruedas.",
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
  {
    id: "cable",
    nombre: "Cable USB",
    familia: "electronica",
    enLaCaja: 1,
    color: GRIS_OSCURO,
    pista: "Para cargar el Hub y para conectarlo por cable al iPad.",
  },

  // ── Estructura ─────────────────────────────────────────────────────
  ...VIGAS.map(
    (v): Pieza => ({
      id: `viga-${v.modulos}m`,
      nombre: `Viga de ${v.modulos}`,
      familia: "estructura",
      modulos: v.modulos,
      enLaCaja: v.enLaCaja,
      color: v.color,
      colorNombre: v.colorNombre,
      pista: `La ${v.colorNombre} de ${v.modulos} agujeros.`,
    }),
  ),
  {
    id: "viga",
    nombre: "Viga",
    familia: "estructura",
    color: GRIS,
    pista: "El color dice la medida: amarilla 3, morada 5 u 11, azul 7 o 13, negra 9 o 15.",
  },
  {
    id: "viga-angulo",
    nombre: "Viga en ángulo",
    familia: "estructura",
    enLaCaja: 4,
    color: AMARILLO,
    pista: "Para esquinas y refuerzos. Las hay amarillas, azules y negras.",
  },
  {
    id: "marco",
    nombre: "Marco Technic",
    familia: "estructura",
    enLaCaja: 2,
    color: MORADO,
    pista: "El rectángulo hueco: el esqueleto de los modelos grandes.",
  },
  {
    id: "panel",
    nombre: "Panel",
    familia: "estructura",
    enLaCaja: 2,
    color: BLANCO,
    pista: "Cierra el robot y le da cara.",
  },

  // ── Transmisión ────────────────────────────────────────────────────
  ...EJES.map(
    (e): Pieza => ({
      id: `eje-${e.modulos}m`,
      nombre: `Eje de ${e.modulos}`,
      familia: "transmision",
      modulos: e.modulos,
      enLaCaja: e.enLaCaja,
      color: e.color,
      colorNombre: e.colorNombre,
      pista: `El ${e.colorNombre} de ${e.modulos} módulos.`,
    }),
  ),
  {
    id: "eje",
    nombre: "Eje",
    familia: "transmision",
    color: GRIS,
    pista: "El color dice la medida: rojo 2, amarillo 3, 7 u 11, negro 4 u 8, gris 5 o 9.",
  },
  {
    id: "rueda",
    nombre: "Rueda con neumático",
    familia: "transmision",
    enLaCaja: 4,
    color: NEGRO,
    pista: "Llanta azul y goma negra. La caja trae cuatro.",
  },
  {
    id: "engranaje",
    nombre: "Engranaje",
    familia: "transmision",
    color: GRIS_OSCURO,
    pista: "Cambia la fuerza por velocidad, o al revés. Los hay de 12, 20, 28 y 36 dientes.",
  },
  {
    id: "cremallera",
    nombre: "Cremallera",
    familia: "transmision",
    enLaCaja: 2,
    color: NEGRO,
    pista: "Barra dentada de 13: convierte el giro en movimiento recto.",
  },

  // ── Unión ──────────────────────────────────────────────────────────
  {
    id: "pasador",
    nombre: "Pasador",
    familia: "union",
    modulos: 2,
    enLaCaja: 72,
    color: NEGRO,
    pista: "El negro agarra y el azul claro gira suelto. Son los que más se gastan.",
  },
  {
    id: "pasador-largo",
    nombre: "Pasador largo",
    familia: "union",
    modulos: 3,
    enLaCaja: 10,
    color: AZUL,
    pista: "Azul oscuro, de 3 módulos: une tres piezas de una vez.",
  },
  {
    id: "conector",
    nombre: "Conector de eje y pasador",
    familia: "union",
    enLaCaja: 20,
    color: AZUR,
    pista: "Azul claro: de un lado entra un eje y del otro un pasador.",
  },
  {
    id: "buje",
    nombre: "Buje",
    familia: "union",
    enLaCaja: 10,
    color: GRIS,
    pista: "Hace de tope en un eje para que no se salga.",
  },

  // ── Otros ──────────────────────────────────────────────────────────
  {
    id: "goma",
    nombre: "Goma elástica",
    familia: "otros",
    enLaCaja: 2,
    color: AMARILLO,
    pista: "Amarilla: para correas y para que algo vuelva a su sitio.",
  },
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

/**
 * Si un modelo pide más piezas de las que hay en la caja, mejor saberlo antes
 * de empezar a montar que a mitad.
 */
export function pasaDeLaCaja(material: Material): boolean {
  const hay = getPieza(material.pieza).enLaCaja;
  return hay !== undefined && material.cantidad !== undefined && material.cantidad > hay;
}

export { NUMEROS as NUMEROS_ESCRITOS };
