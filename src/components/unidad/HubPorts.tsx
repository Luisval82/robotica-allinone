import { HubIllustration } from "@/components/brand/Hub";
import type { HubSetup, PortDevice, PortLetter } from "@/lib/unidades";

// En el Hub, los puertos A, C y E están a la izquierda y B, D y F a la derecha.
const LEFT: PortLetter[] = ["A", "C", "E"];
const RIGHT: PortLetter[] = ["B", "D", "F"];

const DEVICE_STYLE = {
  motor: "border-block-motores bg-block-motores/15",
  sensor: "border-block-sensores bg-block-sensores/20",
} as const;

function PortRow({
  puerto,
  device,
  side,
}: {
  puerto: PortLetter;
  device?: PortDevice;
  side: "left" | "right";
}) {
  const badge = (
    <span
      className={`grid size-10 shrink-0 place-items-center rounded-full font-display text-lg font-semibold ${
        device ? "bg-hub-400 text-ink-900" : "bg-ink-100 text-ink-500"
      }`}
    >
      {puerto}
    </span>
  );
  const cable = (
    <span
      aria-hidden="true"
      className={`hidden h-1 w-6 shrink-0 rounded-full sm:block ${device ? "bg-ink-800" : "bg-ink-200"}`}
    />
  );
  const card = device ? (
    <span className={`min-w-0 flex-1 rounded-2xl border-2 px-4 py-2.5 ${DEVICE_STYLE[device.tipo]}`}>
      <span className="block font-bold text-ink-900">{device.nombre}</span>
      {device.papel ? (
        <span className="block text-sm font-semibold text-ink-600">{device.papel}</span>
      ) : null}
    </span>
  ) : (
    <span className="min-w-0 flex-1 rounded-2xl border-2 border-dashed border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-500">
      Libre
    </span>
  );

  return (
    <li className="flex min-h-[3.75rem] items-center gap-2">
      <span className="sr-only">Puerto {puerto}: </span>
      {side === "left" ? (
        <>
          {card}
          {cable}
          {badge}
        </>
      ) : (
        <>
          {badge}
          {cable}
          {card}
        </>
      )}
    </li>
  );
}

/** Esquema de puertos del Hub: qué se conecta en cada uno de los seis puertos. */
export function HubPorts({ setup }: { setup: HubSetup }) {
  const byPort = new Map(setup.dispositivos.map((device) => [device.puerto, device]));

  return (
    <div>
      <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
        <ul className="order-2 grid gap-3 sm:order-1">
          {LEFT.map((puerto) => (
            <PortRow key={puerto} puerto={puerto} device={byPort.get(puerto)} side="left" />
          ))}
        </ul>
        <div className="order-1 mx-auto sm:order-2">
          <HubIllustration blink={false} className="w-28 drop-shadow-lg sm:w-32" />
        </div>
        <ul className="order-3 grid gap-3">
          {RIGHT.map((puerto) => (
            <PortRow key={puerto} puerto={puerto} device={byPort.get(puerto)} side="right" />
          ))}
        </ul>
      </div>

      {setup.internos.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-extrabold uppercase tracking-wide text-ink-500">
            Dentro del Hub
          </span>
          {setup.internos.map((item) => (
            <span
              key={item}
              className="rounded-full bg-hub-100 px-3 py-1 text-sm font-bold text-ink-900"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {setup.dispositivos.length === 0 ? (
        <p className="mt-4 font-semibold text-ink-600">
          En esta unidad no se conecta nada: solo se usa lo que el Hub lleva dentro.
        </p>
      ) : (
        <p className="mt-4 text-sm font-semibold text-ink-500">
          Conectamos siempre igual: motores en A, B y C; sensor de color en D, de distancia en E y de
          fuerza en F.
        </p>
      )}
    </div>
  );
}
