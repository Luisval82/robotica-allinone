"use client";

// Pantalla de bienvenida: el Hub se enciende píxel a píxel y el nombre de la
// plataforma se monta letra a letra, como bloques que encajan. Dura algo más
// de tres segundos y se va sola con un fundido hacia el login.
//
// Aparece al entrar en la web (en /login y /registro). No sale cuando vuelves
// al login desde dentro de la propia plataforma —cerrar sesión, pulsar el
// logo—, que es donde cansaría: eso se mira por el referrer, y el atributo
// data-splash del <html> la oculta antes de que se pinte nada.

import { useCallback, useEffect, useRef, useState } from "react";

/** Milisegundos que dura la animación antes de empezar a irse. */
const DURACION = 3200;
/** Lo que tarda el fundido de salida. */
const FUNDIDO = 500;

const TITULO = "ROBOTICA";
const TITULO_2 = "ALLINONE";

// La carita de la matriz: 1 es píxel encendido. Se encienden en orden.
const MATRIZ = ["00000", "01010", "00000", "10001", "01110"];

interface Chispa {
  id: number;
  x: number;
  y: number;
}

export function Splash() {
  const [fuera, setFuera] = useState(false);
  const [oculta, setOculta] = useState(false);
  const [inclinacion, setInclinacion] = useState({ x: 0, y: 0 });
  const [chispas, setChispas] = useState<Chispa[]>([]);
  const siguienteChispa = useRef(0);
  const salida = useRef<ReturnType<typeof setTimeout> | null>(null);

  const terminar = useCallback(() => {
    if (salida.current) return;
    setFuera(true);
    salida.current = setTimeout(() => setOculta(true), FUNDIDO);
  }, []);

  // Se va sola. Y no llega a salir si vienes de dentro de la propia web.
  useEffect(() => {
    let dentro = false;
    try {
      dentro =
        document.referrer !== "" &&
        new URL(document.referrer).origin === window.location.origin;
    } catch {
      dentro = false;
    }
    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (dentro || sinMovimiento) {
      setOculta(true);
      return;
    }
    const reloj = setTimeout(terminar, DURACION);
    return () => {
      clearTimeout(reloj);
      if (salida.current) clearTimeout(salida.current);
    };
  }, [terminar]);

  // Cualquier tecla también la salta.
  useEffect(() => {
    const alPulsar = () => terminar();
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [terminar]);

  if (oculta) return null;

  /** El logo se inclina un poco hacia donde está el dedo o el ratón. */
  function seguir(x: number, y: number, caja: DOMRect) {
    const dx = (x - caja.left) / caja.width - 0.5;
    const dy = (y - caja.top) / caja.height - 0.5;
    setInclinacion({ x: -dy * 16, y: dx * 20 });
  }

  function chispear(x: number, y: number) {
    const id = siguienteChispa.current;
    siguienteChispa.current += 1;
    setChispas((actuales) => [...actuales.slice(-14), { id, x, y }]);
    setTimeout(() => setChispas((actuales) => actuales.filter((c) => c.id !== id)), 700);
  }

  return (
    <div
      className={`splash fixed inset-0 z-50 grid place-items-center overflow-hidden bg-ink-900 ${
        fuera ? "splash--fuera" : ""
      }`}
      style={{ transitionDuration: `${FUNDIDO}ms` }}
      onPointerMove={(evento) => {
        seguir(evento.clientX, evento.clientY, evento.currentTarget.getBoundingClientRect());
        if (evento.pointerType === "touch") chispear(evento.clientX, evento.clientY);
      }}
      onPointerDown={(evento) => chispear(evento.clientX, evento.clientY)}
      onPointerLeave={() => setInclinacion({ x: 0, y: 0 })}
    >
      {/* Resplandor de fondo, en turquesa y amarillo SPIKE */}
      <div className="splash__brillo splash__brillo--spike" />
      <div className="splash__brillo splash__brillo--hub" />

      <div
        className="splash__escena relative grid justify-items-center gap-7 px-6"
        style={{
          transform: `perspective(900px) rotateX(${inclinacion.x}deg) rotateY(${inclinacion.y}deg)`,
        }}
      >
        {/* El Hub, encendiéndose píxel a píxel */}
        <svg viewBox="0 0 64 64" className="splash__hub size-28 sm:size-36" aria-hidden="true">
          <rect x="2" y="2" width="60" height="60" rx="15" className="splash__marco fill-hub-400" />
          <rect x="9" y="9" width="46" height="46" rx="9" className="splash__pantalla fill-ink-900" />
          {MATRIZ.flatMap((fila, y) =>
            fila.split("").map((valor, x) => (
              <rect
                key={`${y}-${x}`}
                x={14.5 + x * 7.3}
                y={14.5 + y * 7.3}
                width="5.8"
                height="5.8"
                rx="1.4"
                className={valor === "1" ? "splash__pixel fill-white" : "fill-ink-700"}
                style={valor === "1" ? { animationDelay: `${600 + (y * 5 + x) * 55}ms` } : undefined}
              />
            )),
          )}
        </svg>

        {/* El nombre, letra a letra, como bloques que encajan */}
        <div className="text-center font-display text-4xl font-semibold tracking-wide sm:text-6xl">
          <span className="sr-only">ROBOTICA ALLINONE</span>
          <span aria-hidden="true" className="flex flex-wrap justify-center gap-x-1">
            {[...TITULO].map((letra, i) => (
              <span
                key={`a${i}`}
                className="splash__letra text-white"
                style={{ animationDelay: `${1500 + i * 55}ms` }}
              >
                {letra}
              </span>
            ))}
            <span className="w-3 sm:w-5" />
            {[...TITULO_2].map((letra, i) => (
              <span
                key={`b${i}`}
                className="splash__letra text-spike-400"
                style={{ animationDelay: `${1500 + (TITULO.length + i) * 55}ms` }}
              >
                {letra}
              </span>
            ))}
          </span>
        </div>

        <p
          className="splash__lema text-center font-semibold text-ink-300"
          style={{ animationDelay: "2500ms" }}
        >
          Robótica con LEGO® Education SPIKE™ Prime
        </p>
      </div>

      {/* Chispas donde tocas o pulsas */}
      {chispas.map((chispa) => (
        <span
          key={chispa.id}
          className="splash__chispa"
          style={{ left: chispa.x, top: chispa.y }}
          aria-hidden="true"
        />
      ))}

      <button
        type="button"
        onClick={terminar}
        className="absolute bottom-6 right-6 rounded-full border-2 border-ink-700 px-4 py-2 text-sm font-bold text-ink-300 transition hover:border-spike-400 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-spike-400"
      >
        Saltar
      </button>
    </div>
  );
}
