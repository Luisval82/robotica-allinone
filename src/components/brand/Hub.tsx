// El Hub y su matriz de luces 5x5: la seña de identidad de la plataforma.
// Dibujo propio en SVG (no es un logotipo ni una imagen oficial).

export type HubPattern = "sonrisa" | "triste";

// Cada texto es una fila de la matriz: 1 = píxel encendido, 0 = apagado.
const PATTERNS: Record<HubPattern, readonly string[]> = {
  sonrisa: ["00000", "01010", "00000", "10001", "01110"],
  triste: ["00000", "01010", "00000", "01110", "10001"],
};

interface PixelGrid {
  pattern: HubPattern;
  origin: number;
  cell: number;
  gap: number;
  radius: number;
  blink?: boolean;
}

function Pixels({ pattern, origin, cell, gap, radius, blink = false }: PixelGrid) {
  return (
    <>
      {PATTERNS[pattern].flatMap((row, rowIndex) =>
        row.split("").map((value, columnIndex) => {
          const lit = value === "1";
          const isEye = lit && rowIndex === 1;
          return (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={origin + columnIndex * (cell + gap)}
              y={origin + rowIndex * (cell + gap)}
              width={cell}
              height={cell}
              rx={radius}
              className={`${lit ? "fill-white" : "fill-ink-700"} ${blink && isEye ? "hub-eye" : ""}`}
            />
          );
        }),
      )}
    </>
  );
}

/** Icono cuadrado del Hub (logotipo y favicon). */
export function HubIcon({
  pattern = "sonrisa",
  className,
}: {
  pattern?: HubPattern;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="15" className="fill-hub-400" />
      <rect x="9" y="9" width="46" height="46" rx="9" className="fill-ink-900" />
      <Pixels pattern={pattern} origin={14.5} cell={5.8} gap={1.5} radius={1.4} />
    </svg>
  );
}

/** Hub completo con botón central, para la bienvenida y la página 404. */
export function HubIllustration({
  pattern = "sonrisa",
  className,
  blink = true,
}: {
  pattern?: HubPattern;
  className?: string;
  blink?: boolean;
}) {
  return (
    <svg viewBox="0 0 200 256" className={className} aria-hidden="true">
      <rect x="0" y="6" width="200" height="250" rx="38" className="fill-hub-700" />
      <rect x="0" y="0" width="200" height="250" rx="38" className="fill-hub-400" />
      <rect x="20" y="20" width="160" height="160" rx="22" className="fill-ink-900" />
      <Pixels pattern={pattern} origin={33.5} cell={21} gap={7} radius={5} blink={blink} />
      <circle cx="100" cy="214" r="21" className="fill-white stroke-spike-400" strokeWidth="7" />
    </svg>
  );
}

// ── El Hub tal y como es ─────────────────────────────────────────────────
//
// Dibujo propio del aparato visto de frente, hecho mirando el Hub real: la
// carcasa blanca con los laterales amarillos, los seis puertos (A, C y E a la
// izquierda; B, D y F a la derecha), la matriz de 5×5 y el botón central
// entre las dos flechas. No es una imagen de LEGO ni lleva su logotipo: es
// una ilustración técnica del aparato, para que el alumno reconozca lo que
// tiene en la mesa.
//
// Los colores están medidos del Hub real: la carcasa tira a blanco frío y los
// píxeles encendidos son de un blanco cálido, casi ámbar.

const CARCASA = "#f2f3f2";
const CARCASA_SOMBRA = "#dde0df";
const AMARILLO = "#f2c500";
const AMARILLO_SOMBRA = "#cfa800";
const GRIS = "#9a9a90";
const ENCENDIDO = "#fbe9c0";
const APAGADO = "#e7e8e5";

const PUERTOS_IZQUIERDA = ["A", "C", "E"] as const;
const PUERTOS_DERECHA = ["B", "D", "F"] as const;

/** Un puerto: su boca oscura y su letra. */
function Puerto({
  x,
  y,
  letra,
  lado,
  encendido,
}: {
  x: number;
  y: number;
  letra: string;
  lado: "izquierda" | "derecha";
  encendido: boolean;
}) {
  return (
    <>
      <rect x={x} y={y} width="13" height="20" rx="2.5" fill={encendido ? "#2b2b2b" : "#4a4a46"} />
      <rect x={x + 2.5} y={y + 4} width="8" height="12" rx="1.4" fill="#111" />
      <text
        x={lado === "izquierda" ? x + 21 : x - 8}
        y={y + 14.5}
        textAnchor={lado === "izquierda" ? "start" : "end"}
        fontSize="13"
        fontWeight="700"
        fill={encendido ? "#1f2937" : GRIS}
      >
        {letra}
      </text>
    </>
  );
}

/**
 * El Hub de frente. Con `puertosUsados` se marcan los puertos que lleva algo
 * conectado en esa unidad, que es lo que mira el alumno al montar.
 */
export function HubReal({
  pattern = "sonrisa",
  puertosUsados = [],
  className,
}: {
  pattern?: HubPattern;
  /** Letras de los puertos que llevan algo conectado: ["A", "E"]. */
  puertosUsados?: readonly string[];
  className?: string;
}) {
  const usado = (letra: string) => puertosUsados.includes(letra);

  return (
    <svg
      viewBox="0 0 200 290"
      className={className}
      role="img"
      aria-label="El Hub visto de frente, con sus seis puertos: A, C y E a la izquierda y B, D y F a la derecha."
    >
      {/* Los dos laterales amarillos, con sus agujeros de montaje. El
          amarillo del Hub es la carcasa de los lados: por delante asoma solo
          por los bordes, no alrededor de toda la cara. */}
      {[6, 168].map((x) => (
        <g key={x}>
          <rect x={x} y="20" width="26" height="252" rx="8" fill={AMARILLO_SOMBRA} />
          <rect x={x} y="16" width="26" height="252" rx="8" fill={AMARILLO} />
          {[52, 108, 164, 220].map((y) => (
            <circle key={y} cx={x + 13} cy={y} r="6" fill={AMARILLO_SOMBRA} />
          ))}
        </g>
      ))}

      {/* La cara blanca */}
      <rect x="16" y="8" width="168" height="276" rx="20" fill={CARCASA_SOMBRA} />
      <rect x="16" y="4" width="168" height="276" rx="20" fill={CARCASA} />

      {/* Los cuatro agujeros de las esquinas */}
      {[
        [40, 24],
        [160, 24],
        [40, 256],
        [160, 256],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="11" fill={CARCASA_SOMBRA} />
          <circle cx={cx} cy={cy} r="7.5" fill="#cfd3d1" />
        </g>
      ))}

      {/* El botón redondo de arriba a la derecha (el de conectar) */}
      <circle cx="150" cy="54" r="13" fill="#eceeed" stroke={CARCASA_SOMBRA} strokeWidth="2" />
      <path
        d="M150 46 L155 51 L145 58 L150 62 L150 46 M150 54 L145 50"
        fill="none"
        stroke={GRIS}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* La matriz de 5×5 */}
      {PATTERNS[pattern].flatMap((fila, f) =>
        fila.split("").map((valor, c) => (
          <rect
            key={`${f}-${c}`}
            x={62 + c * 16.5}
            y={86 + f * 16.5}
            width="12.5"
            height="12.5"
            rx="2.2"
            fill={valor === "1" ? ENCENDIDO : APAGADO}
          />
        )),
      )}

      {/* Los seis puertos */}
      {PUERTOS_IZQUIERDA.map((letra, i) => (
        <Puerto
          key={letra}
          x={24}
          y={84 + i * 56}
          letra={letra}
          lado="izquierda"
          encendido={usado(letra)}
        />
      ))}
      {PUERTOS_DERECHA.map((letra, i) => (
        <Puerto
          key={letra}
          x={163}
          y={84 + i * 56}
          letra={letra}
          lado="derecha"
          encendido={usado(letra)}
        />
      ))}

      {/* El botón central, entre sus dos flechas */}
      <rect x="55" y="236" width="90" height="34" rx="17" fill="#eceeed" />
      <path d="M72 253 l7 -6 v12 z" fill={GRIS} />
      <path d="M128 253 l-7 -6 v12 z" fill={GRIS} />
      <circle cx="100" cy="253" r="21" fill="#f6f6f4" stroke={CARCASA_SOMBRA} strokeWidth="2.5" />
    </svg>
  );
}
