// Convierte el enlace de vídeo de una unidad (campo «video.url» en
// src/data/contenido/CURSO-N.json) en algo reproducible: un iframe
// (YouTube, Vimeo o Google Drive) o un archivo de vídeo directo.
//
// Enlaces que funcionan tal cual:
//  · YouTube:      https://youtu.be/XXXX  ·  https://www.youtube.com/watch?v=XXXX
//  · Vimeo:        https://vimeo.com/XXXXXXXXX
//  · Google Drive: el enlace para compartir (…/file/d/ID/view) o el de insertar
//  · Un archivo .mp4 / .webm / .ogg / .mov servido por https (por ejemplo, subido
//    a Supabase Storage o a cualquier alojamiento con enlace directo)
// Cualquier otro enlace se intenta igualmente en un iframe: sirve para el
// enlace «insertar» de otros reproductores (Loom, Vimeo privado…).

export type VideoEmbed = { kind: "iframe"; src: string } | { kind: "file"; src: string };

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

function youtubeId(url: URL): string | null {
  if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
  if (YOUTUBE_HOSTS.has(url.hostname)) {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);
    if (match) return match[1];
  }
  return null;
}

/** Segundos de inicio del parámetro ?t= o ?start=, solo si es un número simple. */
function startSeconds(url: URL): string | null {
  const raw = url.searchParams.get("t") ?? url.searchParams.get("start");
  if (!raw) return null;
  const match = raw.match(/^(\d+)s?$/);
  return match ? match[1] : null;
}

function vimeoId(url: URL): string | null {
  if (!url.hostname.endsWith("vimeo.com")) return null;
  const match = url.pathname.match(/(\d+)/);
  return match ? match[1] : null;
}

function driveEmbedSrc(url: URL): string | null {
  if (!url.hostname.endsWith("drive.google.com")) return null;
  const match = url.pathname.match(/\/file\/d\/([^/]+)/);
  const id = match ? match[1] : url.searchParams.get("id");
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

const FILE_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];

export function getVideoEmbed(rawUrl: string | null | undefined): VideoEmbed | null {
  const value = rawUrl?.trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const youtube = youtubeId(url);
  if (youtube) {
    const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
    const start = startSeconds(url);
    if (start) params.set("start", start);
    return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${youtube}?${params}` };
  }

  const drive = driveEmbedSrc(url);
  if (drive) return { kind: "iframe", src: drive };

  const vimeo = vimeoId(url);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo}` };

  if (FILE_EXTENSIONS.some((ext) => url.pathname.toLowerCase().endsWith(ext))) {
    return { kind: "file", src: value };
  }

  return { kind: "iframe", src: value };
}
