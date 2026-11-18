import { redirect } from "next/navigation";

/**
 * La antigua pestaña «Entregas» ya no existe: lo que llevaba nota se corrige
 * ahora en Nota pruebas, y el seguimiento sin nota de las 4 prácticas de cada
 * unidad está en Prácticas de programación.
 *
 * Esta redirección se queda para que no se rompa ningún enlace guardado ni
 * ninguna pestaña que alguien tuviera abierta.
 */
export default async function EntregasRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const curso = (await searchParams).curso;
  const query = typeof curso === "string" && curso !== "todos" ? `?curso=${curso}` : "";
  redirect(`/dashboard/profesor/practicas${query}`);
}
