import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BlockChip, ProgramBlocks } from "@/components/brand/ProgramBlocks";
import { CourseTabs } from "@/components/profesor/CourseTabs";
import { Enunciado } from "@/components/unidad/Enunciado";
import { HubPorts } from "@/components/unidad/HubPorts";
import { PiezasNecesarias } from "@/components/unidad/PiezasNecesarias";
import { VideoPlayer } from "@/components/unidad/VideoPlayer";
import { requireRole } from "@/lib/auth";
import { categoryName, getBlockInfo } from "@/lib/bloques";
import { ejemploDeBloque, getContenido, getPracticasIntermediasDeUnidad } from "@/lib/contenido";
import { firstParam } from "@/lib/format";
import { COURSE_LABEL, COURSES, UNIT_NUMBERS, isCourse, type Course } from "@/lib/types";
import { getHubSetup, getUnidadesDeCurso } from "@/lib/unidades";

export const metadata: Metadata = { title: "Preparar clases" };

const PATH = "/dashboard/profesor/preparar";

const EVALUACION = ["", "1.ª evaluación", "2.ª evaluación", "3.ª evaluación"];
const NIVEL = [
  "",
  "Nivel 1 · programas cortos y guiados",
  "Nivel 2 · bucles, giros controlados y condiciones",
  "Nivel 3 · varias respuestas, giros medidos y proyectos",
];

function Seccion({
  numero,
  titulo,
  pie,
  children,
}: {
  numero: number;
  titulo: string;
  pie?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card bg-white p-6 shadow-card sm:p-8">
      <div className="flex items-baseline gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink-900 font-display text-base font-semibold text-white">
          {numero}
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink-900">{titulo}</h2>
          {pie ? <p className="text-sm font-semibold text-ink-500">{pie}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * Preparar clases: el curso entero en abierto, solo para el profesorado.
 *
 * Es una vista de CONSULTA y nada más. No toca el estado de apertura de las
 * unidades, no mira el progreso de nadie y no guarda nada: lee el contenido
 * del repositorio y lo enseña. Por eso un profesor puede abrir la unidad 9 de
 * 3º en septiembre sin que a ningún alumno se le desbloquee nada.
 *
 * La diferencia con lo que ve el alumno es justo esa: el alumno entra por
 * /dashboard/alumno/unidad/[numero], que sí comprueba si la unidad está
 * abierta para él. Esta página no comparte esa ruta ni esa lógica, así que no
 * hay forma de que una toque a la otra.
 */
export default async function PrepararClasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Solo profesorado. Un alumno que escriba esta dirección se va a su panel.
  await requireRole(["profesor", "superadmin"]);

  const params = await searchParams;
  // Aquí se ven todos los cursos a propósito: preparar una clase de 2º no
  // tiene nada que ver con a qué grupos da clase uno este año.
  const cursoParam = firstParam(params.curso);
  const curso: Course = isCourse(cursoParam) ? cursoParam : COURSES[0];
  const udParam = Number(firstParam(params.ud));
  const numero = (UNIT_NUMBERS as readonly number[]).includes(udParam) ? udParam : 1;

  const unidades = getUnidadesDeCurso(curso);
  const unidad = unidades.find((item) => item.numero === numero);
  const contenido = getContenido(curso, numero);
  const intermedias = getPracticasIntermediasDeUnidad(curso, numero);
  const setup = unidad ? getHubSetup(unidad) : null;

  const explicacionDe = (texto: string) =>
    contenido?.bloques.find((item) => item.texto === texto)?.explicacion;

  return (
    <>
      <h1 className="font-display text-4xl font-semibold text-ink-900">Preparar clases</h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold text-ink-500">
        Todas las unidades de todos los cursos, abiertas. Aquí puedes leerlo todo antes de la
        clase: la teoría, el montaje, las 4 prácticas con su solución, el test con las respuestas
        y las dos programaciones de la PRUEBA.
      </p>
      <p className="mt-2 max-w-3xl font-bold text-ink-700">
        Esto no abre ni cierra nada: lo que ve el alumnado sigue como esté en «Unidades y
        pruebas».
      </p>

      <div className="mt-6">
        <CourseTabs basePath={PATH} active={curso} />
      </div>

      <nav aria-label="Unidad" className="mt-4 flex flex-wrap gap-2">
        {UNIT_NUMBERS.map((item) => {
          const activa = item === numero;
          const suya = unidades.find((u) => u.numero === item);
          return (
            <Link
              key={item}
              href={`${PATH}?curso=${curso}&ud=${item}`}
              aria-current={activa ? "page" : undefined}
              title={suya?.titulo}
              className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-extrabold transition-colors ${
                activa
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-900"
              }`}
            >
              UD {item}
              {suya?.evaluacion ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activa ? "bg-ink-700 text-white" : "bg-ink-100 text-ink-600"
                  }`}
                >
                  {suya.evaluacion}.ª ev
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* ── La unidad de un vistazo ─────────────────────────────────────── */}
      <section className="mt-8 rounded-card bg-white p-6 shadow-card sm:p-8">
        <p className="text-sm font-extrabold uppercase tracking-widest text-ink-500">
          {COURSE_LABEL[curso]} · Unidad {numero}
          {unidad?.evaluacion ? ` · ${EVALUACION[unidad.evaluacion] ?? ""}` : ""}
        </p>
        <h2 className="mt-1 font-display text-3xl font-semibold text-ink-900">
          {unidad?.titulo ?? `Unidad ${numero}`}
        </h2>
        {unidad?.nivel ? (
          <p className="mt-1 font-bold text-spike-700">{NIVEL[unidad.nivel] ?? ""}</p>
        ) : null}
        {contenido ? (
          <p className="mt-3 max-w-3xl text-lg font-semibold text-ink-700">{contenido.reto}</p>
        ) : null}
        {unidad ? (
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-extrabold uppercase tracking-wide text-ink-500">Hardware</dt>
              <dd className="mt-1 font-semibold text-ink-800">{unidad.hardware}</dd>
            </div>
            <div>
              <dt className="font-extrabold uppercase tracking-wide text-ink-500">Modelo final</dt>
              <dd className="mt-1 font-semibold text-ink-800">{unidad.modelo}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      {!contenido ? (
        <p className="mt-6 rounded-card bg-white p-6 font-semibold text-ink-500 shadow-card">
          Esta unidad todavía no tiene contenido redactado. Se ven el hardware, los bloques y el
          modelo del temario, pero no hay teoría ni prácticas.
        </p>
      ) : (
        <div className="mt-6 grid gap-6">
          {/* 1 · El vídeo y su guion */}
          <Seccion
            numero={1}
            titulo="Teoría · el vídeo"
            pie={`${contenido.video.titulo} · ${contenido.video.duracion}`}
          >
            <VideoPlayer
              url={contenido.video.url}
              titulo={contenido.video.titulo}
              enlaceOficial={contenido.video.enlaceOficial}
            />
            <ol className="mt-5 grid gap-3">
              {contenido.video.escenas.map((escena, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[auto_1fr] items-start gap-x-3 rounded-2xl bg-ink-50 p-4"
                >
                  <span className="mt-0.5 grid size-6 place-items-center rounded-full bg-ink-900 text-xs font-extrabold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink-500">{escena.plano}</p>
                    <p className="mt-1 font-semibold text-ink-800">{escena.locucion}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Seccion>

          {/* 2 · Los puertos */}
          {setup ? (
            <Seccion
              numero={2}
              titulo="Teoría · los puertos"
              pie="Qué se enchufa y dónde antes de empezar"
            >
              <HubPorts setup={setup} />
            </Seccion>
          ) : null}

          {/* 3 · Los bloques nuevos */}
          <Seccion
            numero={3}
            titulo="Teoría · los bloques nuevos"
            pie={`${unidad?.bloques.length ?? 0} bloques que entran en esta unidad`}
          >
            <ul className="grid gap-3">
              {(unidad?.bloques ?? []).map((texto) => {
                const ejemplo = ejemploDeBloque(contenido.programa, texto);
                return (
                  <li
                    key={texto}
                    className="grid items-start gap-x-5 gap-y-3 rounded-2xl bg-ink-50 p-4 md:grid-cols-[minmax(0,22rem)_1fr]"
                  >
                    <div className="max-w-full overflow-x-auto">
                      <BlockChip texto={texto} className="text-[0.95rem]" />
                    </div>
                    <div className="grid gap-3">
                      <p className="text-sm font-semibold text-ink-700">
                        {explicacionDe(texto) ??
                          `Categoría ${categoryName(getBlockInfo(texto).categoria)}.`}
                      </p>
                      {ejemplo.length > 0 ? (
                        <div className="rounded-xl bg-white p-3">
                          <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-ink-500">
                            Así se encaja
                          </p>
                          <ProgramBlocks rows={ejemplo} label={`Ejemplo con ${texto}`} />
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>

            {contenido.programa ? (
              <div className="mt-5 rounded-2xl border-2 border-spike-200 bg-spike-50 p-5">
                <p className="text-xs font-extrabold uppercase tracking-widest text-spike-700">
                  Programa de ejemplo
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-ink-900">
                  {contenido.programa.titulo}
                </h3>
                <p className="mt-1 font-semibold text-ink-700">
                  {contenido.programa.explicacion}
                </p>
                <div className="mt-3 overflow-x-auto">
                  <ProgramBlocks
                    rows={contenido.programa.bloques}
                    label="Programa de ejemplo de la unidad"
                  />
                </div>
              </div>
            ) : null}
          </Seccion>

          {/* 4 · El montaje */}
          <Seccion
            numero={4}
            titulo="Teoría · el montaje"
            pie="Lo que hay que sacar de las cajas y en qué orden se monta"
          >
            <PiezasNecesarias
              materiales={contenido.construccion.materiales ?? []}
              descripcion={contenido.construccion.piezas}
            />
            <ol className="mt-5 grid gap-3">
              {contenido.construccion.pasos.map((paso, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[auto_1fr] items-start gap-x-3 rounded-2xl bg-ink-50 p-4"
                >
                  <span className="mt-0.5 grid size-6 place-items-center rounded-full bg-spike-600 text-xs font-extrabold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink-900">
                      {paso.titulo}
                    </h3>
                    <p className="font-semibold text-ink-700">{paso.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Seccion>

          {/* 5 · Las 4 prácticas */}
          <Seccion
            numero={5}
            titulo="Las 4 prácticas de programación"
            pie="Sin nota: son los retos con los que el alumno aprende"
          >
            {intermedias.length === 0 ? (
              <p className="font-semibold text-ink-500">
                Esta unidad todavía no tiene prácticas intermedias.
              </p>
            ) : (
              <ol className="grid gap-4">
                {intermedias.map((practica) => (
                  <li key={practica.practica} className="rounded-2xl border-2 border-ink-100 p-5">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
                      Práctica {practica.practica} de {intermedias.length}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-ink-900">
                      {practica.titulo}
                    </h3>
                    <div className="mt-2">
                      <Enunciado texto={practica.enunciado} pasos={practica.pasos} />
                    </div>
                    {practica.pista ? (
                      <p className="mt-3 rounded-xl bg-hub-50 p-3 text-sm font-bold text-ink-800">
                        Pista para el alumno: {practica.pista}
                      </p>
                    ) : null}
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-ink-500">
                        Solución de ejemplo
                      </p>
                      <div className="overflow-x-auto rounded-xl bg-spike-50 p-4">
                        <ProgramBlocks
                          rows={practica.solucion}
                          label={`Solución de la práctica ${practica.practica}`}
                        />
                      </div>
                    </div>
                    {practica.notas ? (
                      <p className="mt-2 text-sm font-semibold text-ink-600">{practica.notas}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </Seccion>

          {/* 6 · El test, con las respuestas */}
          <Seccion
            numero={6}
            titulo="PRUEBA · el test"
            pie={`${contenido.test.length} preguntas, 1 punto cada una. La respuesta correcta va marcada.`}
          >
            <ol className="grid gap-4">
              {contenido.test.map((pregunta, i) => (
                <li key={i} className="rounded-2xl border-2 border-ink-100 p-5">
                  <p className="font-display text-lg font-semibold text-ink-900">
                    {i + 1}. {pregunta.pregunta}
                  </p>
                  <ul className="mt-3 grid gap-1.5">
                    {pregunta.opciones.map((opcion, j) => {
                      const buena = j === pregunta.correcta;
                      return (
                        <li
                          key={j}
                          className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                            buena ? "bg-spike-50 text-spike-900" : "bg-ink-50 text-ink-600"
                          }`}
                        >
                          <span
                            className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                              buena ? "bg-spike-600 text-white" : "bg-white text-ink-500"
                            }`}
                          >
                            {buena ? "✓" : String.fromCharCode(97 + j)}
                          </span>
                          {opcion}
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-2 text-sm font-semibold text-ink-600">{pregunta.explicacion}</p>
                </li>
              ))}
            </ol>
          </Seccion>

          {/* 7 · Las 2 programaciones de la PRUEBA */}
          <Seccion
            numero={7}
            titulo="PRUEBA · las 2 programaciones"
            pie="1 punto cada una. Estas sí las corriges tú."
          >
            <ol className="grid gap-4">
              {contenido.practicas.map((practica, i) => (
                <li key={i} className="rounded-2xl border-2 border-ink-100 p-5">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-ink-500">
                    Programación {i + 1} de {contenido.practicas.length}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-ink-900">
                    {practica.titulo}
                  </h3>
                  <div className="mt-2">
                    <Enunciado texto={practica.enunciado} pasos={practica.pasos} />
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-ink-500">
                      Solución oficial
                    </p>
                    <div className="overflow-x-auto rounded-xl bg-spike-50 p-4">
                      <ProgramBlocks
                        rows={practica.solucion}
                        label={`Solución oficial de la programación ${i + 1}`}
                      />
                    </div>
                  </div>
                  {practica.notas ? (
                    <p className="mt-2 text-sm font-semibold text-ink-600">{practica.notas}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </Seccion>
        </div>
      )}
    </>
  );
}
