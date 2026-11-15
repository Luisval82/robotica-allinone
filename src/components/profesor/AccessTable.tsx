import type { ReactNode } from "react";
import { setAccessAction } from "@/actions/profesor";
import { SwitchButton } from "@/components/ui/SwitchButton";
import type { AccessKind, Course } from "@/lib/types";

export interface AccessRow {
  unidad: number;
  titulo: string;
  /** La unidad está abierta. */
  abierta: boolean;
  unidadNota?: string;
  /** Posición del interruptor de la PRUEBA. */
  pruebaMarcada: boolean;
  /** No se puede tocar (unidad bloqueada, o ya abierta por terminar la teoría). */
  pruebaDesactivada: boolean;
  /** Valor que se guarda al pulsar el interruptor de la PRUEBA. */
  pruebaAlPulsar: boolean;
  pruebaNota?: string;
}

type Scope = { ambito: "clase"; curso: Course } | { ambito: "alumno"; alumnoId: string };

function AccessSwitch({
  scope,
  unidad,
  tipo,
  checked,
  alPulsar,
  disabled,
  label,
}: {
  scope: Scope;
  unidad: number;
  tipo: AccessKind;
  checked: boolean;
  alPulsar: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <form action={setAccessAction}>
      <input type="hidden" name="ambito" value={scope.ambito} />
      {scope.ambito === "clase" ? (
        <input type="hidden" name="curso" value={scope.curso} />
      ) : (
        <input type="hidden" name="alumnoId" value={scope.alumnoId} />
      )}
      <input type="hidden" name="unidad" value={unidad} />
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="abrir" value={alPulsar ? "1" : "0"} />
      <SwitchButton checked={checked} disabled={disabled} label={label} />
    </form>
  );
}

function StateCell({
  open,
  note,
  children,
}: {
  open: boolean;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      {children}
      <div className="min-w-0">
        <p className={`text-sm font-extrabold ${open ? "text-spike-700" : "text-ink-500"}`}>
          {open ? "Abierta" : "Bloqueada"}
        </p>
        {note ? <p className="text-xs font-semibold text-ink-500">{note}</p> : null}
      </div>
    </div>
  );
}

/**
 * Tabla de las 9 unidades con dos interruptores por fila: la unidad y su
 * PRUEBA UD-X. `scope` decide si los cambios valen para toda la clase o para
 * un alumno; `quien` se usa en los nombres accesibles de los interruptores.
 */
export function AccessTable({
  rows,
  scope,
  quien,
}: {
  rows: AccessRow[];
  scope: Scope;
  quien: string;
}) {
  return (
    <div className="overflow-x-auto rounded-card bg-white shadow-card">
      <table className="w-full min-w-[44rem] text-left">
        <caption className="sr-only">Unidades y pruebas de {quien}</caption>
        <thead>
          <tr className="border-b-2 border-ink-100 text-xs font-extrabold uppercase tracking-wide text-ink-500">
            <th scope="col" className="px-6 py-4">
              Unidad
            </th>
            <th scope="col" className="px-4 py-4">
              Acceso a la unidad
            </th>
            <th scope="col" className="px-4 py-4">
              PRUEBA UD-X
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.unidad} className="border-b border-ink-100 last:border-b-0">
              <th scope="row" className="px-6 py-3.5">
                <span className="flex items-center gap-3">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl font-display text-lg font-semibold ${
                      row.abierta ? "bg-spike-600 text-white" : "bg-ink-100 text-ink-600"
                    }`}
                  >
                    {row.unidad}
                  </span>
                  <span className="font-bold text-ink-900">{row.titulo}</span>
                </span>
              </th>
              <td className="px-4 py-3.5">
                <StateCell open={row.abierta} note={row.unidadNota}>
                  <AccessSwitch
                    scope={scope}
                    unidad={row.unidad}
                    tipo="unidad"
                    checked={row.abierta}
                    alPulsar={!row.abierta}
                    label={`Unidad ${row.unidad} para ${quien}`}
                  />
                </StateCell>
              </td>
              <td className="px-4 py-3.5">
                <StateCell open={row.abierta && row.pruebaMarcada} note={row.pruebaNota}>
                  <AccessSwitch
                    scope={scope}
                    unidad={row.unidad}
                    tipo="prueba"
                    checked={row.pruebaMarcada}
                    alPulsar={row.pruebaAlPulsar}
                    disabled={row.pruebaDesactivada}
                    label={`PRUEBA UD-${row.unidad} para ${quien}`}
                  />
                </StateCell>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
