"use client";

// El robot de mentira que ejecuta el programa de la mesa.
//
// Cómo funciona, que tiene truco: el código generado NO toca la pantalla.
// Lo único que puede hacer es llamar a `motor(...)` y a `distancia()`, dos
// funciones que le pasamos nosotros y que se limitan a APUNTAR lo que el
// programa quiere hacer. Primero se recorre el programa entero y se saca la
// lista de acciones; después se van pintando una a una, con su pausa.
//
// Así se consiguen tres cosas: el programa no puede colgar la pestaña (si se
// pasa de vueltas, se corta), se puede parar a media ejecución, y se ve la
// secuencia paso a paso en vez de que todo pase de golpe.

import { useEffect, useRef, useState } from "react";
import type { Accion } from "@/lib/bloques-prueba";

/** Topes de seguridad: ni programas infinitos ni listas interminables. */
const MAX_VUELTAS = 5000;
const MAX_ACCIONES = 300;

interface Estado {
  acciones: Accion[];
  cortado: boolean;
  error: string | null;
}

/**
 * Recorre el programa y devuelve la lista de lo que hace, sin pintar nada.
 * El `new Function` es el camino de siempre de Blockly: el código sale de los
 * bloques que el propio alumno acaba de encastrar y se ejecuta en su
 * navegador, sin red ni servidor de por medio.
 */
function recorrer(codigo: string, queVeElSensor: number): Estado {
  const acciones: Accion[] = [];
  let vueltas = 0;
  let cortado = false;

  const motor = (puerto: unknown, velocidad: unknown, segundos: unknown) => {
    if (acciones.length >= MAX_ACCIONES) {
      cortado = true;
      return;
    }
    acciones.push({
      tipo: "motor",
      motor: String(puerto ?? "A"),
      velocidad: Number(velocidad) || 0,
      segundos: Number(segundos) || 0,
    });
  };

  const distancia = () => {
    if (acciones.length < MAX_ACCIONES) {
      acciones.push({ tipo: "mide", valor: queVeElSensor });
    }
    return queVeElSensor;
  };

  // El seguro antibucle: el generador mete una llamada a `paso()` dentro de
  // cada bucle. Cuando devuelve false, el programa se para solo.
  const paso = () => {
    vueltas += 1;
    if (vueltas > MAX_VUELTAS || acciones.length >= MAX_ACCIONES) {
      cortado = true;
      return false;
    }
    return true;
  };

  try {
    // eslint-disable-next-line no-new-func
    const programa = new Function("motor", "distancia", "paso", codigo);
    programa(motor, distancia, paso);
  } catch (fallo) {
    return {
      acciones,
      cortado,
      error: fallo instanceof Error ? fallo.message : "El programa no se ha podido ejecutar.",
    };
  }

  return { acciones, cortado, error: null };
}

export function Simulador({
  obtenerCodigo,
  queVeElSensor,
  onSensor,
}: {
  /** Se pide al pulsar «Simular», para ejecutar el programa de ESE momento. */
  obtenerCodigo: () => string;
  queVeElSensor: number;
  onSensor: (cm: number) => void;
}) {
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [actual, setActual] = useState(-1);
  const [corriendo, setCorriendo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [giro, setGiro] = useState(0);
  const parar = useRef(false);

  // Si se desmonta a media ejecución, que no siga.
  useEffect(() => () => void (parar.current = true), []);

  const simular = async () => {
    if (corriendo) {
      parar.current = true;
      return;
    }

    const { acciones: lista, cortado, error } = recorrer(obtenerCodigo(), queVeElSensor);
    setAcciones(lista);
    setActual(-1);
    setGiro(0);
    setAviso(
      error
        ? error
        : cortado
          ? "El programa daba demasiadas vueltas y lo he parado. ¿Hay un bucle que no termina?"
          : lista.length === 0
            ? "El programa no hace nada todavía: engancha algún bloque debajo de «al empezar»."
            : null,
    );
    if (lista.length === 0) return;

    parar.current = false;
    setCorriendo(true);

    for (let i = 0; i < lista.length; i += 1) {
      if (parar.current) break;
      setActual(i);
      const accion = lista[i];
      if (accion.tipo === "motor") {
        setGiro((g) => g + accion.velocidad * 3.6);
        // Un segundo de verdad se hace eterno mirando: se comprime.
        await espera(Math.min(Math.max(accion.segundos * 450, 200), 1600));
      } else {
        await espera(350);
      }
    }

    setCorriendo(false);
    if (!parar.current) setActual(lista.length - 1);
  };

  const enMarcha = corriendo && actual >= 0 ? acciones[actual] : null;
  const motorActivo = enMarcha?.tipo === "motor" ? enMarcha.motor : null;

  return (
    <section className="grid gap-4 rounded-card bg-ink-50 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-xl font-semibold text-ink-900">El robot</h3>
        <button
          type="button"
          onClick={simular}
          className={`rounded-full px-5 py-2.5 font-extrabold text-white transition ${
            corriendo ? "bg-ink-700 hover:bg-ink-800" : "bg-spike-600 hover:bg-spike-700"
          }`}
        >
          {corriendo ? "Parar" : "Simular / Probar bloques"}
        </button>
      </div>

      {/* El Hub, con el puerto que está moviéndose encendido. */}
      <div className="grid gap-3 rounded-2xl bg-white p-4">
        <div className="flex items-center justify-center gap-5">
          <svg viewBox="0 0 120 90" className="h-24" aria-hidden="true">
            <rect x="12" y="10" width="96" height="70" rx="10" fill="#f2f3f2" stroke="#d2d7da" />
            {["A", "C", "E"].map((p, i) => (
              <g key={p}>
                <rect
                  x={22 + i * 28}
                  y="16"
                  width="20"
                  height="12"
                  rx="3"
                  fill={motorActivo === p ? "#f2c500" : "#dfe4e7"}
                />
                <text x={32 + i * 28} y="25" fontSize="8" textAnchor="middle" fill="#2c3238">
                  {p}
                </text>
              </g>
            ))}
            {["B", "D", "F"].map((p, i) => (
              <g key={p}>
                <rect
                  x={22 + i * 28}
                  y="62"
                  width="20"
                  height="12"
                  rx="3"
                  fill={motorActivo === p ? "#f2c500" : "#dfe4e7"}
                />
                <text x={32 + i * 28} y="71" fontSize="8" textAnchor="middle" fill="#2c3238">
                  {p}
                </text>
              </g>
            ))}
            <rect x="36" y="33" width="48" height="24" rx="4" fill="#2c3238" />
            <text x="60" y="49" fontSize="10" textAnchor="middle" fill="#f2c500" fontWeight="bold">
              {motorActivo ?? "···"}
            </text>
          </svg>

          {/* El eje del motor girando: es lo que deja ver la velocidad. */}
          <svg viewBox="0 0 64 64" className="h-20" aria-hidden="true">
            <circle cx="32" cy="32" r="28" fill="#2c3238" />
            <circle cx="32" cy="32" r="19" fill="#4db6d4" />
            <g
              style={{
                transform: `rotate(${giro}deg)`,
                transformOrigin: "32px 32px",
                transition: "transform 0.45s linear",
              }}
            >
              <rect x="29" y="12" width="6" height="20" rx="2" fill="#ffffff" />
            </g>
            <circle cx="32" cy="32" r="5" fill="#ffffff" />
          </svg>
        </div>

        {/* El sensor: lo mueve el profe y el programa lo lee con «distancia». */}
        <label className="grid gap-1">
          <span className="text-sm font-bold text-ink-700">
            Lo que ve el sensor de distancia: <b className="text-ink-900">{queVeElSensor} cm</b>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={queVeElSensor}
            onChange={(e) => onSensor(Number(e.target.value))}
            className="w-full accent-spike-600"
          />
          <span className="text-xs font-semibold text-ink-500">
            Muévelo antes de simular y verás cómo el programa toma otro camino.
          </span>
        </label>
      </div>

      {aviso ? <p className="font-bold text-amber-700">{aviso}</p> : null}

      {/* La secuencia, con la acción en curso resaltada. */}
      {acciones.length > 0 ? (
        <ol className="grid max-h-56 gap-1 overflow-y-auto">
          {acciones.map((accion, i) => (
            <li
              key={i}
              className={`rounded-xl px-3 py-1.5 text-sm font-bold transition ${
                i === actual ? "bg-spike-600 text-white" : "bg-white text-ink-600"
              }`}
            >
              {accion.tipo === "motor"
                ? `Motor ${accion.motor} al ${accion.velocidad} % durante ${accion.segundos} s`
                : `Mide la distancia → ${accion.valor} cm`}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

function espera(ms: number): Promise<void> {
  return new Promise((listo) => setTimeout(listo, ms));
}
