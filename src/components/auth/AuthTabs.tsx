import Link from "next/link";
import { LOGIN_PATH, REGISTER_PATH } from "@/lib/routes";

const TABS = [
  { id: "login", href: LOGIN_PATH, label: "Iniciar sesión" },
  { id: "registro", href: REGISTER_PATH, label: "Crear cuenta" },
] as const;

/** Selector entre «Iniciar sesión» y «Crear cuenta» en lo alto de la tarjeta. */
export function AuthTabs({ active }: { active: "login" | "registro" }) {
  return (
    <nav aria-label="Acceso" className="mb-7 grid grid-cols-2 gap-1 rounded-2xl bg-ink-100 p-1">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-xl py-2.5 text-center text-sm font-extrabold transition-colors ${
              isActive ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
