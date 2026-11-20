"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE = "/dashboard/profesor";

// Cuatro pestañas y ninguna que repita lo de otra. El progreso, las notas de
// las pruebas y el seguimiento de las prácticas eran tres pestañas distintas
// para mirar al mismo alumno: ahora son una matriz.
const TABS = [
  { href: BASE, label: "Progreso y notas alumnado" },
  { href: `${BASE}/alumnos`, label: "Alumnado" },
  { href: `${BASE}/unidades`, label: "Unidades y pruebas" },
  { href: `${BASE}/preparar`, label: "Preparar clases" },
];

/**
 * Las pantallas de corregir una prueba y de ver las prácticas de un alumno no
 * tienen pestaña propia: se entra a ellas desde la matriz, así que la pestaña
 * que se queda encendida es la suya.
 */
const DE_LA_MATRIZ = [`${BASE}/notas`, `${BASE}/practicas`];

function estaActiva(href: string, pathname: string): boolean {
  if (href !== BASE) return pathname.startsWith(href);
  return pathname === BASE || DE_LA_MATRIZ.some((ruta) => pathname.startsWith(ruta));
}

/** Pestañas del panel de profesor. */
export function ProfesorTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones del panel de profesor"
      className="mb-8 flex gap-1 overflow-x-auto border-b-2 border-ink-200"
    >
      {TABS.map((tab) => {
        const active = estaActiva(tab.href, pathname);
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
