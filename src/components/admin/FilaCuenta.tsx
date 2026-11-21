"use client";

// Una cuenta por línea. Nombre, correo, rol, cursos y estado, con un solo
// botón de guardar; lo delicado —activar, desactivar, borrar y el soporte
// sobre el trabajo de un alumno— queda plegado debajo y hay que abrirlo.
//
// Por qué una línea: con 60 cuentas, una tarjeta por persona son siete
// pantallas de scroll para cambiarle el rol a una. Y por qué un solo botón:
// tres botones por fila (rol, datos, cursos) multiplican por tres los clics
// y los sitios donde mirar si se guardó.

import { useActionState } from "react";
import {
  borrarCuentaAction,
  guardarCuentaAction,
  setCuentaActivaAction,
  soporteAlumnoAction,
} from "@/actions/admin";
import { PendingButton } from "@/components/ui/PendingButton";
import {
  COURSES,
  COURSE_LABEL,
  ROLES,
  ROLE_LABEL,
  UNIT_NUMBERS,
  type Course,
  type CuentaFormState,
} from "@/lib/types";

/** Lo que la página manda de cada cuenta. Todo plano: cruza al navegador. */
export interface CuentaEnLista {
  id: string;
  name: string;
  email: string;
  role: (typeof ROLES)[number];
  course: Course | null;
  activa: boolean;
  /** Cursos que imparte este año, si es docente. */
  cursos: Course[];
  /** Entró con Google (no tiene contraseña en la plataforma). */
  conGoogle: boolean;
  /** El alumno ya dijo su nombre y eligió curso. */
  perfilCompleto: boolean;
  /** Ya formateada en el servidor: formatearla aquí rompería la hidratación. */
  creadaEn: string;
  /** La cuenta con la que estás dentro: no te puedes tocar a ti mismo. */
  esTuCuenta: boolean;
  /** Si la tocas, la plataforma se queda sin superadministrador activo. */
  esUnicoSuperadminActivo: boolean;
}

/**
 * Las columnas del listado. La cabecera y las filas usan la misma plantilla
 * para que no se descuadren: si se toca una, se tocan las dos.
 *
 * En pantalla estrecha son tres columnas y el correo baja a su línea; desde
 * `lg` entra todo en una.
 */
const COLUMNAS =
  "grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-1 " +
  "lg:grid-cols-[minmax(7rem,1.1fr)_minmax(0,1.3fr)_7.5rem_minmax(9rem,auto)_minmax(6.5rem,auto)_auto]";

const CAMPO =
  "h-8 w-full min-w-0 rounded-lg border-2 border-ink-200 bg-white px-2 text-sm font-semibold text-ink-900 transition-colors focus:border-spike-500";

const SELECT =
  "h-8 rounded-lg border-2 border-ink-200 bg-white px-1.5 text-sm font-semibold text-ink-900 transition-colors focus:border-spike-500";

export function CabeceraCuentas() {
  return (
    <div
      aria-hidden="true"
      className={`${COLUMNAS} border-b-2 border-ink-100 px-3 py-2 text-[0.65rem] font-extrabold uppercase tracking-widest text-ink-500`}
    >
      <span>Nombre</span>
      <span className="hidden lg:block">Correo de acceso</span>
      <span className="hidden lg:block">Rol</span>
      <span className="hidden lg:block">Curso o cursos</span>
      <span className="hidden lg:block">Estado</span>
      <span className="text-right">Guardar</span>
    </div>
  );
}

/** Mensaje de lo que ha pasado, debajo de la fila. Verde, ámbar o rojo. */
function Resultado({ estado }: { estado: CuentaFormState }) {
  const texto = estado.error ?? estado.hecho ?? estado.aviso;
  if (!texto) return null;

  const tono = estado.error
    ? "bg-red-50 text-nivel-flojo"
    : estado.hecho
      ? "bg-spike-50 text-spike-800"
      : "bg-hub-50 text-hub-700";

  return (
    <p role="status" className={`mt-1 rounded-lg px-2 py-1 text-xs font-bold ${tono}`}>
      {estado.error ? "⚠ " : estado.hecho ? "✓ " : "· "}
      {texto}
      {estado.hecho && estado.aviso ? ` — ${estado.aviso}` : ""}
    </p>
  );
}

export function FilaCuenta({ cuenta }: { cuenta: CuentaEnLista }) {
  const [guardado, guardar] = useActionState<CuentaFormState, FormData>(guardarCuentaAction, {});

  const esDocente = cuenta.role !== "alumno";
  const sinCursos = esDocente && cuenta.cursos.length === 0;
  const sinCurso = cuenta.role === "alumno" && cuenta.course === null;
  const bloqueada = cuenta.esTuCuenta || cuenta.esUnicoSuperadminActivo;

  return (
    <div className={cuenta.activa ? "" : "bg-ink-50"}>
      <form action={guardar} className={`${COLUMNAS} px-3 py-1.5`}>
        <input type="hidden" name="userId" value={cuenta.id} />

        <input
          name="name"
          type="text"
          aria-label={`Nombre de ${cuenta.name || cuenta.email}`}
          defaultValue={cuenta.name}
          maxLength={60}
          className={CAMPO}
        />

        <input
          name="email"
          type="email"
          aria-label={`Correo de ${cuenta.name || cuenta.email}`}
          defaultValue={cuenta.email}
          maxLength={120}
          title={cuenta.email}
          className={`${CAMPO} order-last col-span-3 font-mono text-xs lg:order-none lg:col-span-1`}
        />

        {/* Un desplegable desactivado no se envía, así que cuando el rol no
            se puede tocar va además en un campo oculto: si no, guardar esta
            fila para corregir el nombre llegaría al servidor sin rol. */}
        {bloqueada ? <input type="hidden" name="role" value={cuenta.role} /> : null}
        <select
          name="role"
          aria-label={`Rol de ${cuenta.name || cuenta.email}`}
          defaultValue={cuenta.role}
          disabled={bloqueada}
          title={
            bloqueada
              ? cuenta.esTuCuenta
                ? "Tu propio rol lo cambia otro superadministrador."
                : "Es el único superadministrador activo."
              : undefined
          }
          className={`${SELECT} disabled:bg-ink-100 disabled:text-ink-500`}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABEL[role]}
            </option>
          ))}
        </select>

        {/* El alumno tiene UN curso; el docente, los que imparte. */}
        {cuenta.role === "alumno" ? (
          <select
            name="course"
            aria-label={`Curso de ${cuenta.name || cuenta.email}`}
            defaultValue={cuenta.course ?? ""}
            className={`${SELECT} ${sinCurso ? "border-nivel-regular" : ""}`}
          >
            <option value="">Sin curso</option>
            {COURSES.map((course) => (
              <option key={course} value={course}>
                {COURSE_LABEL[course]}
              </option>
            ))}
          </select>
        ) : (
          <fieldset className="flex flex-wrap items-center gap-1">
            <legend className="sr-only">Cursos que imparte {cuenta.name}</legend>
            {COURSES.map((course) => (
              <label
                key={course}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border-2 border-ink-200 bg-white px-1.5 py-0.5 text-xs font-bold text-ink-800 transition-colors has-checked:border-spike-500 has-checked:bg-spike-50 has-checked:text-spike-800"
              >
                <input
                  type="checkbox"
                  name="cursos"
                  value={course}
                  defaultChecked={cuenta.cursos.includes(course)}
                  className="size-3.5 accent-spike-600"
                />
                {course.replace("ESO", "")}
              </label>
            ))}
          </fieldset>
        )}

        <div className="flex items-center gap-1">
          <span
            className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide ${
              cuenta.activa ? "bg-spike-100 text-spike-800" : "bg-ink-200 text-ink-700"
            }`}
          >
            {cuenta.activa ? "Activa" : "Inactiva"}
          </span>
          {sinCursos ? (
            <span
              title="Docente sin ningún curso asignado: ve todos, con un aviso en su panel."
              className="whitespace-nowrap rounded-full bg-hub-100 px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide text-hub-700"
            >
              Sin cursos
            </span>
          ) : null}
          {sinCurso ? (
            <span
              title="Ha entrado pero todavía no ha elegido curso."
              className="whitespace-nowrap rounded-full bg-hub-100 px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide text-hub-700"
            >
              Sin curso
            </span>
          ) : null}
        </div>

        <PendingButton size="compacto" pendingLabel="…">
          Guardar
        </PendingButton>
      </form>

      <div className="px-3 pb-1">
        <Resultado estado={guardado} />
      </div>

      {/* Lo delicado va plegado y FUERA del formulario de arriba: un
          formulario dentro de otro no es válido en HTML. */}
      <DetalleCuenta cuenta={cuenta} />
    </div>
  );
}

/** Ficha de la cuenta y acciones delicadas. Plegada hasta que se abre. */
function DetalleCuenta({ cuenta }: { cuenta: CuentaEnLista }) {
  const [estadoActiva, cambiarActiva] = useActionState<CuentaFormState, FormData>(
    setCuentaActivaAction,
    {},
  );
  const [estadoBorrado, borrar] = useActionState<CuentaFormState, FormData>(
    borrarCuentaAction,
    {},
  );
  const [estadoSoporte, soporte] = useActionState<CuentaFormState, FormData>(
    soporteAlumnoAction,
    {},
  );

  return (
    <details className="px-3 pb-2">
      <summary className="cursor-pointer text-xs font-bold text-ink-500 hover:text-ink-900">
        Cuenta y soporte
      </summary>

      <div className="mt-2 grid gap-3 rounded-xl bg-ink-50 p-3 md:grid-cols-2">
        {/* ── Ficha ───────────────────────────────────────────────────── */}
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
          <dt className="font-extrabold uppercase tracking-wide text-ink-500">Entra con</dt>
          <dd className="font-semibold text-ink-800">
            {cuenta.conGoogle ? "Google (cuenta del colegio)" : "Correo y contraseña"}
          </dd>

          <dt className="font-extrabold uppercase tracking-wide text-ink-500">Rol</dt>
          <dd className="font-semibold text-ink-800">{ROLE_LABEL[cuenta.role]}</dd>

          <dt className="font-extrabold uppercase tracking-wide text-ink-500">
            {cuenta.role === "alumno" ? "Curso" : "Imparte"}
          </dt>
          <dd className="font-semibold text-ink-800">
            {cuenta.role === "alumno"
              ? cuenta.course
                ? COURSE_LABEL[cuenta.course]
                : "Sin elegir todavía"
              : cuenta.cursos.length > 0
                ? cuenta.cursos.map((c) => COURSE_LABEL[c]).join(", ")
                : "Ningún curso asignado"}
          </dd>

          <dt className="font-extrabold uppercase tracking-wide text-ink-500">Estado</dt>
          <dd className="font-semibold text-ink-800">
            {cuenta.activa ? "Activa: puede entrar" : "Desactivada: no puede entrar"}
            {cuenta.role === "alumno" && !cuenta.perfilCompleto
              ? " · perfil sin completar"
              : ""}
          </dd>

          <dt className="font-extrabold uppercase tracking-wide text-ink-500">Alta</dt>
          <dd className="font-semibold text-ink-800">{cuenta.creadaEn}</dd>
        </dl>

        {/* ── Activar o desactivar ────────────────────────────────────── */}
        <div className="rounded-lg border-2 border-ink-200 bg-white p-2.5">
          <h4 className="font-display text-sm font-semibold text-ink-900">
            {cuenta.activa ? "Desactivar la cuenta" : "Activar la cuenta"}
          </h4>
          <p className="mt-1 text-xs font-semibold text-ink-600">
            {cuenta.activa
              ? "No podrá entrar y se le cerrará la sesión que tenga abierta. Su trabajo se queda entero y se puede volver a activar cuando haga falta."
              : "Volverá a poder entrar con su correo de siempre, con todo su trabajo como lo dejó."}
          </p>

          {cuenta.esTuCuenta ? (
            <p className="mt-2 text-xs font-bold text-ink-500">
              Es tu cuenta: tiene que hacerlo otro superadministrador.
            </p>
          ) : cuenta.activa && cuenta.esUnicoSuperadminActivo ? (
            <p className="mt-2 text-xs font-bold text-ink-500">
              Es el único superadministrador activo. Da el rol a otra cuenta antes.
            </p>
          ) : (
            <form action={cambiarActiva} className="mt-2">
              <input type="hidden" name="userId" value={cuenta.id} />
              <input type="hidden" name="activa" value={cuenta.activa ? "0" : "1"} />
              <PendingButton
                size="compacto"
                tone={cuenta.activa ? "danger" : "primary"}
                pendingLabel="…"
              >
                {cuenta.activa ? "Sí, desactivar" : "Sí, activar"}
              </PendingButton>
            </form>
          )}
          <Resultado estado={estadoActiva} />
        </div>

        {/* ── Soporte sobre el trabajo del alumno ─────────────────────── */}
        {cuenta.role === "alumno" ? (
          <div className="rounded-lg border-2 border-ink-200 bg-white p-2.5">
            <h4 className="font-display text-sm font-semibold text-ink-900">
              Desatascar una unidad
            </h4>
            <p className="mt-1 text-xs font-semibold text-ink-600">
              Para un caso concreto: una práctica que dio por comprobada sin querer, o un test
              que se le envió solo. No toca los interruptores de la clase.
            </p>
            <form action={soporte} className="mt-2 flex flex-wrap items-center gap-1.5">
              <input type="hidden" name="userId" value={cuenta.id} />
              <label className="text-xs font-bold text-ink-700">
                <span className="sr-only">Unidad</span>
                <select name="unidad" defaultValue="1" className={SELECT}>
                  {UNIT_NUMBERS.map((n) => (
                    <option key={n} value={n}>
                      UD {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-ink-700">
                <span className="sr-only">Qué desatascar</span>
                <select name="que" defaultValue="practica" className={SELECT}>
                  <option value="practica">Reabrir práctica</option>
                  <option value="test">Borrar el test</option>
                </select>
              </label>
              <label className="text-xs font-bold text-ink-700">
                <span className="sr-only">Número de práctica</span>
                <select name="practica" defaultValue="1" className={SELECT}>
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      Práctica {n}
                    </option>
                  ))}
                </select>
              </label>
              <PendingButton size="compacto" tone="neutral" pendingLabel="…">
                Aplicar
              </PendingButton>
            </form>
            <Resultado estado={estadoSoporte} />
          </div>
        ) : null}

        {/* ── Borrar ──────────────────────────────────────────────────── */}
        <div className="rounded-lg border-2 border-nivel-flojo bg-white p-2.5">
          <h4 className="font-display text-sm font-semibold text-ink-900">
            Borrar la cuenta de prueba
          </h4>
          <p className="mt-1 text-xs font-semibold text-ink-600">
            Se va la cuenta y con ella sus entregas, sus prácticas y su progreso. No se puede
            deshacer. Si la persona existe de verdad y solo se ha ido del centro, desactívala en
            lugar de borrarla.
          </p>

          {cuenta.esTuCuenta ? (
            <p className="mt-2 text-xs font-bold text-ink-500">Tu cuenta no se borra desde aquí.</p>
          ) : cuenta.role === "superadmin" ? (
            <p className="mt-2 text-xs font-bold text-ink-500">
              Una cuenta de superadministrador no se borra desde el panel. Pásala antes a Profesor
              o Alumno.
            </p>
          ) : (
            <form action={borrar} className="mt-2 flex flex-wrap items-end gap-1.5">
              <input type="hidden" name="userId" value={cuenta.id} />
              <input type="hidden" name="email" value={cuenta.email} />
              <label className="min-w-0 flex-1 text-xs font-bold text-ink-700">
                Escribe «{cuenta.email}» para confirmar
                <input
                  name="confirmacion"
                  type="text"
                  autoComplete="off"
                  placeholder={cuenta.email}
                  className={`${CAMPO} mt-0.5 font-mono text-xs`}
                />
              </label>
              <PendingButton size="compacto" tone="danger" pendingLabel="Borrando…">
                Borrar
              </PendingButton>
            </form>
          )}
          <Resultado estado={estadoBorrado} />
        </div>
      </div>
    </details>
  );
}
