// Un alumno por línea: el nombre (corregible), el correo con el que entró, su
// curso y el botón de guardar.
//
// Antes cada alumno era una tarjeta con sus rótulos encima de cada campo y
// ocupaba unos 110 px. Con 60 alumnos eso son siete pantallas de scroll para
// cambiarle el curso a uno. Puesto en una línea ocupa 44, y los rótulos van
// una sola vez arriba, en la cabecera del listado.
//
// Los campos, el desplegable, el botón y la acción son exactamente los de
// antes: lo único que cambia es el tamaño y el aire.

import { actualizarAlumnoAction } from "@/actions/profesor";
import { PendingButton } from "@/components/ui/PendingButton";
import { COURSES, COURSE_LABEL, type PublicUser } from "@/lib/types";

/**
 * Las columnas del listado. La cabecera y las filas usan esta misma plantilla
 * para que no se descuadren: si se toca una, se tocan las dos a la vez.
 *
 * En pantalla estrecha son tres columnas y el correo baja a su propia línea;
 * a partir de `sm` entra todo en una.
 */
const COLUMNAS =
  "grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[minmax(7rem,1.2fr)_minmax(0,1.4fr)_auto_auto]";

/** Los rótulos, una vez por bloque de curso en lugar de uno por alumno. */
export function CabeceraAlumnos() {
  return (
    <div
      aria-hidden="true"
      className={`${COLUMNAS} border-b-2 border-ink-100 px-3 py-2 text-[0.65rem] font-extrabold uppercase tracking-widest text-ink-500`}
    >
      <span>Nombre y apellidos</span>
      <span className="hidden sm:block">Correo</span>
      <span>Curso</span>
      <span className="text-right">Acción</span>
    </div>
  );
}

export function FilaAlumno({ alumno }: { alumno: PublicUser }) {
  return (
    <form
      action={actualizarAlumnoAction}
      className={`${COLUMNAS} px-3 py-1.5 transition-colors hover:bg-ink-50`}
    >
      <input type="hidden" name="userId" value={alumno.id} />

      <input
        id={`nombre-${alumno.id}`}
        name="name"
        type="text"
        aria-label={`Nombre y apellidos de ${alumno.name}`}
        defaultValue={alumno.name}
        maxLength={80}
        className="h-8 w-full min-w-0 rounded-lg border-2 border-ink-200 bg-white px-2 text-sm font-semibold text-ink-900 transition-colors focus:border-spike-500"
      />

      {/* El correo no se edita: solo sirve para saber qué cuenta es. */}
      <p
        className="order-last col-span-3 truncate font-mono text-xs text-ink-500 sm:order-none sm:col-span-1"
        title={alumno.email}
      >
        {alumno.email}
      </p>

      <select
        id={`curso-${alumno.id}`}
        name="course"
        aria-label={`Curso de ${alumno.name}`}
        defaultValue={alumno.course ?? ""}
        className="h-8 rounded-lg border-2 border-ink-200 bg-white px-2 text-sm font-semibold text-ink-900 transition-colors focus:border-spike-500"
      >
        {alumno.course === null ? <option value="">Sin curso</option> : null}
        {COURSES.map((curso) => (
          <option key={curso} value={curso}>
            {COURSE_LABEL[curso]}
          </option>
        ))}
      </select>

      <PendingButton size="compacto" pendingLabel="…">
        Guardar
      </PendingButton>
    </form>
  );
}
