"use client";

// Botón «Abrir LEGO SPIKE» de cada práctica de programación.
//
// Al pulsarlo se intenta abrir la app nativa del iPad con su esquema de URL
// (SPIKE_APP_SCHEME, en src/config/site.ts). Si pasado un segundo y medio
// seguimos aquí —porque no hay app, porque estamos en un ordenador o porque
// iPadOS está esperando que pulsen «Abrir»— aparece debajo un aviso con las
// dos salidas: pulsar «Abrir» en la ventana del iPad, o irse a la versión web.
//
// A propósito NO redirige solo a la web: si iPadOS tiene su ventana abierta
// esperando, cambiar de página se la llevaría por delante justo cuando el
// alumno iba a pulsar «Abrir».

import { useEffect, useRef, useState } from "react";
import { BlocksIcon, ExternalLinkIcon, TabletIcon } from "@/components/ui/icons";
import { LEGO_EDUCATION_URL, SPIKE_APP_SCHEME } from "@/config/site";

/** Lo que esperamos a que la app se ponga delante antes de dar la alternativa. */
const ESPERA = 1500;

export function BotonSpike() {
  const [avisando, setAvisando] = useState(false);
  const temporizador = useRef<number | null>(null);

  // Si el componente desaparece a media espera, no dejamos nada corriendo.
  useEffect(() => {
    return () => {
      if (temporizador.current !== null) window.clearTimeout(temporizador.current);
    };
  }, []);

  function abrir() {
    // Sin esquema configurado, el botón es un enlace a la versión web.
    if (SPIKE_APP_SCHEME === "") {
      window.open(LEGO_EDUCATION_URL, "_blank", "noopener,noreferrer");
      return;
    }

    setAvisando(false);

    // Si la app se abre, el navegador se va al fondo: eso es lo que miramos.
    let seHaIdo = false;
    const alIrse = () => {
      seHaIdo = true;
    };
    const alCambiar = () => {
      if (document.visibilityState === "hidden") seHaIdo = true;
    };
    window.addEventListener("blur", alIrse);
    window.addEventListener("pagehide", alIrse);
    document.addEventListener("visibilitychange", alCambiar);

    const limpiar = () => {
      window.removeEventListener("blur", alIrse);
      window.removeEventListener("pagehide", alIrse);
      document.removeEventListener("visibilitychange", alCambiar);
    };

    temporizador.current = window.setTimeout(() => {
      limpiar();
      temporizador.current = null;
      if (!seHaIdo && document.visibilityState === "visible") setAvisando(true);
    }, ESPERA);

    // El intento de abrir la app. En el iPad sale el aviso «¿Abrir en SPIKE?».
    window.location.href = SPIKE_APP_SCHEME;
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={abrir}
        className="inline-flex h-13 items-center gap-2.5 rounded-2xl bg-hub-400 px-5 font-display text-base font-semibold text-ink-900 shadow-press-hub transition hover:bg-hub-300 active:translate-y-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-hub-700"
      >
        <BlocksIcon className="size-5" />
        Abrir LEGO® SPIKE™
        <ExternalLinkIcon className="size-4 opacity-70" />
      </button>
      <p className="mt-1.5 text-xs font-semibold text-ink-500">
        Abre la app del iPad para montar y probar este programa en tu Hub.
      </p>

      {avisando ? (
        <div role="status" className="mt-3 rounded-2xl border-2 border-hub-300 bg-hub-50 p-4">
          <p className="flex items-center gap-2 font-bold text-ink-900">
            <TabletIcon className="size-4 shrink-0" />
            ¿No se ha abierto la app?
          </p>
          <ul className="mt-1.5 grid gap-1 text-sm font-semibold text-ink-700">
            <li>· Si te ha salido una ventana del iPad, pulsa «Abrir» en ella.</li>
            <li>· Si estás en un ordenador, o el iPad no tiene la app instalada, entra en la versión web.</li>
          </ul>
          <a
            href={LEGO_EDUCATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl border-2 border-ink-300 bg-white px-4 text-sm font-extrabold text-ink-800 transition hover:border-ink-900"
          >
            Abrir SPIKE en el navegador
            <ExternalLinkIcon className="size-4" />
          </a>
        </div>
      ) : null}
    </div>
  );
}
