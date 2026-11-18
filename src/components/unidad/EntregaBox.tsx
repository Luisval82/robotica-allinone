"use client";

import { useActionState, useRef, useState, type ReactNode } from "react";
import { submitEntregaAction } from "@/actions/alumno";
import { BlockPartIcon } from "@/components/brand/BlockParts";
import { BotonSpike } from "@/components/unidad/BotonSpike";
import { EditorBloques } from "@/components/unidad/EditorBloques";
import { MesaSegura } from "@/components/unidad/MesaSegura";
import { ProgramBlocks } from "@/components/brand/ProgramBlocks";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CloseIcon,
} from "@/components/ui/icons";
import {
  blockClass,
  defaultValues,
  getBlockInfo,
  isKnownBlock,
  type BlockInfo,
} from "@/lib/bloques";
import { formatNota } from "@/lib/format";
import { CheckIcon, LockIcon } from "@/components/ui/icons";
import type { ProgramRow, StudentFormState } from "@/lib/types";

const EMPTY_STATE: StudentFormState = {};
const MAX_ROWS = 40;
const MAX_LEVEL = 5;

export interface EntregaView {
  bloques: ProgramRow[];
  explicacion: string;
  /** Fecha ya formateada, p. ej. «12 nov, 11:05». */
  entregadaEn: string;
  nota: number | null;
  comentario: string;
  corregidaPor: string | null;
}

/** La solución de ejemplo que se enseña al comprobar una práctica. */
export interface SolucionView {
  bloques: ProgramRow[];
  notas: string;
}

interface Row {
  key: number;
  texto: string;
  valor: string;
  /** Un valor por cada desplegable y hueco del bloque, en su orden. */
  valores: string[];
  nivel: number;
}

/** Los huecos y desplegables de un bloque, para que el alumno los rellene. */
function RowParts({
  info,
  valores,
  onChange,
  etiqueta,
}: {
  info: BlockInfo;
  valores: string[];
  onChange: (indice: number, valor: string) => void;
  etiqueta: string;
}) {
  let hueco = -1;
  return (
    <span className="word-block__fila">
      {(info.partes ?? []).map((parte, index) => {
        if (parte.t === "icono") return <BlockPartIcon key={index} nombre={parte.v} />;
        if (parte.t === "palabra") return <span key={index}>{parte.v}</span>;

        hueco += 1;
        const posicion = hueco;
        const valor = valores[posicion] ?? parte.v;
        const aria = `${etiqueta}: ${parte.t === "menu" ? "opción" : "valor"} ${posicion + 1}`;

        if (parte.t === "menu" && parte.opciones) {
          return (
            <select
              key={index}
              value={valor}
              aria-label={aria}
              onChange={(event) => onChange(posicion, event.target.value)}
              className="word-block__menu appearance-none pr-1 text-inherit"
            >
              {parte.opciones.map((opcion) => (
                <option key={opcion} value={opcion} className="text-ink-900">
                  {opcion}
                </option>
              ))}
            </select>
          );
        }

        return (
          <input
            key={index}
            type="text"
            value={valor}
            aria-label={aria}
            maxLength={24}
            size={Math.max(2, valor.length)}
            onChange={(event) => onChange(posicion, event.target.value)}
            className={parte.t === "menu" ? "word-block__menu" : "word-block__hueco"}
          />
        );
      })}
    </span>
  );
}

function RowButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-8 place-items-center rounded-lg text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function PaletteButton({ info, onAdd }: { info: BlockInfo; onAdd: (texto: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onAdd(info.texto)}
      className={`${blockClass(info)} word-block--suelto text-left text-sm transition-transform hover:-translate-y-0.5 active:translate-y-0`}
    >
      <span aria-hidden="true">+ </span>
      <span className="sr-only">Añadir </span>
      {info.texto}
    </button>
  );
}

/**
 * Caja de entrega de una práctica de programación. El alumno compone su
 * programa eligiendo bloques de palabras y rellenando sus huecos.
 *
 * Hay dos maneras de cerrarla, y las dos son definitivas:
 *  · En una práctica intermedia, con «Guardar y comprobar»: se queda cerrada
 *    y aparece al lado la solución de ejemplo para comparar.
 *  · En las dos entregas de la PRUEBA, al entregar: se queda cerrada y la
 *    solución NO se enseña, porque esa la corrige el profesor con nota.
 *
 * Las dos piden confirmación antes de cerrar: un clic de más no puede dejar
 * a un alumno sin poder cambiar su programa.
 */
export function EntregaBox({
  unidad,
  practica,
  titulo,
  enunciado,
  paleta,
  entrega,
  etiqueta,
  accion = submitEntregaAction,
  textoBoton = "Entregar",
  textoGuardado = "Puedes cambiarla hasta que tu profesor la corrija.",
  extra,
  bloqueada = false,
  solucion,
  permiteComprobar = false,
  textoCerrada = "Entregada",
  bloquesTaller,
}: {
  unidad: number;
  practica: number;
  titulo: string;
  enunciado: string;
  paleta: { propios: BlockInfo[]; anteriores: BlockInfo[]; huecos: BlockInfo[] };
  entrega: EntregaView | null;
  /** Lo que va encima del título: «Entrega 1 de 2», «Práctica 1 de 4»… */
  etiqueta?: string;
  /** Qué acción guarda el programa. Por defecto, la entrega de la PRUEBA. */
  accion?: typeof submitEntregaAction;
  textoBoton?: string;
  /** Lo que se dice bajo el botón una vez guardada. */
  textoGuardado?: string;
  /** Se pinta bajo el enunciado: el aviso de probarlo en el Hub, por ejemplo. */
  extra?: ReactNode;
  /** Cerrada: ni se puede cambiar ni se puede volver a enviar. */
  bloqueada?: boolean;
  /** Si viene, se enseña al lado del programa del alumno cuando está cerrada. */
  solucion?: SolucionView;
  /** Añade el botón «Guardar y comprobar» junto al de guardar borrador. */
  permiteComprobar?: boolean;
  /** Cómo se llama el estado cerrado: «Comprobada», «Entregada»… */
  textoCerrada?: string;
  /** Los bloques del cajón de la mesa. Sin esto, la paleta entera. */
  bloquesTaller?: string[];
}) {
  const [state, formAction, pending] = useActionState(accion, EMPTY_STATE);
  const nextKey = useRef(entrega?.bloques.length ?? 0);
  const [rows, setRows] = useState<Row[]>(() =>
    (entrega?.bloques ?? []).map((row, index) => ({
      key: index,
      texto: row.texto,
      valor: row.valor ?? "",
      valores: row.valores ?? defaultValues(getBlockInfo(row.texto)),
      nivel: row.nivel,
    })),
  );
  const [explicacion, setExplicacion] = useState(entrega?.explicacion ?? "");
  const [confirmando, setConfirmando] = useState(false);
  // La mesa de bloques es lo primero que se ve; la lista queda de reserva,
  // para teclado y por si la mesa no abriera.
  const [modo, setModo] = useState<"mesa" | "lista">("mesa");
  const [montaje, setMontaje] = useState(0);
  const id = `entrega-${unidad}-${practica}`;
  const corregida = entrega !== null && entrega.nota !== null;

  const head = (
    <>
      <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
        {etiqueta ?? `Entrega ${practica} de 2`}
      </p>
      <h4 className="mt-1 font-display text-2xl font-semibold text-ink-900">{titulo}</h4>
      <p className="mt-2 font-semibold text-ink-700">{enunciado}</p>
      <BotonSpike />
      {extra}
    </>
  );

  // ── Ya corregida: solo lectura, con la nota y el comentario del profesor ──
  if (entrega && corregida) {
    return (
      <article className="rounded-2xl border-2 border-ink-100 p-5 sm:p-6">
        {head}
        <div className="mt-5 overflow-x-auto rounded-2xl bg-ink-50 p-4">
          <ProgramBlocks rows={entrega.bloques} label={`Tu programa: ${titulo}`} />
        </div>
        <div className="mt-5 flex flex-wrap items-start gap-x-6 gap-y-3 rounded-2xl bg-spike-50 p-5">
          <p className="font-display text-5xl font-semibold leading-none text-spike-700">
            {formatNota(entrega.nota)}
          </p>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold text-ink-900">
              Corregida{entrega.corregidaPor ? ` por ${entrega.corregidaPor}` : ""}
            </p>
            <p className="mt-1 font-semibold text-ink-700">
              {entrega.comentario || "Sin comentario."}
            </p>
          </div>
        </div>
      </article>
    );
  }

  // ── Cerrada: el programa que dejó el alumno y, si la hay, la solución ──
  if (entrega && bloqueada) {
    return (
      <article className="rounded-2xl border-2 border-spike-200 p-5 sm:p-6">
        {head}

        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-spike-600 px-4 py-1.5 text-sm font-extrabold text-white">
          <CheckIcon className="size-4" />
          {textoCerrada} el {entrega.entregadaEn}
        </p>

        <div
          className={`mt-4 grid gap-5 ${solucion ? "lg:grid-cols-2" : ""}`}
        >
          <div className="min-w-0">
            <h5 className="mb-2 flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-ink-500">
              <LockIcon className="size-4" />
              Tu programa
            </h5>
            {/* El mismo lienzo, pero cerrado: se puede mirar y mover, no tocar. */}
            <MesaSegura
              alFallar={
                <div className="overflow-x-auto rounded-2xl bg-ink-50 p-4">
                  <ProgramBlocks rows={entrega.bloques} label={`Tu programa: ${titulo}`} />
                </div>
              }
            >
              <EditorBloques
                bloques={[]}
                filas={entrega.bloques}
                soloLectura
                alto={340}
                etiqueta={`Tu programa, ya comprobado: ${titulo}`}
              />
            </MesaSegura>
            {entrega.explicacion ? (
              <p className="mt-2 text-sm font-semibold text-ink-600">
                Lo explicaste así: {entrega.explicacion}
              </p>
            ) : null}
          </div>

          {solucion ? (
            <div className="min-w-0">
              <h5 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-spike-700">
                Solución de ejemplo
              </h5>
              <MesaSegura
                alFallar={
                  <div className="overflow-x-auto rounded-2xl bg-spike-50 p-4">
                    <ProgramBlocks rows={solucion.bloques} label={`Solución de ejemplo: ${titulo}`} />
                  </div>
                }
              >
                <EditorBloques
                  bloques={[]}
                  filas={solucion.bloques}
                  soloLectura
                  alto={340}
                  etiqueta={`Solución de ejemplo: ${titulo}`}
                />
              </MesaSegura>
              <p className="mt-2 text-sm font-bold text-spike-800">{solucion.notas}</p>
              <p className="mt-1.5 text-sm font-semibold text-ink-500">
                Es UN ejemplo que funciona, no la única respuesta: si el tuyo hace lo mismo con
                otros bloques, también está bien. Compara el orden y los valores.
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-ink-500">
              Tu profesor la corregirá y verás aquí la nota y su comentario.
            </p>
          )}
        </div>
      </article>
    );
  }

  // ── Composición del programa ──
  function add(texto: string) {
    const key = nextKey.current;
    nextKey.current += 1;
    setRows((current) => {
      if (current.length >= MAX_ROWS) return current;
      const last = current[current.length - 1];
      const valores = defaultValues(getBlockInfo(texto));
      return [...current, { key, texto, valor: "", valores, nivel: last ? last.nivel : 0 }];
    });
  }

  function patch(index: number, changes: Partial<Row>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...changes } : row)));
  }

  function move(index: number, delta: number) {
    setRows((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  function remove(index: number) {
    setRows((current) => current.filter((_, i) => i !== index));
  }

  const filas: ProgramRow[] = rows.map(({ texto, valor, valores, nivel }) =>
    getBlockInfo(texto).partes
      ? { texto, valores, nivel }
      : { texto, valor: valor.trim(), nivel },
  );
  const programa = JSON.stringify(filas);

  /** Lo que el alumno monta en la mesa, traído a la lista de bloques. */
  function deLaMesa(nuevas: ProgramRow[]) {
    const limpias = nuevas.filter((fila) => isKnownBlock(fila.texto));
    setRows(
      limpias.map((fila, indice) => ({
        key: indice,
        texto: fila.texto,
        valor: fila.valor ?? "",
        valores: fila.valores ?? defaultValues(getBlockInfo(fila.texto)),
        nivel: fila.nivel,
      })),
    );
    nextKey.current = limpias.length;
  }

  const bloquesMesa =
    bloquesTaller ??
    [...paleta.propios, ...paleta.anteriores].map((info) => info.texto);

  return (
    <article className="rounded-2xl border-2 border-ink-100 p-5 sm:p-6">
      {head}

      <form action={formAction} className="mt-5 grid gap-5">
        <input type="hidden" name="unidad" value={unidad} />
        <input type="hidden" name="practica" value={practica} />
        <input type="hidden" name="programa" value={programa} />

        {modo === "mesa" ? (
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h5 className="text-sm font-extrabold uppercase tracking-wide text-ink-500">
                Tu programa
              </h5>
              <button
                type="button"
                onClick={() => setModo("lista")}
                className="text-sm font-extrabold text-spike-700 underline underline-offset-2 transition hover:text-spike-800"
              >
                Montarlo con la lista
              </button>
            </div>
            <MesaSegura
              alFallar={
                <p className="rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50 p-5 font-bold text-ink-700">
                  La mesa de bloques se ha quedado atascada. Pulsa «Montarlo con la lista», aquí
                  arriba: tu programa sigue guardado y se monta igual.
                </p>
              }
            >
              <EditorBloques
                key={`mesa-${montaje}`}
                bloques={bloquesMesa}
                filas={filas}
                onChange={deLaMesa}
                alto={500}
                etiqueta={`Mesa de bloques: ${titulo}`}
              />
            </MesaSegura>
            <p className="mt-2 text-sm font-semibold text-ink-500">
              Arrastra los bloques del cajón de la izquierda al lienzo y encájalos unos con otros.
              Toca un desplegable para cambiar el puerto, los segundos o el color. Abajo a la
              derecha tienes acercar, alejar, centrar y la papelera.
            </p>
          </div>
        ) : (
        <>
        <div>
          <h5 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-500">
            Tu programa
          </h5>
          {rows.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-ink-300 p-5 font-semibold text-ink-600">
              Pulsa un bloque de la lista de abajo para empezar tu programa.
            </p>
          ) : (
            <ol className="grid gap-1.5 overflow-x-auto rounded-2xl bg-ink-50 p-4">
              {rows.map((row, index) => {
                const info = getBlockInfo(row.texto);
                return (
                  <li
                    key={row.key}
                    className="flex min-w-max items-center gap-2"
                    style={{ paddingLeft: `${row.nivel * 1.75}rem` }}
                  >
                    <span
                      className={`${blockClass(info)} word-block--suelto flex items-center gap-2 text-sm`}
                    >
                      {info.partes ? (
                        <RowParts
                          info={info}
                          valores={row.valores}
                          etiqueta={`Bloque ${index + 1}: ${row.texto}`}
                          onChange={(posicion, valor) =>
                            patch(index, {
                              valores: row.valores.map((v, i) => (i === posicion ? valor : v)),
                            })
                          }
                        />
                      ) : (
                        <>
                          {row.texto}
                          <input
                            type="text"
                            value={row.valor}
                            onChange={(event) => patch(index, { valor: event.target.value })}
                            maxLength={60}
                            size={Math.max(6, row.valor.length + 1)}
                            placeholder="valor"
                            aria-label={`Valor del bloque ${index + 1}: ${row.texto}`}
                            className="rounded-full bg-white px-3 py-0.5 font-bold text-ink-900 placeholder:font-normal placeholder:text-ink-400"
                          />
                        </>
                      )}
                    </span>
                    <span className="flex items-center">
                      <RowButton
                        label={`Subir el bloque ${index + 1}`}
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                      >
                        <ArrowUpIcon className="size-4" />
                      </RowButton>
                      <RowButton
                        label={`Bajar el bloque ${index + 1}`}
                        onClick={() => move(index, 1)}
                        disabled={index === rows.length - 1}
                      >
                        <ArrowDownIcon className="size-4" />
                      </RowButton>
                      <RowButton
                        label={`Sacar el bloque ${index + 1} un nivel`}
                        onClick={() => patch(index, { nivel: row.nivel - 1 })}
                        disabled={row.nivel === 0}
                      >
                        <ArrowLeftIcon className="size-4" />
                      </RowButton>
                      <RowButton
                        label={`Meter el bloque ${index + 1} dentro del anterior`}
                        onClick={() => patch(index, { nivel: row.nivel + 1 })}
                        disabled={row.nivel >= MAX_LEVEL}
                      >
                        <ArrowRightIcon className="size-4" />
                      </RowButton>
                      <RowButton label={`Quitar el bloque ${index + 1}`} onClick={() => remove(index)}>
                        <CloseIcon className="size-4" />
                      </RowButton>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
          <p className="mt-2 text-sm font-semibold text-ink-500">
            Escribe en el hueco blanco el puerto, los segundos, el color… Con las flechas ← → metes
            un bloque dentro de un bucle o de una condición.
          </p>
        </div>

        <div>
          <h5 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-500">
            Bloques de esta unidad
          </h5>
          <div className="flex flex-wrap gap-2">
            {paleta.propios.map((info) => (
              <PaletteButton key={info.texto} info={info} onAdd={add} />
            ))}
          </div>

          {paleta.anteriores.length > 0 ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-extrabold text-spike-700">
                Bloques de unidades anteriores ({paleta.anteriores.length})
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {paleta.anteriores.map((info) => (
                  <PaletteButton key={info.texto} info={info} onAdd={add} />
                ))}
              </div>
            </details>
          ) : null}

          {paleta.huecos.length > 0 ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-extrabold text-spike-700">
                Datos y preguntas para escribir en los huecos ({paleta.huecos.length})
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {paleta.huecos.map((info) => (
                  <span key={info.texto} className={`${blockClass(info)} text-sm`}>
                    {info.texto}
                  </span>
                ))}
              </div>
            </details>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setMontaje((n) => n + 1);
              setModo("mesa");
            }}
            className="mt-4 text-sm font-extrabold text-spike-700 underline underline-offset-2 transition hover:text-spike-800"
          >
            Volver a la mesa de bloques
          </button>
        </div>
        </>
        )}

        <div>
          <label
            htmlFor={`${id}-explicacion`}
            className="mb-1.5 block text-sm font-extrabold text-ink-800"
          >
            Explica tu programa (opcional)
          </label>
          <textarea
            id={`${id}-explicacion`}
            name="explicacion"
            rows={2}
            maxLength={500}
            value={explicacion}
            onChange={(event) => setExplicacion(event.target.value)}
            placeholder="Qué hace, qué te ha costado o qué cambiarías."
            className="w-full rounded-2xl border-2 border-ink-200 bg-white px-4 py-3 font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:border-spike-500"
          />
        </div>

        {/* Cerrar es definitivo, así que se pregunta antes. */}
        {confirmando ? (
          <div className="rounded-2xl border-2 border-hub-300 bg-hub-50 p-5">
            <p className="font-display text-lg font-semibold text-ink-900">
              {permiteComprobar
                ? "¿Comprobar ya esta práctica?"
                : "¿Entregar ya esta práctica?"}
            </p>
            <p className="mt-1 font-semibold text-ink-700">
              {permiteComprobar
                ? "Se guarda tal y como está y no podrás volver a cambiarla. Después verás la solución de ejemplo para compararla con la tuya."
                : "Se entrega tal y como está y no podrás volver a cambiarla. La corregirá tu profesor."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                name="comprobar"
                value="1"
                disabled={pending}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-spike-600 px-6 font-display text-base font-semibold tracking-wide text-white shadow-press-spike transition hover:bg-spike-700 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-60"
              >
                {pending ? "Guardando…" : permiteComprobar ? "Sí, comprobar" : "Sí, entregar"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-extrabold text-ink-700 transition hover:bg-white"
              >
                No, sigo montándola
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            disabled={pending || rows.length === 0 || confirmando}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-spike-600 px-6 font-display text-base font-semibold tracking-wide text-white shadow-press-spike transition hover:bg-spike-700 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {permiteComprobar ? "Guardar y comprobar" : `${textoBoton} programa`}
          </button>

          {permiteComprobar ? (
            <button
              type="submit"
              disabled={pending || rows.length === 0}
              className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-ink-200 bg-white px-5 font-display text-base font-semibold text-ink-800 transition hover:border-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar borrador"}
            </button>
          ) : null}

          {state.error ? (
            <p role="alert" className="text-sm font-bold text-red-700">
              {state.error}
            </p>
          ) : entrega ? (
            <p role="status" className="text-sm font-bold text-spike-700">
              Guardada el {entrega.entregadaEn}. {textoGuardado}
            </p>
          ) : (
            <p className="text-sm font-semibold text-ink-500">Todavía no has entregado nada.</p>
          )}
        </div>
      </form>
    </article>
  );
}
