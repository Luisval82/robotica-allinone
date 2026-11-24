// Una muestra de color con su etiqueta, para las leyendas de la matriz.
// La usan la del profesor y la del alumno: el mismo cuadrado y el mismo
// tamaño, para que los dos lean la tabla con la misma referencia.

import type { ReactNode } from "react";

export function Muestra({ clase, children }: { clase: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={`inline-block size-3.5 rounded-[0.2rem] ${clase}`} />
      {children}
    </span>
  );
}
