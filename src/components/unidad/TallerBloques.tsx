"use client";

// Taller libre: la misma mesa de bloques de las prácticas, pero sin reto ni
// entrega. Sirve para trastear con los bloques de una unidad.

import { EditorBloques } from "@/components/unidad/EditorBloques";

export function TallerBloques({ bloques, alto = 520 }: { bloques: string[]; alto?: number }) {
  return (
    <EditorBloques
      bloques={bloques}
      filas={[]}
      alto={alto}
      etiqueta="Taller de bloques: prueba lo que quieras"
    />
  );
}
