// Aviso de qué cursos está viendo quien entra en el panel de profesor.

import type { AlcanceDocente } from "@/lib/db/docentes";
import { COURSE_LABEL, type Course } from "@/lib/types";

export function AvisoAlcance({
  alcance,
  cursos,
}: {
  alcance: AlcanceDocente;
  cursos: Course[];
}) {
  // El superadministrador lo ve todo y ya lo sabe: no hace falta decírselo.
  if (alcance === "todos") return null;

  if (alcance === "sin-asignar") {
    return (
      <p className="mt-4 rounded-2xl bg-hub-400 px-5 py-3 font-semibold text-ink-900">
        No tienes cursos asignados este año, así que de momento ves todos. Pídele al
        superadministrador que te marque los tuyos en Gestión de usuarios.
      </p>
    );
  }

  const lista = cursos.map((course) => COURSE_LABEL[course]).join(" y ");
  return (
    <p className="mt-4 rounded-2xl bg-spike-50 px-5 py-3 font-semibold text-spike-800">
      Estás viendo {cursos.length === 1 ? "tu curso" : "tus cursos"}: {lista}.
    </p>
  );
}
