import Link from "next/link";
import { COURSE_TONE } from "@/components/profesor/courseTone";
import { COURSES, COURSE_LABEL, type Course } from "@/lib/types";

/**
 * Selector de curso (1º, 2º, 3º ESO). Cambia el parámetro ?curso= de la página.
 * Con `allLabel` añade una primera opción para ver todos los cursos a la vez.
 */
export function CourseTabs({
  basePath,
  active,
  allLabel,
  extraQuery = "",
  cursos = COURSES,
}: {
  basePath: string;
  active: Course | null;
  allLabel?: string;
  /** Otros parámetros que hay que conservar, p. ej. "&estado=corregidas". */
  extraQuery?: string;
  /** Cursos que puede ver quien mira: por defecto, los tres. */
  cursos?: readonly Course[];
}) {
  // Con un solo curso visible no hay nada que elegir.
  if (cursos.length < 2 && !allLabel) return null;

  const base = "rounded-full px-4 py-2 text-sm font-extrabold transition-colors";
  const idle = "border-2 border-ink-200 bg-white text-ink-700 hover:border-ink-900";

  return (
    <nav aria-label="Curso" className="flex flex-wrap gap-2">
      {allLabel ? (
        <Link
          href={`${basePath}?curso=todos${extraQuery}`}
          aria-current={active === null ? "page" : undefined}
          className={`${base} ${active === null ? "border-2 border-ink-900 bg-ink-900 text-white" : idle}`}
        >
          {allLabel}
        </Link>
      ) : null}
      {cursos.map((course) => (
        <Link
          key={course}
          href={`${basePath}?curso=${course}${extraQuery}`}
          aria-current={active === course ? "page" : undefined}
          className={`${base} ${
            active === course ? `border-2 border-transparent ${COURSE_TONE[course]}` : idle
          }`}
        >
          {COURSE_LABEL[course]}
        </Link>
      ))}
    </nav>
  );
}
