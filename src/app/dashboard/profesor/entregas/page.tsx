import { redirect } from "next/navigation";

/**
 * La antigua pestaña «Entregas» ya no existe: todo el seguimiento del alumno
 * —teoría, prácticas y nota de la prueba— está en la matriz de «Progreso y
 * notas alumnado».
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
  redirect(`/dashboard/profesor${query}`);
}
