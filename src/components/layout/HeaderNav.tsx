"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";

interface NavLink {
  href: string;
  label: string;
}

// Solo el superadministrador tiene dos zonas: su pestaña exclusiva de
// «Gestión de usuarios» y el panel de profesor.
const NAV_BY_ROLE: Record<Role, NavLink[]> = {
  superadmin: [
    { href: "/dashboard/admin", label: "Gestión de usuarios" },
    { href: "/dashboard/profesor", label: "Panel de profesor" },
  ],
  profesor: [],
  alumno: [],
};

export function HeaderNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = NAV_BY_ROLE[role];
  if (links.length === 0) return null;

  return (
    <nav aria-label="Secciones" className="flex items-center gap-1">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3.5 py-2 text-sm font-extrabold transition-colors ${
              active ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
