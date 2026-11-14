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
