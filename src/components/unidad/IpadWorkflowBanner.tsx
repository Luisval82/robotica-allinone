import { BluetoothIcon, TabletIcon } from "@/components/ui/icons";

/**
 * Recordatorio del flujo de trabajo en el aula con los iPads. Se enseña
 * justo antes de los dos momentos en los que el alumnado necesita el Hub:
 * el montaje del modelo final (paso 4) y las entregas de programación
 * (dentro de la PRUEBA UD-X).
 */
export function IpadWorkflowBanner() {
  return (
    <div className="grid gap-4 rounded-card border-2 border-spike-200 bg-spike-50 p-5 sm:grid-cols-2 sm:p-6">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-spike-700 sm:col-span-2">
        Con el iPad en clase
      </p>

      <div className="flex items-start gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-spike-700">
          <TabletIcon className="size-5" />
        </span>
        <p className="font-semibold text-ink-700">
          <span className="block font-display text-lg font-semibold text-ink-900">
            1. Consulta esta web
          </span>
          Desde el navegador del iPad: aquí tienes los puertos del Hub, los bloques de palabras y
          el enunciado de la práctica.
        </p>
      </div>

      <div className="flex items-start gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-spike-700">
          <BluetoothIcon className="size-5" />
        </span>
        <p className="font-semibold text-ink-700">
          <span className="block font-display text-lg font-semibold text-ink-900">
            2. Programa en la app SPIKE
          </span>
          Abre la app oficial LEGO® Education SPIKE™ y conecta tu Hub por Bluetooth. Comprueba
          antes el nombre del Hub de tu mesa para no conectarte al de otro grupo.
        </p>
      </div>
    </div>
  );
}
