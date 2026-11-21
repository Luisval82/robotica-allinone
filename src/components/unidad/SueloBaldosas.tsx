// El recordatorio de la baldosa, junto a las prácticas que se hacen en el
// suelo del aula.
//
// El suelo de terrazo del aula son baldosas de 40 × 40 cm, y eso es mejor
// regla que cualquier metro: las juntas forman una cuadrícula, las crucetas
// marcan las esquinas y el alumno ve de un vistazo si el robot se ha pasado
// medio palmo. Los enunciados cuentan el recorrido en baldosas y aquí se
// recuerda cómo pasar de baldosas a lo que entiende el robot.
//
// El cómo cambia con el curso, porque los bloques disponibles cambian:
//
//  · En 1º todavía no existe el bloque de la vuelta de rueda, así que el
//    robot se mueve en ROTACIONES y la equivalencia se mide a mano. Es la
//    mejor versión del ejercicio: la baldosa es la verdad y el número sale
//    de probar.
//  · Desde 2º se fija la vuelta de rueda en 17,5 cm y el robot entiende
//    centímetros, así que una baldosa son 40 y punto. Lo que se comprueba
//    entonces es si esos 40 programados son 40 reales.

import type { Course } from "@/lib/types";

/** Una baldosa de terrazo del aula, en centímetros. */
export const BALDOSA_CM = 40;

/** Vuelta de rueda nominal de la base de conducción, en centímetros. */
const VUELTA_CM = 17.5;

export function SueloBaldosas({ curso }: { curso: Course }) {
  const rotaciones = (BALDOSA_CM / VUELTA_CM).toFixed(1).replace(".", ",");

  return (
    <div className="mt-2 rounded-xl border-2 border-spike-200 bg-spike-50 px-4 py-2.5">
      <p className="text-sm font-extrabold text-spike-800">
        Suelo del aula: baldosas de {BALDOSA_CM} × {BALDOSA_CM} cm
      </p>
      <ul className="mt-1 space-y-0.5 text-sm font-semibold text-ink-700">
        <li>
          Cuenta el recorrido en baldosas y usa las juntas como marcas: una cruceta es una
          esquina exacta.
        </li>
        {curso === "1ESO" ? (
          <li>
            <strong className="font-extrabold text-ink-900">Antes de programar:</strong> pon el
            robot con las ruedas en una junta, prueba con {rotaciones} rotaciones y mira dónde
            para. Sube o baja el número hasta que llegue justo a la siguiente junta, y apunta el
            tuyo: cruzar una baldosa son unas {rotaciones} rotaciones.
          </li>
        ) : (
          <li>
            <strong className="font-extrabold text-ink-900">Antes de programar:</strong> con la
            vuelta de rueda fijada en {VUELTA_CM.toString().replace(".", ",")} cm, una baldosa son{" "}
            {BALDOSA_CM} cm. Manda {BALDOSA_CM} y mira si para en la junta; si se queda corto o se
            pasa, ajusta ese {VUELTA_CM.toString().replace(".", ",")} hasta que cuadre.
          </li>
        )}
        <li>
          Si patina al arrancar o al frenar, baja la velocidad antes de tocar los números: un
          número bien calculado no arregla una rueda que resbala.
        </li>
      </ul>
    </div>
  );
}
