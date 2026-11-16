import { COURSE_LABEL, ROLE_LABEL, type Course, type Role } from "@/lib/types";

// Un color por rol, el mismo en toda la plataforma.
const ROLE_STYLE: Record<Role, string> = {
  superadmin: "bg-hub-400 text-ink-900",
  profesor: "bg-block-luz text-ink-900",
  alumno: "bg-spike-600 text-white",
};

export function RoleBadge({ role, course }: { role: Role; course?: Course | null }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${ROLE_STYLE[role]}`}
    >
      {ROLE_LABEL[role]}
      {role === "alumno" && course ? ` · ${COURSE_LABEL[course]}` : ""}
    </span>
  );
}
