import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { Logo } from "@/components/brand/Logo";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { ExternalLinkIcon, LogOutIcon } from "@/components/ui/icons";
import { LEGO_EDUCATION_URL } from "@/config/site";
import { firstName } from "@/lib/format";
import type { SessionUser } from "@/lib/types";

/**
 * Cabecera de toda la plataforma.
 * Sin sesión: logotipo y enlace a LEGO Education.
 * Con sesión: secciones del rol, quién eres y botón para salir.
 */
export function Header({ user }: { user?: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
        <Link href="/" aria-label="ROBOTICA ALLINONE, inicio" className="rounded-xl">
          <Logo />
        </Link>

        {user ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <HeaderNav role={user.role} />
            <div className="flex items-center gap-3">
              {/* Solo el nombre de pila: cabe siempre y es como se dirige la
                  plataforma a cada persona. El nombre completo, al pasar el
                  ratón, por si alguien comparte ordenador. */}
              <span
                title={user.name}
                className="hidden max-w-44 truncate text-sm font-bold text-ink-700 md:block"
              >
                {firstName(user.name, user.email)}
              </span>
              <RoleBadge role={user.role} course={user.course} />
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-ink-200 bg-white px-4 text-sm font-extrabold text-ink-800 transition-colors hover:border-ink-900"
                >
                  <LogOutIcon className="size-4" />
                  Salir
                </button>
              </form>
            </div>
          </div>
        ) : (
          <a
            href={LEGO_EDUCATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-ink-200 bg-white px-4 text-sm font-extrabold text-ink-800 transition-colors hover:border-ink-900"
          >
            LEGO® Education
            <ExternalLinkIcon className="size-4" />
          </a>
        )}
      </div>
    </header>
  );
}
