import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BlockChip, ProgramBlocks } from "@/components/brand/ProgramBlocks";
import { EntregaBox, type EntregaView } from "@/components/unidad/EntregaBox";
import { HubPorts } from "@/components/unidad/HubPorts";
import { IpadWorkflowBanner } from "@/components/unidad/IpadWorkflowBanner";
import { CarruselMontaje } from "@/components/unidad/CarruselMontaje";
import { PiezasNecesarias } from "@/components/unidad/PiezasNecesarias";
import { PracticasIntermedias } from "@/components/unidad/PracticasIntermedias";
import { StepSection, type StepState } from "@/components/unidad/StepSection";
import { SueloBaldosas } from "@/components/unidad/SueloBaldosas";
import { UnitTest, type TestResult } from "@/components/unidad/UnitTest";
import { VideoPlayer } from "@/components/unidad/VideoPlayer";
import { ArrowLeftIcon, ExternalLinkIcon } from "@/components/ui/icons";
import { LEGO_EDUCATION_URL } from "@/config/site";
import { requireRole } from "@/lib/auth";
import { categoryColorClass, categoryName, getBlockInfo } from "@/lib/bloques";
import {
  ejemploDeBloque,
  getContenido,
  getPracticasIntermediasDeUnidad,
  getPracticasForStudent,
  getTestForStudent,
  getTestReview,
} from "@/lib/contenido";
import {
  getEntrega,
  getPracticasIntermedias,
  getStudentAccess,
  getUnitProgress,
  testScore,
} from "@/lib/db";
import { formatFecha } from "@/lib/format";
import { getBloquesDePractica, getPaleta } from "@/lib/paleta";
import { COURSE_LABEL, THEORY_STEPS, UNIT_NUMBERS } from "@/lib/types";
import { getHubSetup, getUnidad } from "@/lib/unidades";
import { unitTone } from "@/lib/unitTone";

export const metadata: Metadata = { title: "Unidad" };

const HOME = "/dashboard/alumno";

// Los cuatro pasos de teoría, en orden, y el color de su cabecera.
const STEPS = [
  { titulo: "Guion de vídeo", corto: "Vídeo", tone: "bg-block-eventos text-ink-900" },
  { titulo: "Esquema de puertos del Hub", corto: "Puertos", tone: "bg-block-sensores text-ink-900" },
  { titulo: "Bloques de palabras", corto: "Bloques", tone: "bg-block-control text-ink-900" },
  { titulo: "Modelo final de construcción", corto: "Modelo", tone: "bg-block-movimiento text-ink-900" },
];
const PRUEBA_TONE = "bg-block-operadores text-ink-900";
const PRACTICAS_TONE = "bg-block-luz text-ink-900";

/** El índice de arriba: los 4 pasos, las prácticas entre el 3 y el 4, y la PRUEBA. */
const INDICE: { label: string; ancla: string; marca: string; paso: number | null }[] = [
  { label: STEPS[0].corto, ancla: "#paso-1", marca: "1", paso: 1 },
  { label: STEPS[1].corto, ancla: "#paso-2", marca: "2", paso: 2 },
  { label: STEPS[2].corto, ancla: "#paso-3", marca: "3", paso: 3 },
  { label: "Prácticas", ancla: "#practicas", marca: "⚙", paso: null },
  { label: STEPS[3].corto, ancla: "#paso-4", marca: "4", paso: 4 },
  { label: "Prueba", ancla: "#prueba", marca: "★", paso: null },
];

function Pending({ children }: { children: string }) {
  return (
    <p className="rounded-2xl border-2 border-dashed border-ink-300 p-5 font-semibold text-ink-600">
      {children}
    </p>
  );
}

export default async function UnidadPage({ params }: { params: Promise<{ numero: string }> }) {
  const session = await requireRole(["alumno"]);
  const numero = Number((await params).numero);
  const curso = session.course;
  if (!curso || !(UNIT_NUMBERS as readonly number[]).includes(numero)) notFound();

  const unidad = getUnidad(curso, numero);
  if (!unidad) notFound();

  // Una unidad bloqueada no se puede abrir escribiendo su dirección a mano.
  const acceso = (await getStudentAccess({ id: session.id, course: curso })).find(
    (item) => item.unidad === numero,
  );
  if (!acceso?.abierta) redirect(HOME);

  const progreso = await getUnitProgress(session.id, numero);
  const contenido = getContenido(curso, numero);
  const setup = getHubSetup(unidad);
  const pasos = Math.min(progreso.pasosTeoria, THEORY_STEPS);

  const estadoDe = (paso: number): StepState =>
    paso <= pasos ? "hecho" : paso === pasos + 1 ? "actual" : "bloqueado";
  const lockedText = "Termina el paso anterior para abrir este.";

  const categorias = [...new Set(unidad.bloques.map((texto) => getBlockInfo(texto).categoria))];
  const explicacionDe = (texto: string) =>
    contenido?.bloques.find((item) => item.texto === texto)?.explicacion;

  // ── PRUEBA UD-X: solo se prepara si el alumno la tiene abierta ──
  const preguntas = acceso.pruebaAbierta ? getTestForStudent(curso, numero) : [];
  const practicas = acceso.pruebaAbierta ? getPracticasForStudent(curso, numero) : [];
  const paleta = getPaleta(curso, numero);
  const intermedias = getPracticasIntermediasDeUnidad(curso, numero);
  const practicasGuardadas = await getPracticasIntermedias(session.id, numero);
  // Se abren al terminar el paso 3, que es donde se explican los bloques.
  const practicasEstado: StepState =
    pasos >= THEORY_STEPS
      ? "hecho"
      : pasos >= 3
        ? "actual"
        : "bloqueado";

  const resultado: TestResult | null =
    progreso.testAciertos === null
      ? null
      : {
          aciertos: progreso.testAciertos,
          nota: testScore(progreso.testAciertos),
          detalle: progreso.testRespuestas
            ? getTestReview(curso, numero, progreso.testRespuestas)
            : null,
        };

  const entregas = await Promise.all(
    practicas.map(async (practica): Promise<EntregaView | null> => {
      const entrega = await getEntrega(session.id, numero, practica.practica);
      return entrega
        ? {
            bloques: entrega.bloques,
            explicacion: entrega.explicacion,
            entregadaEn: formatFecha(entrega.entregadaEn),
            puntos: entrega.puntos,
            comentario: entrega.comentario,
            corregidaPor: entrega.corregidaPor,
          }
        : null;
    }),
  );

  const pruebaEstado: StepState = acceso.pruebaAbierta ? "actual" : "bloqueado";

  return (
    <>
      <Link
        href={HOME}
        className="inline-flex items-center gap-2 rounded-full border-2 border-ink-200 bg-white px-4 py-2 text-sm font-extrabold text-ink-800 transition-colors hover:border-ink-900"
      >
        <ArrowLeftIcon className="size-4" />
        Mis unidades
      </Link>

      {/* Cabecera de la unidad */}
      <header className={`mt-5 rounded-card p-7 sm:p-10 ${unitTone(numero)}`}>
        <p className="text-sm font-extrabold uppercase tracking-widest">
          {COURSE_LABEL[curso]} · Unidad {numero}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          {unidad.titulo}
        </h1>
        <p className="mt-3 max-w-2xl text-lg font-bold">{contenido?.reto ?? unidad.modelo}</p>
        <a
          href={LEGO_EDUCATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-ink-900 px-5 font-display text-base font-semibold tracking-wide text-white transition hover:bg-ink-700"
        >
          Abrir LEGO® Education
          <ExternalLinkIcon className="size-4" />
          <span className="sr-only">(se abre en una pestaña nueva)</span>
        </a>
      </header>

      {/* Índice de pasos */}
      <nav aria-label="Pasos de la unidad" className="mt-5">
        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {INDICE.map(({ label, ancla, marca, paso }) => {
            const estado =
              paso !== null
                ? estadoDe(paso)
                : ancla === "#prueba"
                  ? pruebaEstado
                  : practicasEstado;
            return (
              <li key={label}>
                <a
                  href={ancla}
                  className={`block rounded-2xl border-2 px-2 py-2.5 text-center text-xs font-extrabold transition-colors sm:text-sm ${
                    estado === "hecho"
                      ? "border-spike-600 bg-spike-600 text-white"
                      : estado === "actual"
                        ? "border-ink-900 bg-white text-ink-900"
                        : "border-ink-200 bg-ink-100 text-ink-500"
                  }`}
                >
                  <span className="block font-display text-base sm:text-lg">{marca}</span>
                  {label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-6 grid gap-6">
        {/* 1 · Vídeo de la unidad */}
        <StepSection
          id="paso-1"
          eyebrow={`Paso 1 de ${THEORY_STEPS}`}
          titulo={STEPS[0].titulo}
          estado={estadoDe(1)}
          tone={STEPS[0].tone}
          marca="1"
          lockedText={lockedText}
          unidad={numero}
          paso={1}
        >
          {contenido ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl font-semibold text-ink-900">
                  «{contenido.video.titulo}»
                </h3>
                <p className="text-sm font-extrabold uppercase tracking-wide text-ink-500">
                  Duración: {contenido.video.duracion}
                </p>
              </div>

              <div className="mt-4">
                <VideoPlayer
                  url={contenido.video.url}
                  titulo={contenido.video.titulo}
                  enlaceOficial={contenido.video.enlaceOficial}
                />
              </div>
              {contenido.video.url ? (
                <a
                  href={contenido.video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-extrabold text-spike-700 underline decoration-2 underline-offset-4"
                >
                  Abrir en una pestaña nueva
                  <ExternalLinkIcon className="size-4" />
                </a>
              ) : null}
            </>
          ) : (
            <Pending>El vídeo de esta unidad todavía está en preparación.</Pending>
          )}
        </StepSection>

        {/* 2 · Esquema de puertos */}
        <StepSection
          id="paso-2"
          eyebrow={`Paso 2 de ${THEORY_STEPS}`}
          titulo={STEPS[1].titulo}
          estado={estadoDe(2)}
          tone={STEPS[1].tone}
          marca="2"
          lockedText={lockedText}
          unidad={numero}
          paso={2}
        >
          <p className="mb-6 font-semibold text-ink-700">
            <span className="font-extrabold text-ink-900">Necesitas: </span>
            {unidad.hardware}.
          </p>
          <HubPorts setup={setup} />
        </StepSection>

        {/* 3 · Bloques de palabras */}
        <StepSection
          id="paso-3"
          eyebrow={`Paso 3 de ${THEORY_STEPS}`}
          titulo={STEPS[2].titulo}
          estado={estadoDe(3)}
          tone={STEPS[2].tone}
          marca="3"
          lockedText={lockedText}
          unidad={numero}
          paso={3}
        >
          <p className="font-semibold text-ink-700">
            Estos son los bloques que se trabajan en la unidad. En la app SPIKE cada categoría tiene su color.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {categorias.map((categoria) => (
              <li
                key={categoria}
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink-100 bg-white px-3 py-1 text-sm font-bold text-ink-800"
              >
                <span className={`size-3.5 rounded-full ${categoryColorClass(categoria)}`} />
                {categoryName(categoria)}
              </li>
            ))}
          </ul>
          <ul className="mt-5 grid gap-3">
            {unidad.bloques.map((texto) => {
              const explicacion = explicacionDe(texto);
              const ejemplo = ejemploDeBloque(contenido?.programa, texto);
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
                      {explicacion ?? `Categoría ${categoryName(getBlockInfo(texto).categoria)}.`}
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

          {contenido?.programa ? (
            <div className="mt-6 rounded-2xl border-2 border-spike-200 bg-spike-50 p-5">
              <p className="text-xs font-extrabold uppercase tracking-widest text-spike-700">
                Programa de ejemplo
              </p>
              <h4 className="mt-1 font-display text-xl font-semibold text-ink-900">
                {contenido.programa.titulo}
              </h4>
              <p className="mt-2 font-semibold text-ink-700">{contenido.programa.explicacion}</p>
              <div className="mt-4">
                <ProgramBlocks
                  rows={contenido.programa.bloques}
                  label={`Programa de ejemplo: ${contenido.programa.titulo}`}
                />
              </div>
              <p className="mt-4 text-sm font-semibold text-ink-600">
                No es la solución de las prácticas: cópialo en la app SPIKE, pruébalo y cámbiale
                los valores para ver qué pasa.
              </p>
            </div>
          ) : null}
        </StepSection>

        <IpadWorkflowBanner />

        {/* 4 · Modelo final */}
        {/* PRÁCTICAS INTERMEDIAS · antes del modelo final y de la PRUEBA */}
        <StepSection
          id="practicas"
          eyebrow="Para practicar"
          titulo="Prácticas de programación"
          estado={practicasEstado}
          tone={PRACTICAS_TONE}
          marca="⚙"
          lockedText="Se abren cuando termines el paso 3, donde se explican los bloques."
          unidad={numero}
        >
          {intermedias.length > 0 ? (
            <PracticasIntermedias
              curso={curso}
              unidad={numero}
              practicas={intermedias}
              guardadas={practicasGuardadas}
              paleta={paleta}
            />
          ) : (
            <Pending>Las prácticas de esta unidad todavía están en preparación.</Pending>
          )}
        </StepSection>

        <StepSection
          id="paso-4"
          eyebrow={`Paso 4 de ${THEORY_STEPS}`}
          titulo={STEPS[3].titulo}
          estado={estadoDe(4)}
          tone={STEPS[3].tone}
          marca="4"
          lockedText={lockedText}
          unidad={numero}
          paso={4}
        >
          {contenido ? (
            <div className="grid gap-5">
              <PiezasNecesarias
                materiales={contenido.construccion.materiales ?? []}
                descripcion={contenido.construccion.piezas}
              />
              <CarruselMontaje
                modelo={unidad.modelo}
                piezas={contenido.construccion.piezas}
                pasos={contenido.construccion.pasos}
              />
            </div>
          ) : (
            <div className="mt-4">
              <Pending>Los pasos de montaje de esta unidad todavía están en preparación.</Pending>
            </div>
          )}
        </StepSection>

        {/* PRUEBA UD-X */}
        <StepSection
          id="prueba"
          eyebrow="Para terminar"
          titulo={`PRUEBA UD-${numero}`}
          estado={pruebaEstado}
          tone={PRUEBA_TONE}
          marca="★"
          lockedText="Se abre cuando termines los cuatro pasos. Tu profesor también puede abrirla antes."
          unidad={numero}
        >
          <h3 className="font-display text-2xl font-semibold text-ink-900">
            Test de {preguntas.length || 8} preguntas
          </h3>
          <div className="mt-4">
            {preguntas.length > 0 ? (
              <UnitTest unidad={numero} preguntas={preguntas} resultado={resultado} />
            ) : (
              <Pending>El test de esta unidad todavía está en preparación.</Pending>
            )}
          </div>

          <h3 className="mt-10 font-display text-2xl font-semibold text-ink-900">
            Entregas de programación
          </h3>
          <p className="mt-1 font-semibold text-ink-600">
            Programa cada práctica en la app SPIKE, pruébala en tu robot y entrega aquí el programa
            bloque a bloque. Tu profesor le pondrá nota.
          </p>
          <div className="mt-4">
            <IpadWorkflowBanner />
          </div>
          <div className="mt-5 grid gap-5">
            {/* La PRUEBA se entrega una sola vez: al entregar queda cerrada.
                Aquí NO se enseña la solución, porque estas dos las corrige el
                profesor con nota. Y el cajón de la mesa trae los bloques de la
                unidad sin mirar la solución, por lo mismo. */}
            {practicas.length > 0 ? (
              practicas.map((practica, index) => (
                <EntregaBox
                  key={practica.practica}
                  unidad={numero}
                  practica={practica.practica}
                  titulo={practica.titulo}
                  enunciado={practica.enunciado}
                  pasos={practica.pasos}
                  paleta={paleta}
                  bloquesTaller={getBloquesDePractica(curso, numero)}
                  entrega={entregas[index]}
                  bloqueada={entregas[index] !== null}
                  textoCerrada="Entregada"
                  extra={practica.suelo ? <SueloBaldosas curso={curso} /> : null}
                />
              ))
            ) : (
              <Pending>Las prácticas de esta unidad todavía están en preparación.</Pending>
            )}
          </div>
        </StepSection>
      </div>
    </>
  );
}
