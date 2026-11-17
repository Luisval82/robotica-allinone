// Entrar con la cuenta de Google del colegio. Es un enlace normal: la ruta
// /acceso/google prepara el viaje y manda a Google.

import { SCHOOL_EMAIL_SUFFIX } from "@/lib/validation";

/** El logotipo de Google, con sus cuatro colores. */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#4285f4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.2z"
      />
      <path
        fill="#34a853"
        d="M24 46c6 0 11-2 14.6-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.6-3.9-12.4-9.1H4.3v5.7C7.9 41.1 15.4 46 24 46z"
      />
      <path
        fill="#fbbc05"
        d="M11.6 28.2c-.5-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.3A22 22 0 0 0 2 24c0 3.6.9 6.9 2.3 9.9l7.3-5.7z"
      />
      <path
        fill="#ea4335"
        d="M24 10.7c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 4.1 30 2 24 2 15.4 2 7.9 6.9 4.3 14.1l7.3 5.7c1.8-5.2 6.6-9.1 12.4-9.1z"
      />
    </svg>
  );
}

export function BotonGoogle() {
  return (
    <div className="grid gap-2">
      <a
        href="/acceso/google"
        className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-ink-200 bg-white px-6 font-display text-base font-semibold text-ink-900 transition hover:border-ink-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-spike-500"
      >
        <GoogleIcon className="size-6" />
        Entrar con la cuenta del colegio
      </a>
      <p className="text-center text-sm font-semibold text-ink-500">
        Tu correo <span className="font-mono">{SCHOOL_EMAIL_SUFFIX}</span>. No necesitas recordar
        ninguna contraseña.
      </p>
    </div>
  );
}
