"use client";

// El listado de cuentas con su buscador, sus filtros y sus contadores.
//
// El filtrado es en el navegador, sobre la lista que ya ha llegado: con las
// cuentas de un centro (decenas, no miles) se nota al teclear y no hay que
// esperar a que el servidor vuelva a pintar la página. Si algún día esto
// fuera un centro de miles de cuentas, el filtro tendría que pasar a la
// consulta y paginarse.

import { useMemo, useState } from "react";
import { CabeceraCuentas, FilaCuenta, type CuentaEnLista } from "@/components/admin/FilaCuenta";
import { COURSES, COURSE_LABEL, ROLES, type Course, type Role } from "@/lib/types";

type FiltroRol = "todos" | Role;
type FiltroCurso = "todos" | Course | "sin-curso";

const ROL_PLURAL: Record<Role, string> = {
  superadmin: "Superadmins",
  profesor: "Profesores",
  alumno: "Alumnos",
};

/** Quita tildes y pasa a minúsculas: buscar «nuñez» encuentra «Núñez». */
function sinTildes(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const CHIP =
  "inline-flex h-8 cursor-pointer items-center rounded-xl border-2 px-2.5 text-xs font-extrabold transition-colors";
const CHIP_OFF = "border-ink-200 bg-white text-ink-700 hover:border-ink-900";
const CHIP_ON = "border-spike-600 bg-spike-600 text-white";

function Contador({
  rotulo,
  valor,
  aviso,
}: {
  rotulo: string;
  valor: number;
  aviso?: boolean;
}) {
  return (
    <div
      className={`rounded-card bg-white px-4 py-3 shadow-card ${
        aviso && valor > 0 ? "ring-2 ring-nivel-regular" : ""
      }`}
    >
      <dt className="text-[0.65rem] font-extrabold uppercase tracking-widest text-ink-500">
        {rotulo}
      </dt>
      <dd className="font-display text-3xl font-semibold text-ink-900">{valor}</dd>
    </div>
  );
}

export function PanelCuentas({ cuentas }: { cuentas: CuentaEnLista[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [rol, setRol] = useState<FiltroRol>("todos");
  const [curso, setCurso] = useState<FiltroCurso>("todos");

  const resumen = useMemo(
    () => ({
      total: cuentas.length,
      profesores: cuentas.filter((c) => c.role === "profesor").length,
      alumnos: cuentas.filter((c) => c.role === "alumno").length,
      superadmins: cuentas.filter((c) => c.role === "superadmin").length,
      sinCursos: cuentas.filter((c) => c.role !== "alumno" && c.cursos.length === 0).length,
      inactivas: cuentas.filter((c) => !c.activa).length,
    }),
    [cuentas],
  );

  const visibles = useMemo(() => {
    const aguja = sinTildes(busqueda.trim());
    return cuentas.filter((cuenta) => {
      if (rol !== "todos" && cuenta.role !== rol) return false;

      if (curso === "sin-curso") {
        // «Sin curso» es el alumno que no ha elegido y el docente sin asignar:
        // los dos casos que hay que resolver, en un solo filtro.
        const pendiente =
          cuenta.role === "alumno" ? cuenta.course === null : cuenta.cursos.length === 0;
        if (!pendiente) return false;
      } else if (curso !== "todos") {
        const tiene =
          cuenta.role === "alumno" ? cuenta.course === curso : cuenta.cursos.includes(curso);
        if (!tiene) return false;
      }

      if (aguja === "") return true;
      return sinTildes(`${cuenta.name} ${cuenta.email}`).includes(aguja);
    });
  }, [cuentas, busqueda, rol, curso]);

  return (
    <>
      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Contador rotulo="Cuentas" valor={resumen.total} />
        <Contador rotulo="Profesores" valor={resumen.profesores} />
        <Contador rotulo="Alumnos" valor={resumen.alumnos} />
        <Contador rotulo="Superadmins" valor={resumen.superadmins} />
        <Contador rotulo="Docentes sin cursos" valor={resumen.sinCursos} aviso />
        <Contador rotulo="Desactivadas" valor={resumen.inactivas} aviso />
      </dl>

      <section
        aria-labelledby="listado-cuentas"
        className="mt-6 overflow-hidden rounded-card bg-white shadow-card"
      >
        <div className="border-b-2 border-ink-100 p-3">
          <h2 id="listado-cuentas" className="sr-only">
            Listado de cuentas
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <label className="min-w-[14rem] flex-1">
              <span className="sr-only">Buscar por nombre o correo</span>
              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar por nombre o correo…"
                className="h-9 w-full rounded-xl border-2 border-ink-200 bg-white px-3 text-sm font-semibold text-ink-900 transition-colors focus:border-spike-500"
              />
            </label>

            <fieldset className="flex flex-wrap items-center gap-1.5">
              <legend className="sr-only">Filtrar por rol</legend>
              <button
                type="button"
                onClick={() => setRol("todos")}
                aria-pressed={rol === "todos"}
                className={`${CHIP} ${rol === "todos" ? CHIP_ON : CHIP_OFF}`}
              >
                Todos
              </button>
              {ROLES.map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setRol(valor)}
                  aria-pressed={rol === valor}
                  className={`${CHIP} ${rol === valor ? CHIP_ON : CHIP_OFF}`}
                >
                  {ROL_PLURAL[valor]}
                </button>
              ))}
            </fieldset>

            <fieldset className="flex flex-wrap items-center gap-1.5">
              <legend className="sr-only">Filtrar por curso</legend>
              <button
                type="button"
                onClick={() => setCurso("todos")}
                aria-pressed={curso === "todos"}
                className={`${CHIP} ${curso === "todos" ? CHIP_ON : CHIP_OFF}`}
              >
                Todo
              </button>
              {COURSES.map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setCurso(valor)}
                  aria-pressed={curso === valor}
                  className={`${CHIP} ${curso === valor ? CHIP_ON : CHIP_OFF}`}
                >
                  {COURSE_LABEL[valor]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurso("sin-curso")}
                aria-pressed={curso === "sin-curso"}
                className={`${CHIP} ${curso === "sin-curso" ? CHIP_ON : CHIP_OFF}`}
              >
                Sin curso
              </button>
            </fieldset>
          </div>

          <p role="status" className="mt-2 text-xs font-bold text-ink-500">
            {visibles.length === cuentas.length
              ? `${cuentas.length} ${cuentas.length === 1 ? "cuenta" : "cuentas"}`
              : `${visibles.length} de ${cuentas.length} cuentas`}
          </p>
        </div>

        <div className="p-2">
          <CabeceraCuentas />
          {visibles.length === 0 ? (
            <p className="px-3 py-6 text-sm font-semibold text-ink-500">
              Ninguna cuenta coincide con lo que has puesto. Prueba a quitar un filtro.
            </p>
          ) : (
            <div className="divide-y divide-ink-100">
              {visibles.map((cuenta) => (
                <FilaCuenta key={cuenta.id} cuenta={cuenta} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
