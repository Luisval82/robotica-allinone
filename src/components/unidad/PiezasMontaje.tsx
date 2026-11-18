// Las piezas del set SPIKE Prime dibujadas a mano, con la misma factura que
// los bloques de palabras: formas planas y colores de la caja. No son las
// instrucciones oficiales de LEGO (esas son suyas): es un esquema propio para
// que el alumno sepa qué tiene que coger de su caja antes de empezar.
//
// Qué es cada pieza y de qué medidas la hay sale del catálogo del set
// (src/lib/piezas.ts); aquí solo está el dibujo. Las vigas y los ejes se
// dibujan a su largo de verdad: una viga de 15 se ve tres veces más larga que
// una de 5, que es justo lo que hay que reconocer en la caja.

import { getPieza, type Pieza } from "@/lib/piezas";
import { HubReal } from "@/components/brand/Hub";

/** Los agujeros de una viga, uno por módulo. */
function Agujeros({ modulos, y, r = 3.1 }: { modulos: number; y: number; r?: number }) {
  return (
    <>
      {/* Un agujero por módulo, centrado en su cuadradito de 10. */}
      {Array.from({ length: modulos }, (_, i) => (
        <circle key={i} cx={5 + i * 10} cy={y} r={r} fill="#ffffff" />
      ))}
    </>
  );
}

/** La cara de un motor: cuatro agujeros alrededor del eje. */
function CaraMotor({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const d = r * 0.52;
  const h = r * 0.22;
  return (
    <>
      <circle cx={cx} cy={cy} r={r} className="fill-white" />
      <circle cx={cx} cy={cy - d} r={h} fill="currentColor" />
      <circle cx={cx} cy={cy + d} r={h} fill="currentColor" />
      <circle cx={cx - d} cy={cy} r={h} fill="currentColor" />
      <circle cx={cx + d} cy={cy} r={h} fill="currentColor" />
      <circle cx={cx} cy={cy} r={h * 0.8} fill="currentColor" />
    </>
  );
}

/** El dibujo de una pieza del set. */
function Dibujo({ pieza }: { pieza: Pieza }) {
  const modulos = pieza.modulos ?? (pieza.familia === "estructura" ? 7 : 5);

  switch (pieza.id) {
    case "hub":
      return <HubReal className="size-full object-contain" />;

    case "bateria":
      return (
        <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
          <rect x="8" y="18" width="46" height="28" rx="5" fill={pieza.color} />
          <rect x="54" y="26" width="4" height="12" rx="2" fill={pieza.color} />
          <rect x="13" y="24" width="10" height="16" rx="2" fill="#ffffff" opacity="0.8" />
          <rect x="26" y="24" width="10" height="16" rx="2" fill="#ffffff" opacity="0.8" />
        </svg>
      );

    case "motor":
    case "motor-grande": {
      const ancho = pieza.id === "motor" ? 30 : 38;
      return (
        <svg viewBox="0 0 64 64" className="size-full text-block-motores" aria-hidden="true">
          <rect x={(64 - ancho) / 2} y="14" width={ancho} height="36" rx="6" fill="currentColor" />
          <CaraMotor cx={32} cy={32} r={12} />
          <rect x="4" y="29" width="8" height="6" rx="2" fill="currentColor" />
        </svg>
      );
    }

    case "distancia":
      return (
        <svg viewBox="0 0 64 64" className="size-full text-block-sensores" aria-hidden="true">
          <rect x="6" y="18" width="52" height="28" rx="7" fill="currentColor" />
          <circle cx="23" cy="32" r="7.5" className="fill-white" />
          <circle cx="41" cy="32" r="7.5" className="fill-white" />
          <circle cx="23" cy="32" r="3" fill="currentColor" />
          <circle cx="41" cy="32" r="3" fill="currentColor" />
        </svg>
      );

    case "color":
      return (
        <svg viewBox="0 0 64 64" className="size-full text-block-sensores" aria-hidden="true">
          <rect x="12" y="16" width="40" height="32" rx="7" fill="currentColor" />
          <circle cx="32" cy="32" r="10" className="fill-white" />
          <circle cx="32" cy="32" r="5" fill="currentColor" />
        </svg>
      );

    case "fuerza":
      return (
        <svg viewBox="0 0 64 64" className="size-full text-block-sensores" aria-hidden="true">
          <rect x="12" y="22" width="40" height="26" rx="7" fill="currentColor" />
          <rect x="26" y="8" width="12" height="16" rx="5" className="fill-white" />
          <rect
            x="26"
            y="8"
            width="12"
            height="16"
            rx="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      );

    case "rueda":
      return (
        <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
          <circle cx="32" cy="32" r="28" fill="#2c3238" />
          <circle cx="32" cy="32" r="19" fill="#d9dee1" />
          <circle cx="32" cy="32" r="6" fill="#2c3238" />
        </svg>
      );

    case "engranaje": {
      const dientes = 12;
      return (
        <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
          {Array.from({ length: dientes }, (_, i) => (
            <rect
              key={i}
              x="30"
              y="2"
              width="4"
              height="10"
              rx="1"
              fill={pieza.color}
              transform={`rotate(${(360 / dientes) * i} 32 32)`}
            />
          ))}
          <circle cx="32" cy="32" r="22" fill={pieza.color} />
          <circle cx="32" cy="32" r="6" fill="#ffffff" />
        </svg>
      );
    }

    case "panel":
      return (
        <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
          <path d="M8 46 V22 a6 6 0 0 1 6-6 h30 l12 14 v16 a6 6 0 0 1-6 6 H14 a6 6 0 0 1-6-6Z" fill={pieza.color} />
          <circle cx="20" cy="38" r="3.4" fill="#ffffff" />
          <circle cx="32" cy="38" r="3.4" fill="#ffffff" />
          <circle cx="44" cy="38" r="3.4" fill="#ffffff" />
        </svg>
      );

    case "viga-angulo":
      return (
        <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
          <path d="M6 20 h26 a6 6 0 0 1 6 6 v26 a6 6 0 0 1-12 0 V32 H6 a6 6 0 0 1 0-12Z" fill={pieza.color} />
          <circle cx="12" cy="26" r="3.1" fill="#ffffff" />
          <circle cx="24" cy="26" r="3.1" fill="#ffffff" />
          <circle cx="32" cy="40" r="3.1" fill="#ffffff" />
          <circle cx="32" cy="50" r="3.1" fill="#ffffff" />
        </svg>
      );

    case "buje":
      return (
        <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
          <circle cx="32" cy="32" r="16" fill={pieza.color} />
          <path d="M28 24h8v4h4v8h-4v4h-8v-4h-4v-8h4Z" fill="#ffffff" />
        </svg>
      );

    case "conector":
      return (
        <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
          <rect x="10" y="24" width="44" height="16" rx="8" fill={pieza.color} />
          <path d="M16 28h6v3h3v6h-3v3h-6Z" fill="#ffffff" />
          <circle cx="44" cy="32" r="5" fill="#ffffff" />
        </svg>
      );
  }

  // ── Piezas con largo: vigas, ejes y pasadores ──
  const ancho = modulos * 10;

  if (pieza.familia === "transmision" || pieza.id.startsWith("eje")) {
    // Un eje: barra con la cruz del perfil en las dos puntas.
    return (
      <svg viewBox={`0 0 ${ancho} 18`} className="size-full object-contain" aria-hidden="true">
        <rect x="0" y="6" width={ancho} height="6" rx="1.4" fill={pieza.color} />
        <rect x="0" y="3" width="5" height="12" rx="1.4" fill={pieza.color} />
        <rect x={ancho - 5} y="3" width="5" height="12" rx="1.4" fill={pieza.color} />
      </svg>
    );
  }

  if (pieza.familia === "union") {
    return (
      <svg viewBox={`0 0 ${ancho} 18`} className="size-full object-contain" aria-hidden="true">
        <rect x="0" y="5" width={ancho} height="8" rx="4" fill={pieza.color} />
        <circle cx="5" cy="9" r="2" fill="#ffffff" opacity="0.6" />
        <circle cx={ancho - 5} cy="9" r="2" fill="#ffffff" opacity="0.6" />
      </svg>
    );
  }

  // Una viga: barra con un agujero por módulo.
  return (
    <svg viewBox={`0 0 ${ancho} 18`} className="size-full object-contain" aria-hidden="true">
      <rect x="0" y="2" width={ancho} height="14" rx="7" fill={pieza.color} />
      <Agujeros modulos={modulos} y={9} />
    </svg>
  );
}

/** Una pieza con su nombre debajo. «grande» es para el carrusel del montaje. */
export function PiezaSpike({
  pieza,
  nota,
  cantidad,
  tamano = "normal",
}: {
  pieza: string;
  nota?: string;
  /** Cuántas hacen falta, cuando el modelo lo dice. */
  cantidad?: number;
  tamano?: "normal" | "grande";
}) {
  const info = getPieza(pieza);
  const grande = tamano === "grande";

  return (
    <figure className={`grid shrink-0 justify-items-center gap-1.5 ${grande ? "w-32" : "w-24"}`}>
      <div
        className={`relative grid w-full place-items-center rounded-2xl bg-white ${
          grande ? "h-24 p-2 shadow-card" : "h-16 p-1"
        }`}
      >
        <Dibujo pieza={info} />
        {cantidad && cantidad > 1 ? (
          <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-ink-900 text-sm font-extrabold text-white">
            {cantidad}
          </span>
        ) : null}
      </div>
      <figcaption
        className={`text-center font-bold leading-tight text-ink-700 ${grande ? "text-sm" : "text-xs"}`}
      >
        {info.nombre}
        {nota ? <span className="block font-extrabold text-ink-900">{nota}</span> : null}
      </figcaption>
    </figure>
  );
}

/** Las piezas que nombra un paso del montaje, en el orden en que se leen. */
export function piezasDelTexto(texto: string): { pieza: string; nota?: string }[] {
  const limpio = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  const encontradas: { pieza: string; donde: number }[] = [];
  const busca = (patron: RegExp, pieza: string) => {
    const m = limpio.match(patron);
    if (m && m.index !== undefined) encontradas.push({ pieza, donde: m.index });
  };

  busca(/\bhub\b/, "hub");
  busca(/motor(es)? grande/, "motor-grande");
  busca(/motor(es)?( mediano)?/, "motor");
  busca(/\bvigas?\b|\bbarras?\b/, "viga");
  busca(/\bejes?\b/, "eje");
  busca(/\bruedas?\b/, "rueda");
  busca(/\bpasador(es)?\b/, "pasador");
  busca(/\bengranajes?\b/, "engranaje");
  busca(/\bpaneles?\b/, "panel");
  busca(/sensor(es)? de distancia|ultrasonid/, "distancia");
  busca(/sensor(es)? de color/, "color");
  busca(/sensor(es)? de fuerza/, "fuerza");

  // Si hay motor grande, el genérico sobra.
  const hayGrande = encontradas.some((e) => e.pieza === "motor-grande");
  const lista = hayGrande ? encontradas.filter((e) => e.pieza !== "motor") : encontradas;

  // El puerto que nombre el paso se pone bajo la primera pieza que lo usa.
  const puerto = limpio.match(/puerto ([a-f])\b/);
  const nota = puerto ? `Puerto ${puerto[1].toUpperCase()}` : undefined;

  return lista
    .sort((a, b) => a.donde - b.donde)
    .map((e, i) => ({
      pieza: e.pieza,
      nota: i === 0 && nota && e.pieza !== "hub" ? nota : undefined,
    }));
}

/** Esquema de las piezas de un paso. No pinta nada si el paso no nombra ninguna. */
export function PiezasDelPaso({
  texto,
  tamano = "normal",
}: {
  texto: string;
  tamano?: "normal" | "grande";
}) {
  const piezas = piezasDelTexto(texto);
  if (piezas.length === 0) return null;
  const grande = tamano === "grande";

  return (
    <div
      className={`flex flex-wrap items-start rounded-2xl bg-ink-100 ${
        grande ? "justify-center gap-5 p-5" : "mt-3 gap-3 p-3"
      }`}
    >
      {piezas.map(({ pieza, nota }) => (
        <PiezaSpike key={pieza} pieza={pieza} nota={nota} tamano={tamano} />
      ))}
    </div>
  );
}
