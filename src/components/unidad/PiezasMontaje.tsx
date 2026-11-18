// Piezas de LEGO® Education SPIKE dibujadas a mano, con la misma factura que
// los bloques de palabras: formas planas, trazo grueso y el color de su
// categoría. No son las instrucciones oficiales de LEGO (esas son suyas): son
// un esquema propio para que el alumno vea de un vistazo qué entra en cada
// paso del montaje.

import { HubReal } from "@/components/brand/Hub";

export type Pieza =
  | "hub"
  | "motor"
  | "motor-grande"
  | "viga"
  | "eje"
  | "rueda"
  | "pasador"
  | "distancia"
  | "color"
  | "fuerza";

const NOMBRE: Record<Pieza, string> = {
  hub: "Hub",
  motor: "Motor mediano",
  "motor-grande": "Motor grande",
  viga: "Viga",
  eje: "Eje",
  rueda: "Rueda",
  pasador: "Pasador",
  distancia: "Sensor de distancia",
  color: "Sensor de color",
  fuerza: "Sensor de fuerza",
};

/** La cara de un motor: cuatro agujeros alrededor del eje. */
function CaraMotor({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const d = r * 0.52;
  const h = r * 0.22;
  return (
    <>
      <circle cx={cx} cy={cy} r={r} className="fill-white" />
      {[
        [cx, cy - d],
        [cx, cy + d],
        [cx - d, cy],
        [cx + d, cy],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={h} fill="currentColor" />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.12} fill="currentColor" />
    </>
  );
}

function Dibujo({ pieza }: { pieza: Pieza }) {
  switch (pieza) {
    case "hub":
      // El mismo dibujo del Hub que en el esquema de puertos, para que el
      // alumno vea siempre el mismo aparato.
      return <HubReal className="size-full object-contain" />;
    case "motor":
    case "motor-grande": {
      const ancho = pieza === "motor" ? 30 : 38;
      return (
        <svg viewBox="0 0 64 64" className="size-full text-block-motores" aria-hidden="true">
          <rect x={32 - ancho / 2} y="18" width={ancho} height="28" rx="6" fill="currentColor" />
          <rect x={32 - ancho / 2 - 5} y="26" width="6" height="12" rx="2" fill="currentColor" />
          <CaraMotor cx={32 + ancho / 2 - 11} cy={32} r={10} />
        </svg>
      );
    }
    case "viga":
      return (
        <svg viewBox="0 0 64 64" className="size-full text-ink-400" aria-hidden="true">
          <rect x="3" y="25" width="58" height="14" rx="7" fill="currentColor" />
          {[10, 20, 30, 40, 50].map((x) => (
            <circle key={x} cx={x + 2} cy="32" r="3.4" className="fill-white" />
          ))}
        </svg>
      );
    case "eje":
      return (
        <svg viewBox="0 0 64 64" className="size-full text-ink-800" aria-hidden="true">
          <rect x="4" y="29" width="56" height="6" rx="1.5" fill="currentColor" />
          <rect x="4" y="26" width="5" height="12" rx="1.5" fill="currentColor" />
          <rect x="55" y="26" width="5" height="12" rx="1.5" fill="currentColor" />
        </svg>
      );
    case "rueda":
      return (
        <svg viewBox="0 0 64 64" className="size-full text-ink-800" aria-hidden="true">
          <circle cx="32" cy="32" r="26" fill="currentColor" />
          <circle cx="32" cy="32" r="17" className="fill-white" />
          <g className="text-ink-800">
            <CaraMotor cx={32} cy={32} r={12} />
          </g>
        </svg>
      );
    case "pasador":
      return (
        <svg viewBox="0 0 64 64" className="size-full text-block-sonido" aria-hidden="true">
          <rect x="8" y="27" width="48" height="10" rx="5" fill="currentColor" />
          <circle cx="32" cy="32" r="7" fill="currentColor" />
          <circle cx="32" cy="32" r="3" className="fill-white" />
        </svg>
      );
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
          <rect x="26" y="8" width="12" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
      );
  }
}

/** Una pieza con su nombre debajo. «grande» es para el carrusel del montaje. */
export function PiezaSpike({
  pieza,
  nota,
  tamano = "normal",
}: {
  pieza: Pieza;
  nota?: string;
  tamano?: "normal" | "grande";
}) {
  const grande = tamano === "grande";
  return (
    <figure
      className={`grid shrink-0 justify-items-center gap-1.5 ${grande ? "w-32" : "w-24"}`}
    >
      <div
        className={`grid place-items-center rounded-2xl bg-white ${
          grande ? "size-24 p-2 shadow-card" : "size-16 p-1"
        }`}
      >
        <Dibujo pieza={pieza} />
      </div>
      <figcaption
        className={`text-center font-bold leading-tight text-ink-700 ${
          grande ? "text-sm" : "text-xs"
        }`}
      >
        {NOMBRE[pieza]}
        {nota ? <span className="block font-extrabold text-ink-900">{nota}</span> : null}
      </figcaption>
    </figure>
  );
}

/** Las piezas que nombra un paso del montaje, en el orden en que se leen. */
export function piezasDelTexto(texto: string): { pieza: Pieza; nota?: string }[] {
  const limpio = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  const encontradas: { pieza: Pieza; nota?: string; donde: number }[] = [];
  const busca = (patron: RegExp, pieza: Pieza) => {
    const m = limpio.match(patron);
    if (m && m.index !== undefined) encontradas.push({ pieza, donde: m.index });
  };

  busca(/\bhub\b/, "hub");
  busca(/motor(es)? grande/, "motor-grande");
  busca(/motor(es)?( mediano)?/, "motor");
  busca(/\bvigas?\b/, "viga");
  busca(/\bejes?\b/, "eje");
  busca(/\bruedas?\b/, "rueda");
  busca(/\bpasador(es)?\b/, "pasador");
  busca(/sensor(es)? de distancia|sensor de ultrasonidos/, "distancia");
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
