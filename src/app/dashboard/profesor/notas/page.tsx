import { redirect } from "next/navigation";

/**
 * Esta pestaña ya no existe por separado: lo que enseñaba está ahora en la
 * matriz de «Progreso y notas alumnado», junto al resto del seguimiento del
 * alumno. La redirección se queda para no romper enlaces guardados.
 *
 * Las pantallas de detalle (/notas/[alumno]/[unidad]) siguen ahí: son a
 * donde lleva la matriz.
 */
export default async function NotasRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const curso = (await searchParams).curso;
  redirect(`/dashboard/profesor${typeof curso === "string" ? `?curso=${curso}` : ""}`);
}
