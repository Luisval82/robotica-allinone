import { ExternalLinkIcon } from "@/components/ui/icons";
import { getVideoEmbed } from "@/lib/video";

type EnlaceOficial = { titulo: string; url: string };

/**
 * Reproductor de la unidad. Admite YouTube, Vimeo, Google Drive o un
 * archivo de vídeo directo (mp4, webm…) — ver src/lib/video.ts. El enlace
 * se configura por unidad en el campo «video.url» de su archivo en
 * src/data/contenido/CURSO-N.json. Sin enlace, muestra un aviso en vez de
 * romper la página.
 *
 * «enlaceOficial» (campo «video.enlaceOficial» en el JSON) es un recurso
 * oficial de LEGO® Education sobre el mismo tema: como su web no permite
 * incrustarlo en un iframe, se muestra como una tarjeta con enlace, nunca
 * como reproductor embebido.
 */
export function VideoPlayer({
  url,
  titulo,
  enlaceOficial,
}: {
  url?: string;
  titulo: string;
  enlaceOficial?: EnlaceOficial;
}) {
  const embed = getVideoEmbed(url);

  if (!embed) {
    return (
      <div className="grid gap-4">
        <div className="grid aspect-video place-items-center rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50 p-6 text-center">
          <p className="font-bold text-ink-600">
            Todavía no hay vídeo para esta unidad.
            <br />
            <span className="font-semibold text-ink-500">
              Añádelo en «video.url», dentro de su archivo en src/data/contenido/.
            </span>
          </p>
        </div>
        <RecursoOficial enlace={enlaceOficial} />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {embed.kind === "file" ? (
        <video controls preload="metadata" className="aspect-video w-full rounded-2xl bg-ink-900">
          <source src={embed.src} />
          Tu navegador no puede reproducir este vídeo.
        </video>
      ) : (
        <div className="aspect-video overflow-hidden rounded-2xl bg-ink-900">
          <iframe
            src={embed.src}
            title={`Vídeo: ${titulo}`}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}
      <RecursoOficial enlace={enlaceOficial} />
    </div>
  );
}

/** Tarjeta de enlace (no embebible) a un recurso oficial de LEGO® Education. */
function RecursoOficial({ enlace }: { enlace?: EnlaceOficial }) {
  if (!enlace) return null;

  return (
    <a
      href={enlace.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-2xl border-2 border-spike-200 bg-spike-50 p-4 transition hover:border-spike-400 hover:bg-spike-100"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-spike-500 text-white">
        <ExternalLinkIcon className="size-5" />
      </span>
      <span className="grid gap-0.5">
        <span className="text-xs font-extrabold uppercase tracking-widest text-spike-700">
          Recurso oficial de LEGO® Education
        </span>
        <span className="font-display text-base font-semibold text-ink-900">{enlace.titulo}</span>
      </span>
    </a>
  );
}
