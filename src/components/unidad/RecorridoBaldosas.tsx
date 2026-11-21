// El dibujo del recorrido sobre la cuadrícula de baldosas del aula.
//
// El recorrido se describe con los MISMOS pasos que dice el enunciado
// —avanzar, girar, retroceder, una marca donde pasa algo— y aquí se calcula
// todo lo demás: el tamaño de la rejilla, por dónde va el camino y dónde
// cae la llegada. No hay coordenadas que mantener a mano, así que el dibujo
// no puede desmentir a las instrucciones: sale de ellas.
//
// El robot se apoya en una CRUCETA, el cruce de dos juntas, y avanzar una
// baldosa lo lleva a la cruceta siguiente. Por eso el camino va por las
// juntas del terrazo y un cuadrado cierra justo donde empezó.
//
// Es SVG pintado en el servidor, sin librería: se ve nítido a cualquier
// tamaño, sale en el primer HTML y se imprime bien en los informes.

import type { Course, Recorrido } from "@/lib/types";
import { BALDOSA_CM } from "@/components/unidad/SueloBaldosas";

const LADO = 54;
const MARGEN = 30;
/** Hueco bajo la rejilla para la escala. */
const PIE = 24;

const COLOR = {
  baldosa: "#f3f6f8",
  junta: "#d3dbe0",
  cruceta: "#b2bec6",
  camino: "#007f8c",
  robot: "#1a242c",
  marca: "#ffd400",
  texto: "#5f6f7c",
  obstaculo: "#d6402f",
  fin: "#15703a",
};

/**
 * El rumbo se lleva en GRADOS, no en cuatro puntos cardinales: así un giro
 * de 120° se dibuja como un giro de 120° y no redondeado a 90, que es lo
 * que piden los triángulos de 2º y 3º.
 */
const ANGULO = { arriba: -90, derecha: 0, abajo: 90, izquierda: 180 } as const;

type Rumbo = keyof typeof ANGULO;
const rad = (grados: number) => (grados * Math.PI) / 180;
interface Tramo {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  trazos: boolean;
}
interface Marca {
  x: number;
  y: number;
  numero: number;
  texto: string;
}
interface Giro {
  x: number;
  y: number;
  desde: number;
  grados: number;
  /** Si el arco hace falta: un giro entre dos tramos ya se ve en la esquina. */
  pintar: boolean;
  /** Vueltas ya dibujadas en este mismo punto, para separar los radios. */
  nivel: number;
}

/** Recorre los pasos y devuelve dónde cae cada cosa, medido en baldosas. */
function simular(recorrido: Recorrido) {
  let x = 0;
  let y = 0;
  let rumbo = ANGULO[recorrido.mirando ?? "arriba"];

  const tramos: Tramo[] = [];
  const marcas: Marca[] = [];
  const giros: Giro[] = [];
  const antesDe: number[] = [];

  // Los obstáculos se colocan por delante de la salida, en el rumbo inicial:
  // «una caja tres baldosas por delante» se escribe tal cual.
  const obstaculos = (recorrido.obstaculos ?? []).map((o) => ({
    x: Math.cos(rad(rumbo)) * o.delante,
    y: Math.sin(rad(rumbo)) * o.delante,
    texto: o.texto ?? "caja",
  }));

  for (const paso of recorrido.pasos) {
    if (paso.tipo === "girar") {
      giros.push({ x, y, desde: rumbo, grados: paso.grados ?? 90, pintar: false, nivel: 0 });
      antesDe.push(tramos.length);
      rumbo += paso.grados ?? 90;
    } else if (paso.tipo !== "marca") {
      const n = (paso.baldosas ?? 1) * (paso.tipo === "retroceder" ? -1 : 1);
      const nx = x + Math.cos(rad(rumbo)) * n;
      const ny = y + Math.sin(rad(rumbo)) * n;
      tramos.push({ x1: x, y1: y, x2: nx, y2: ny, trazos: paso.tipo === "hasta" });
      x = nx;
      y = ny;
    }
    if (paso.marca) marcas.push({ x, y, numero: marcas.length + 1, texto: paso.marca });
  }

  // El arco de giro solo se dibuja cuando el trazado no lo enseña ya. En un
  // cuadrado, la esquina del camino es el giro: pintar ahí un arco ensucia.
  const nivelEn = new Map<string, number>();
  giros.forEach((g, i) => {
    const ultimo = antesDe[i] === tramos.length;
    const entre = antesDe[i] > 0 && !ultimo;
    const cierra = ultimo && tramos.length >= 2; // giro que cierra una figura
    g.pintar = !entre && !cierra;
    if (!g.pintar) return;
    const clave = `${g.x.toFixed(2)},${g.y.toFixed(2)}`;
    g.nivel = nivelEn.get(clave) ?? 0;
    nivelEn.set(clave, g.nivel + 1);
  });

  return { tramos, giros, marcas, obstaculos, finalX: x, finalY: y };
}

export function RecorridoBaldosas({
  recorrido,
  curso,
}: {
  recorrido: Recorrido;
  curso: Course;
}) {
  const { tramos, giros, marcas, obstaculos, finalX, finalY } = simular(recorrido);
  const rumbo: Rumbo = recorrido.mirando ?? "arriba";

  // La rejilla se ajusta a lo que ocupa el recorrido, con una baldosa de aire
  // alrededor para que nada quede pegado al borde.
  const xs = [0, finalX, ...tramos.flatMap((t) => [t.x1, t.x2]), ...obstaculos.map((o) => o.x)];
  const ys = [0, finalY, ...tramos.flatMap((t) => [t.y1, t.y2]), ...obstaculos.map((o) => o.y)];
  const x0 = Math.floor(Math.min(...xs)) - 1;
  const x1 = Math.ceil(Math.max(...xs)) + 1;
  const y0 = Math.floor(Math.min(...ys)) - 1;
  const y1 = Math.ceil(Math.max(...ys)) + 1;
  const columnas = x1 - x0;
  const filas = y1 - y0;

  // El ancho nunca por debajo del pie: si no, «una baldosa · 40 cm» se corta.
  const ancho = Math.max(MARGEN * 2 + columnas * LADO, 300);
  const alto = MARGEN * 2 + filas * LADO + PIE;
  const ex = (x: number) => MARGEN + (x - x0) * LADO;
  const ey = (y: number) => MARGEN + (y - y0) * LADO;

  // Los arcos de giro, con su etiqueta en mitad del arco y hacia fuera.
  const arcos = giros
    .filter((g) => g.pintar)
    .map((g, i) => {
      const a = ex(g.x);
      const b = ey(g.y);
      const r = 19 + 10 * g.nivel;
      const d0 = rad(g.desde);
      const d1 = rad(g.desde + g.grados);
      const medio = rad(g.desde + g.grados / 2);
      const tangente = g.desde + g.grados + (g.grados > 0 ? 90 : -90);
      return {
        clave: `g-${i}`,
        d: `M ${(a + r * Math.cos(d0)).toFixed(1)} ${(b + r * Math.sin(d0)).toFixed(1)} A ${r} ${r} 0 ${Math.abs(g.grados) > 180 ? 1 : 0} ${g.grados > 0 ? 1 : 0} ${(a + r * Math.cos(d1)).toFixed(1)} ${(b + r * Math.sin(d1)).toFixed(1)}`,
        puntaX: a + r * Math.cos(d1),
        puntaY: b + r * Math.sin(d1),
        tangente,
        etiquetaX: a + (r + 11) * Math.cos(medio),
        etiquetaY: b + (r + 11) * Math.sin(medio),
        grados: Math.abs(g.grados),
      };
    });

  // Las chapas numeradas buscan una esquina libre que no pise esas etiquetas.
  const ocupadas = new Set<string>();
  const sitioMarca = (m: Marca) => {
    const a = ex(m.x);
    const b = ey(m.y);
    const esquinas: [number, number][] = [
      [15, -15],
      [-15, -15],
      [15, 15],
      [-15, 15],
    ];
    const libre =
      esquinas.find(([dx, dy]) => {
        if (ocupadas.has(`${Math.round(a + dx)},${Math.round(b + dy)}`)) return false;
        return arcos.every(
          (q) => Math.hypot(a + dx - q.etiquetaX, b + dy - q.etiquetaY) > 24,
        );
      }) ?? esquinas[0];
    ocupadas.add(`${Math.round(a + libre[0])},${Math.round(b + libre[1])}`);
    return { x: a + libre[0], y: b + libre[1] };
  };
  const chapas = marcas.map((m) => ({ ...m, ...sitioMarca(m) }));

  // Si ya se ha pasado por una junta, el tramo se aparta un poco hacia su
  // derecha: así la ida y la vuelta se ven las dos, en lugar de quedar una
  // sola raya que no dice por dónde fue.
  const pisadas = new Set<string>();
  const trazados = tramos.map((t) => {
    const angulo = (Math.atan2(t.y2 - t.y1, t.x2 - t.x1) * 180) / Math.PI;
    const sx = Math.cos(rad(angulo));
    const sy = Math.sin(rad(angulo));
    const clave = [
      [t.x1, t.y1],
      [t.x2, t.y2],
    ]
      .map(([a, b]) => `${a.toFixed(2)},${b.toFixed(2)}`)
      .sort()
      .join("|");
    const fuera = pisadas.has(clave) ? 5 : 0;
    pisadas.add(clave);
    return {
      ...t,
      sx,
      sy,
      ox: -sy * fuera,
      oy: sx * fuera,
      angulo,
    };
  });

  return (
    <figure className="evitar-corte mt-2 overflow-hidden rounded-xl border-2 border-ink-100 bg-white p-2">
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        className="h-auto w-full max-w-md"
        role="img"
        aria-label={`Recorrido sobre la cuadrícula de baldosas: ${marcas
          .map((m) => m.texto)
          .join("; ")}`}
      >
        {Array.from({ length: columnas }, (_, i) =>
          Array.from({ length: filas }, (_, j) => (
            <rect
              key={`b-${i}-${j}`}
              x={ex(x0 + i)}
              y={ey(y0 + j)}
              width={LADO}
              height={LADO}
              fill={COLOR.baldosa}
              stroke={COLOR.junta}
              strokeWidth={2}
            />
          )),
        )}

        {Array.from({ length: columnas + 1 }, (_, i) =>
          Array.from({ length: filas + 1 }, (_, j) => (
            <circle
              key={`c-${i}-${j}`}
              cx={ex(x0 + i)}
              cy={ey(y0 + j)}
              r={2.5}
              fill={COLOR.cruceta}
            />
          )),
        )}

        {trazados.map((t, i) => {
          const a = ex(t.x1) + t.ox;
          const b = ey(t.y1) + t.oy;
          const c = ex(t.x2) + t.ox;
          const d = ey(t.y2) + t.oy;
          return (
            <g key={`t-${i}`}>
              <line
                x1={a}
                y1={b}
                x2={c}
                y2={d}
                stroke={COLOR.camino}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={t.trazos ? "7 5" : undefined}
              />
              <path
                d="M -6 -5 L 6 0 L -6 5 Z"
                fill={COLOR.camino}
                transform={`translate(${(a + c) / 2} ${(b + d) / 2}) rotate(${t.angulo})`}
              />
            </g>
          );
        })}

        {obstaculos.map((o, i) => (
          <g key={`o-${i}`}>
            <rect
              x={ex(o.x) - 12}
              y={ey(o.y) - 12}
              width={24}
              height={24}
              rx={4}
              fill="white"
              stroke={COLOR.obstaculo}
              strokeWidth={3}
            />
            <text
              x={ex(o.x)}
              y={ey(o.y) + 26}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fill={COLOR.obstaculo}
            >
              {o.texto}
            </text>
          </g>
        ))}

        {/* La llegada va antes que el robot: si coinciden, el robot queda
            encima y se ve que acaba donde empezó. */}
        <circle
          cx={ex(finalX)}
          cy={ey(finalY)}
          r={13}
          fill="none"
          stroke={COLOR.fin}
          strokeWidth={3}
        />
        <g transform={`translate(${ex(0)} ${ey(0)}) rotate(${ANGULO[rumbo]})`}>
          <rect x={-8} y={-6} width={13} height={12} rx={3} fill={COLOR.robot} />
          <path d="M 5 -4.5 L 10 0 L 5 4.5 Z" fill={COLOR.robot} />
        </g>

        {arcos.map((q) => (
          <g key={q.clave}>
            <path d={q.d} fill="none" stroke={COLOR.camino} strokeWidth={3} />
            <path
              d="M -5 -4 L 5 0 L -5 4 Z"
              fill={COLOR.camino}
              transform={`translate(${q.puntaX.toFixed(1)} ${q.puntaY.toFixed(1)}) rotate(${q.tangente})`}
            />
            <text
              x={q.etiquetaX.toFixed(1)}
              y={(q.etiquetaY + 3).toFixed(1)}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fill={COLOR.camino}
            >
              {q.grados}°
            </text>
          </g>
        ))}

        {chapas.map((m) => (
          <g key={`m-${m.numero}`}>
            <circle
              cx={m.x}
              cy={m.y}
              r={9.5}
              fill={COLOR.marca}
              stroke="white"
              strokeWidth={2}
            />
            <text
              x={m.x}
              y={m.y + 3.8}
              textAnchor="middle"
              fontSize={11}
              fontWeight={800}
              fill={COLOR.robot}
            >
              {m.numero}
            </text>
          </g>
        ))}

        <g>
          <line
            x1={ex(x0)}
            y1={ey(y1) + 14}
            x2={ex(x0) + LADO}
            y2={ey(y1) + 14}
            stroke={COLOR.texto}
            strokeWidth={1.5}
          />
          <line
            x1={ex(x0)}
            y1={ey(y1) + 10}
            x2={ex(x0)}
            y2={ey(y1) + 18}
            stroke={COLOR.texto}
            strokeWidth={1.5}
          />
          <line
            x1={ex(x0) + LADO}
            y1={ey(y1) + 10}
            x2={ex(x0) + LADO}
            y2={ey(y1) + 18}
            stroke={COLOR.texto}
            strokeWidth={1.5}
          />
          <text
            x={ex(x0) + LADO + 8}
            y={ey(y1) + 18}
            fontSize={11}
            fontWeight={700}
            fill={COLOR.texto}
          >
            una baldosa · {BALDOSA_CM} cm
          </text>
        </g>
      </svg>

      <figcaption className="mt-1 text-xs font-semibold text-ink-600">
        <span className="font-extrabold text-ink-900">El recorrido.</span> El robot sale del
        cuadrado negro mirando hacia donde apunta, y el círculo verde es donde tiene que acabar.
        {curso === "1ESO" ? " Una baldosa son unas 2,3 rotaciones." : ` Una baldosa son ${BALDOSA_CM} cm.`}
        {marcas.length > 0 ? (
          <ul className="mt-1 space-y-0.5">
            {marcas.map((m) => (
              <li key={m.numero}>
                <span className="mr-1 inline-flex size-4 items-center justify-center rounded-full bg-hub-400 text-[0.6rem] font-extrabold text-ink-900">
                  {m.numero}
                </span>
                {m.texto}
              </li>
            ))}
          </ul>
        ) : null}
      </figcaption>
    </figure>
  );
}
