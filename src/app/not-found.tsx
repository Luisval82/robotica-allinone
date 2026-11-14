import Link from "next/link";
import { HubIllustration } from "@/components/brand/Hub";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <HubIllustration pattern="triste" blink={false} className="w-32" />
      <h1 className="mt-8 font-display text-4xl font-semibold text-ink-900">
        Esta página no existe
      </h1>
      <p className="mt-3 text-lg font-semibold text-ink-500">
        Puede que el enlace esté mal escrito o que la página se haya movido.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-14 items-center justify-center rounded-2xl bg-spike-600 px-8 font-display text-lg font-semibold tracking-wide text-white shadow-press-spike transition hover:bg-spike-700 active:translate-y-1 active:shadow-none"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
