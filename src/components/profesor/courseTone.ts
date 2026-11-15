import type { Course } from "@/lib/types";

/** Un color de bloque por curso, el mismo en todo el panel de profesor. */
export const COURSE_TONE: Record<Course, string> = {
  "1ESO": "bg-block-sensores text-ink-900",
  "2ESO": "bg-block-luz text-white",
  "3ESO": "bg-block-movimiento text-white",
};
