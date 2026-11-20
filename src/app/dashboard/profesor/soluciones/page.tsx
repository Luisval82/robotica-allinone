import { redirect } from "next/navigation";

/**
 * «Soluciones oficiales» ya no es una pestaña aparte: enseñaba el enunciado y
 * la solución de las 2 programaciones de la PRUEBA, y eso está entero dentro
 * de «Preparar clases», que además trae la teoría, el montaje, las 4
 * prácticas y el test con las respuestas.
 *
 * La redirección se queda para no romper enlaces guardados, y conserva el
 * curso y la unidad que se estuvieran mirando.
 */
export default async function SolucionesRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const trozos: string[] = [];
  if (typeof params.curso === "string") trozos.push(`curso=${params.curso}`);
  if (typeof params.ud === "string") trozos.push(`ud=${params.ud}`);
  redirect(`/dashboard/profesor/preparar${trozos.length ? `?${trozos.join("&")}` : ""}`);
}
