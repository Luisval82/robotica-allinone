import { getVideoEmbed } from "@/lib/video";

/**
 * Reproductor de la unidad. Admite YouTube, Vimeo, Google Drive o un
 * archivo de vídeo directo (mp4, webm…) — ver src/lib/video.ts. El enlace
 * se configura por unidad en el campo «video.url» de su archivo en
 * src/data/contenido/CURSO-N.json. Sin enlace, muestra un aviso en vez de
 * romper la página.
 */
export function VideoPlayer({ url, titulo }: { url?: string; titulo: string }) {
  const embed = getVideoEmbed(url);

  if (!embed) {
    return (
      <div className="grid aspect-video place-items-center rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50 p-6 text-center">
        <p className="font-bold text-ink-600">
          Todavía no hay vídeo para esta unidad.
          <br />
          <span className="font-semibold text-ink-500">
            Añádelo en «video.url», dentro de su archivo en src/data/contenido/.
          </span>
        </p>
      </div>
    );
  }

  if (embed.kind === "file") {
    return (
      <video controls preload="metadata" className="aspect-video w-full rounded-2xl bg-ink-900">
        <source src={embed.src} />
        Tu navegador no puede reproducir este vídeo.
      </video>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-2xl bg-ink-900">
      <iframe
        src={embed.src}
        title={`Vídeo: ${titulo}`}
        className="size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
