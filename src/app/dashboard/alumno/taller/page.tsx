import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { TallerBloques } from "@/components/unidad/TallerBloques";
import { requireRole } from "@/lib/auth";
import { ALL_BLOCKS } from "@/lib/bloques";

export const metadata: Metadata = { title: "Taller de bloques" };

// Prueba del taller: por ahora, los bloques de Motores y Movimiento, que son
// los que ya están pieza a pieza en el catálogo.
const CATEGORIAS_LISTAS = ["motores", "movimiento", "luz", "eventos", "control"];

export default async function TallerPage() {
  await requireRole(["alumno"]);

  const bloques = ALL_BLOCKS.filter((info) => CATEGORIAS_LISTAS.includes(info.categoria)).map(
    (info) => info.texto,
  );

  return (
    <div className="grid gap-6">
      <div>
        <Link
          href="/dashboard/alumno"
          className="inline-flex items-center gap-2 font-bold text-ink-600 transition hover:text-ink-900"
        >
          <ArrowLeftIcon className="size-4" />
          Mis unidades
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">
          Taller de bloques
        </h1>
        <p className="mt-2 max-w-3xl font-semibold text-ink-700">
          Arrastra los bloques desde la paleta de la izquierda y encájalos, igual que en la app
          SPIKE. Es para practicar: lo que montes aquí no se entrega.
        </p>
      </div>

      <TallerBloques bloques={bloques} alto={560} />

      <p className="text-sm font-semibold text-ink-600">
        El taller usa Blockly con el diseño de bloques de Scratch 3, que es sobre el que está hecha
        la app de SPIKE. Los bloques salen del mismo catálogo que la teoría de cada unidad.
      </p>
    </div>
  );
}
