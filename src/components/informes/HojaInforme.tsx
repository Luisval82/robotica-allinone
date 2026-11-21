// El marco común de los dos informes: cabecera de la plataforma, pie con la
// fecha y el aviso de la barra de acciones que no se imprime.
//
// Cómo se hace el PDF: no se genera en el servidor, se imprime. La página se
// maqueta para papel con la hoja de estilos de impresión (ver @media print
// en src/app/globals.css) y el navegador la guarda como PDF —«Guardar como
// PDF» en el escritorio, «Compartir → Imprimir» en el iPad—. A cambio de un
// clic, el informe sale con la tipografía, los colores y el diseño exactos
// de la plataforma, sin añadir ninguna dependencia al proyecto.

import { Suspense, type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { BotonImprimir } from "@/components/informes/BotonImprimir";

export function HojaInforme({
  titulo,
  subtitulo,
  volverA,
  volverTexto,
  children,
}: {
  titulo: string;
  subtitulo: string;
  /** A dónde se vuelve al cerrar el informe. */
  volverA: string;
  volverTexto: string;
  children: ReactNode;
}) {
  const generado = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date());

  return (
    <article className="hoja">
      {/* Barra de acciones: en pantalla sí, en el papel no. */}
      <div
        data-no-print
        className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card bg-white p-4 shadow-card"
      >
        <p className="text-sm font-semibold text-ink-600">
          Revisa el informe y guárdalo como PDF desde el diálogo de impresión.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={volverA}
            className="inline-flex h-10 items-center rounded-xl border-2 border-ink-200 bg-white px-4 text-sm font-extrabold text-ink-800 transition-colors hover:border-ink-900"
          >
            {volverTexto}
          </a>
          {/* useSearchParams necesita su frontera de Suspense. */}
          <Suspense fallback={null}>
            <BotonImprimir />
          </Suspense>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card print:rounded-none print:p-0 print:shadow-none">
      <header className="evitar-corte mb-5 flex items-start justify-between gap-4 border-b-2 border-ink-200 pb-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">{titulo}</h1>
          <p className="mt-1 font-semibold text-ink-600">{subtitulo}</p>
        </div>
        <div className="text-right">
          <Logo />
          <p className="mt-1 text-xs font-semibold text-ink-500">Generado el {generado}</p>
        </div>
      </header>

      {children}

      <footer className="mt-6 border-t-2 border-ink-100 pt-3 text-xs font-semibold text-ink-500">
        ROBOTICA ALLINONE · {subtitulo} · Generado el {generado}. Las notas de las PRUEBAS que
        aparecen aquí son las que había en el momento de generar el informe.
      </footer>
      </div>
    </article>
  );
}
