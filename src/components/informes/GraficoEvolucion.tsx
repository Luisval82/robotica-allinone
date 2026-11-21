// El gráfico de evolución de los informes: barras de avance por unidad y la
// línea de las notas de las PRUEBAS, en el mismo dibujo.
//
// Es SVG escrito a mano, sin librería de gráficas, por tres motivos:
//  · se imprime nítido a cualquier tamaño, que es de lo que va esto;
//  · no añade una dependencia al proyecto ni peso al navegador;
//  · lo pinta el servidor, así que el informe sale entero en el primer
//    HTML y no hay un hueco mientras carga algo.
//
// Los dos ejes miden lo mismo por dentro (0–100): el avance va en % a la
// izquierda y la nota en 0–10 a la derecha, que es el mismo punto × 10. Por
// eso la raya discontinua del 50 % es también el 5 de aprobado.
//
// El mismo componente sirve para el informe de un alumno y para la media de
// un grupo: solo cambian los datos y el título.

import type { PuntoDeEvolucion } from "@/lib/informes";
import { formatNota } from "@/lib/format";

const ANCHO = 760;
const ALTO = 260;
const MARGEN = { arriba: 26, abajo: 42, izquierda: 38, derecha: 34 };

const AREA_ANCHO = ANCHO - MARGEN.izquierda - MARGEN.derecha;
const AREA_ALTO = ALTO - MARGEN.arriba - MARGEN.abajo;

// Colores del tema (src/app/globals.css). Van escritos aquí porque un SVG
// impreso no hereda las variables CSS de forma fiable en todos los
// navegadores, y un informe en blanco y negro no serviría de nada.
const COLOR = {
  ejes: "#8493a0",
  rejilla: "#e7ecef",
  barra: "#53cedb",
  linea: "#1a242c",
  punto: "#007f8c",
  banda: "#f3f6f8",
  aprobado: "#b2bec6",
  texto: "#5f6f7c",
  titulo: "#1a242c",
};

/** Valor de 0 a 100 → coordenada vertical. */
function y(valor: number): number {
  return MARGEN.arriba + AREA_ALTO * (1 - Math.max(0, Math.min(100, valor)) / 100);
}

export function GraficoEvolucion({
  puntos,
  titulo,
}: {
  puntos: PuntoDeEvolucion[];
  titulo: string;
}) {
  const columnas = Math.max(puntos.length, 1);
  const paso = AREA_ANCHO / columnas;
  const anchoBarra = paso * 0.44;
  const x = (indice: number) => MARGEN.izquierda + paso * (indice + 0.5);
  const suelo = MARGEN.arriba + AREA_ALTO;

  // Las bandas de evaluación salen de agrupar las unidades de tres en tres,
  // que es como está repartido el temario de los tres cursos.
  const bandas = [
    { desde: 0, hasta: 3, rotulo: "1.ª evaluación" },
    { desde: 3, hasta: 6, rotulo: "2.ª evaluación" },
    { desde: 6, hasta: 9, rotulo: "3.ª evaluación" },
  ].filter((banda) => banda.desde < columnas);

  // La línea se parte donde no hay nota: no se dibuja un tramo inventado
  // entre la unidad 3 y la 7 porque las de en medio estén sin corregir.
  const tramos: string[][] = [];
  let actual: string[] = [];
  puntos.forEach((punto, indice) => {
    if (punto.nota === null) {
      if (actual.length > 1) tramos.push(actual);
      actual = [];
      return;
    }
    actual.push(`${x(indice).toFixed(1)},${y(punto.nota * 10).toFixed(1)}`);
  });
  if (actual.length > 1) tramos.push(actual);

  return (
    <figure className="evitar-corte m-0">
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="h-auto w-full"
        role="img"
        aria-label={titulo}
      >
        <title>{titulo}</title>

        {bandas.map((banda, indice) =>
          indice % 2 === 0 ? (
            <rect
              key={`banda-${banda.desde}`}
              x={MARGEN.izquierda + paso * banda.desde}
              y={MARGEN.arriba}
              width={paso * (Math.min(banda.hasta, columnas) - banda.desde)}
              height={AREA_ALTO}
              fill={COLOR.banda}
            />
          ) : null,
        )}

        {[0, 25, 50, 75, 100].map((valor) => (
          <g key={`rejilla-${valor}`}>
            <line
              x1={MARGEN.izquierda}
              y1={y(valor)}
              x2={ANCHO - MARGEN.derecha}
              y2={y(valor)}
              stroke={COLOR.rejilla}
              strokeWidth={1}
            />
            <text
              x={MARGEN.izquierda - 6}
              y={y(valor) + 3.5}
              textAnchor="end"
              fontSize={10}
              fill={COLOR.texto}
            >
              {valor}%
            </text>
          </g>
        ))}

        {[0, 5, 10].map((nota) => (
          <text
            key={`nota-${nota}`}
            x={ANCHO - MARGEN.derecha + 6}
            y={y(nota * 10) + 3.5}
            fontSize={10}
            fill={COLOR.texto}
          >
            {nota}
          </text>
        ))}

        {/* El 5 de aprobado, que es también el 50 % de avance. */}
        <line
          x1={MARGEN.izquierda}
          y1={y(50)}
          x2={ANCHO - MARGEN.derecha}
          y2={y(50)}
          stroke={COLOR.aprobado}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />

        {puntos.map((punto, indice) =>
          punto.porcentaje > 0 ? (
            <rect
              key={`barra-${punto.unidad}`}
              x={x(indice) - anchoBarra / 2}
              y={y(punto.porcentaje)}
              width={anchoBarra}
              height={suelo - y(punto.porcentaje)}
              rx={3}
              fill={COLOR.barra}
            />
          ) : null,
        )}

        {tramos.map((tramo, indice) => (
          <polyline
            key={`tramo-${indice}`}
            points={tramo.join(" ")}
            fill="none"
            stroke={COLOR.linea}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ))}

        {puntos.map((punto, indice) => {
          if (punto.nota === null) return null;
          const cy = y(punto.nota * 10);
          // Con un 10 la etiqueta se saldría por arriba: entonces baja al
          // otro lado del punto. Es el único sitio donde se pisarían cosas.
          const cabeArriba = cy - 10 >= MARGEN.arriba + 8;
          return (
            <g key={`punto-${punto.unidad}`}>
              <circle
                cx={x(indice)}
                cy={cy}
                r={4.5}
                fill="white"
                stroke={COLOR.punto}
                strokeWidth={2.5}
              />
              <text
                x={x(indice)}
                y={cabeArriba ? cy - 10 : cy + 17}
                textAnchor="middle"
                fontSize={10}
                fontWeight={800}
                fill={COLOR.titulo}
              >
                {formatNota(punto.nota)}
              </text>
            </g>
          );
        })}

        {puntos.map((punto, indice) => (
          <text
            key={`rotulo-${punto.unidad}`}
            x={x(indice)}
            y={suelo + 15}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill={COLOR.texto}
          >
            UD {punto.unidad}
          </text>
        ))}

        {bandas.map((banda) => (
          <text
            key={`rotulo-${banda.rotulo}`}
            x={MARGEN.izquierda + paso * (banda.desde + (Math.min(banda.hasta, columnas) - banda.desde) / 2)}
            y={ALTO - 8}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fill={COLOR.texto}
          >
            {banda.rotulo}
          </text>
        ))}

        <line
          x1={MARGEN.izquierda}
          y1={suelo}
          x2={ANCHO - MARGEN.derecha}
          y2={suelo}
          stroke={COLOR.ejes}
          strokeWidth={1.5}
        />
        <text x={MARGEN.izquierda} y={16} fontSize={11} fontWeight={800} fill={COLOR.titulo}>
          {titulo}
        </text>
      </svg>

      <figcaption className="mt-1 text-[0.7rem] font-semibold text-ink-500">
        Barras: avance de la unidad (teoría, test y las 2 programaciones), en el eje de la
        izquierda. Línea: nota de la PRUEBA sobre 10, en el eje de la derecha. La raya
        discontinua es el 5.
      </figcaption>
    </figure>
  );
}
