import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LOGIN_PATH, ROLE_HOME } from "@/lib/routes";

// La portada no tiene contenido propio: lleva al panel de tu rol o al login.
// (El proxy ya hace esta redirección; esto es la red de seguridad.)
export default async function HomePage() {
  const session = await getSession();
  redirect(session ? ROLE_HOME[session.role] : LOGIN_PATH);
}
