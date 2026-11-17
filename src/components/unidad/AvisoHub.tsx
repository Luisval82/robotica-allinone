// El recordatorio de que el programa hay que probarlo de verdad en el robot:
// se monta aquí, pero se ejecuta en la app oficial de SPIKE del iPad, con el
// Hub de la mesa conectado por Bluetooth.

import { BluetoothIcon, ExternalLinkIcon, TabletIcon } from "@/components/ui/icons";
import { LEGO_EDUCATION_URL } from "@/config/site";

const PASOS = [
  "Abre la app LEGO® Education SPIKE™ en tu iPad.",
  "Enciende el Hub de tu mesa con el botón central.",
  "Pulsa el icono del Hub y conéctalo por Bluetooth.",
  "Comprueba que el nombre que aparece es el del Hub de tu mesa, no el de la mesa de al lado.",
  "Monta ahí los mismos bloques y pulsa ▶ para verlo funcionar.",
];

export function AvisoHub() {
  return (
    <aside className="mt-4 rounded-2xl border-2 border-hub-300 bg-hub-50 p-5">
      <p className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-hub-400 text-ink-900">
          <TabletIcon className="size-5" />
        </span>
        Pruébalo en el Hub desde tu iPad
      </p>

      <ol className="mt-3 grid gap-1.5">
        {PASOS.map((paso, index) => (
          <li key={index} className="flex gap-2.5 font-semibold text-ink-800">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-hub-400 text-xs font-extrabold text-ink-900">
              {index + 1}
            </span>
            <span className="min-w-0">{paso}</span>
          </li>
        ))}
      </ol>

      <p className="mt-3 flex items-start gap-2 text-sm font-bold text-ink-700">
        <BluetoothIcon className="mt-0.5 size-4 shrink-0" />
        Si el Hub no aparece, apágalo y vuelve a encenderlo: solo se deja ver un rato.
      </p>

      <p className="mt-3 text-xs font-semibold text-ink-500">
        ¿Estás en un ordenador y no en el iPad?{" "}
        <a
          href={LEGO_EDUCATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-ink-600 underline underline-offset-2 transition hover:text-ink-900"
        >
          Abrir SPIKE en el navegador
          <ExternalLinkIcon className="size-3" />
        </a>
      </p>
    </aside>
  );
}
