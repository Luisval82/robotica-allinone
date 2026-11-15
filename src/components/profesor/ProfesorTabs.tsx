"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE = "/dashboard/profesor";

const TABS = [
  { href: BASE, label: "Alumnado" },
  { href: `${BASE}/unidades`, label: "Unidades y pruebas" },
  { href: `${BASE}/notas`, label: "Notas de los tests" },
  { href: `${BASE}/entregas`, label: "Entregas" },
  { href: `${BASE}/soluciones`, label: "Soluciones" },
];

/** Pestañas del panel de profesor. */
export function ProfesorTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones del panel de profesor"
      className="mb-8 flex gap-1 overflow-x-auto border-b-2 border-ink-200"
    >
      {TABS.map((tab) => {
        const active = tab.href === BASE ? pathname === BASE : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-0.5 whitespace-nowrap border-b-4 px-4 py-3 text-sm font-extrabold transition-colors ${
              active
                ? "border-spike-600 text-ink-900"
                : "border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
