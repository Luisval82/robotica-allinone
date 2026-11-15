import type { ReactNode } from "react";
import { ProfesorTabs } from "@/components/profesor/ProfesorTabs";
import { requireRole } from "@/lib/auth";

// Marco del panel de profesor: las pestañas y, debajo, cada sección.
// (Cada página repite requireRole: el layout no se vuelve a ejecutar al cambiar de pestaña.)
export default async function ProfesorLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireRole(["profesor", "superadmin"]);

  return (
    <>
      <ProfesorTabs />
      {children}
    </>
  );
}
