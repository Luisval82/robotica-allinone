import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/routes";
import { ROLES } from "@/lib/types";

// /dashboard a secas no existe como pantalla: cada rol va a su panel.
export default async function DashboardIndexPage() {
  const session = await requireRole(ROLES);
  redirect(ROLE_HOME[session.role]);
}
