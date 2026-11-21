"use server";

// Acciones del superadministrador: los datos y el rol de cada cuenta, los
// cursos que imparte cada docente, el control de cuentas (activar, desactivar
// y borrar las de prueba), el soporte puntual sobre el trabajo de un alumno y
// el cierre de año escolar.
//
// TODAS empiezan por requireRole(["superadmin"]). Que un control no aparezca
// en pantalla no protege nada: un formulario se puede enviar a mano. La
// comprobación del servidor es la que manda, y por debajo la base de datos
// tiene además sus propios seguros (ver supabase/schema.sql: el disparador
// users_proteger_superadmin y la función borrar_cuenta).

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  actualizarCuenta,
  borrarCuenta,
  borrarResultadoDeTest,
  cerrarAnioAcademico,
  findUserById,
  getAnioActivo,
  getCursosDocente,
  reabrirPracticaIntermedia,
  setCursosDocente,
  setUserActiva,
  setUserRole,
  type CambioDeCuenta,
} from "@/lib/db";
import {
  COURSES,
  COURSE_LABEL,
  ROLE_LABEL,
  isCourse,
  isRole,
  isUuid,
  type CierreFormState,
  type Course,
  type CuentaFormState,
} from "@/lib/types";
import { SCHOOL_EMAIL_SUFFIX, isSchoolEmail, normalizeEmail } from "@/lib/validation";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Los motivos que devuelve la capa de datos, en un mensaje para la pantalla. */
function motivoEnPalabras(motivo: Exclude<CambioDeCuenta, { ok: true }>["motivo"]): string {
  switch (motivo) {
    case "no-existe":
      return "Esa cuenta ya no existe. Recarga la página.";
    case "tu-cuenta":
      return "Es tu propia cuenta: ese cambio tiene que hacerlo otro superadministrador.";
    case "ultimo-superadmin":
      return "Es el único superadministrador activo. Da el rol a otra cuenta antes de tocar esta.";
    case "correo-repetido":
      return "Ese correo ya es de otra cuenta.";
  }
}

/**
 * Guarda de una vez todo lo que se cambia en la fila de una cuenta: nombre,
 * correo, rol y —según el rol— el curso del alumno o los cursos que imparte
 * el docente.
 *
 * Va todo en un formulario porque en el listado hay un solo botón por fila:
 * con decenas de cuentas, tres botones por línea es inmanejable. El orden
 * importa: primero el rol, porque al pasar a alumno se le quitan los cursos
 * asignados, y solo después se guardan los cursos si sigue siendo docente.
 */
export async function guardarCuentaAction(
  _previous: CuentaFormState,
  formData: FormData,
): Promise<CuentaFormState> {
  const session = await requireRole(["superadmin"]);

  const userId = field(formData, "userId");
  if (!isUuid(userId)) return { error: "Cuenta no válida." };

  const name = field(formData, "name").trim();
  const email = normalizeEmail(field(formData, "email"));
  const rolPedido = field(formData, "role");
  const cursoPedido = field(formData, "course");

  if (name.length < 2) return { error: "El nombre se queda demasiado corto." };
  if (name.length > 60) return { error: "El nombre no puede pasar de 60 caracteres." };
  if (!isSchoolEmail(email)) {
    return { error: `El correo tiene que terminar en ${SCHOOL_EMAIL_SUFFIX}` };
  }
  if (!isRole(rolPedido)) return { error: "Rol no válido." };

  // Cómo está la cuenta ANTES de tocar nada: es con lo que se compara
  // después para decir en la fila qué ha cambiado exactamente.
  const antes = await findUserById(userId);
  if (!antes) return { error: "Esa cuenta ya no existe. Recarga la página." };

  const hecho: string[] = [];

  // ── 1) El rol ──────────────────────────────────────────────────────────
  //
  // Solo si de verdad cambia. Si no, nadie podría guardar su propia fila para
  // corregirse el nombre: setUserRole rechaza tocar la cuenta con la que
  // estás dentro, y aquí eso sería un error en pantalla sin motivo.
  if (rolPedido !== antes.role) {
    const cambioDeRol = await setUserRole(userId, rolPedido, {
      actorId: session.id,
      fallbackCourse: isCourse(cursoPedido) ? cursoPedido : undefined,
    });
    if (!cambioDeRol.ok) return { error: motivoEnPalabras(cambioDeRol.motivo) };
    hecho.push(`rol: ${ROLE_LABEL[rolPedido]}`);
  }

  // ── 2) Nombre, correo y curso ──────────────────────────────────────────
  // El desplegable del alumno trae "" cuando se elige «Sin curso»: eso es
  // dejarlo sin curso a propósito, no un valor que falte. Un rol no alumno no
  // manda curso ninguno, y entonces no se toca.
  const curso = isCourse(cursoPedido) ? cursoPedido : cursoPedido === "" ? null : undefined;

  const cambio = await actualizarCuenta(userId, { name, email, course: curso });
  if (!cambio.ok) return { error: motivoEnPalabras(cambio.motivo) };
  const user = cambio.user;
  if (antes.name !== name) hecho.push("nombre");
  if (antes.email !== email) hecho.push("correo");
  if (user.role === "alumno" && antes.course !== user.course) {
    hecho.push(user.course ? `curso: ${COURSE_LABEL[user.course]}` : "sin curso");
  }

  // ── 3) Los cursos que imparte, si es docente ───────────────────────────
  let aviso: string | undefined;
  if (user.role !== "alumno") {
    const marcados = formData
      .getAll("cursos")
      .filter((valor): valor is string => typeof valor === "string");
    const cursos: Course[] = COURSES.filter((course) => marcados.includes(course));
    const anteriores = await getCursosDocente(userId);

    const iguales =
      cursos.length === anteriores.length && cursos.every((c) => anteriores.includes(c));
    if (!iguales) {
      await setCursosDocente(userId, cursos);
      hecho.push(
        cursos.length === 0
          ? "sin cursos asignados"
          : `cursos: ${cursos.map((c) => COURSE_LABEL[c]).join(", ")}`,
      );
    }
    if (cursos.length === 0) {
      aviso = "Sin ningún curso asignado ve todos los cursos, con un aviso en su panel.";
    }
  }

  // El cambio de rol se nota al momento aunque esa persona tenga la sesión
  // abierta: al pisar cualquier panel se le renueva la cookie.
  revalidatePath("/dashboard", "layout");

  return {
    hecho: hecho.length === 0 ? "Sin cambios" : `Guardado · ${hecho.join(" · ")}`,
    aviso,
  };
}

/** Activa o desactiva una cuenta. No borra nada: su trabajo se queda. */
export async function setCuentaActivaAction(
  _previous: CuentaFormState,
  formData: FormData,
): Promise<CuentaFormState> {
  const session = await requireRole(["superadmin"]);

  const userId = field(formData, "userId");
  if (!isUuid(userId)) return { error: "Cuenta no válida." };
  const activa = field(formData, "activa") === "1";

  const cambio = await setUserActiva(userId, activa, { actorId: session.id });
  if (!cambio.ok) return { error: motivoEnPalabras(cambio.motivo) };

  revalidatePath("/dashboard", "layout");
  return {
    hecho: activa
      ? "Cuenta activada: ya puede entrar."
      : "Cuenta desactivada: no puede entrar y se le cierra la sesión que tuviera abierta.",
  };
}

/**
 * Borra una cuenta de prueba y todo su rastro.
 *
 * Pide escribir el correo entero, como el cierre de año pide escribir el año:
 * es lo único que hay entre un clic y perder las entregas de alguien. Los
 * seguros de verdad —no borrarse a uno mismo, no borrar a un
 * superadministrador— están en la función `borrar_cuenta` de la base de
 * datos, no aquí.
 */
export async function borrarCuentaAction(
  _previous: CuentaFormState,
  formData: FormData,
): Promise<CuentaFormState> {
  const session = await requireRole(["superadmin"]);

  const userId = field(formData, "userId");
  if (!isUuid(userId)) return { error: "Cuenta no válida." };

  const esperado = normalizeEmail(field(formData, "email"));
  const escrito = normalizeEmail(field(formData, "confirmacion"));
  if (escrito !== esperado) {
    return { error: `Para borrarla hay que escribir «${esperado}» tal cual.` };
  }

  const borrado = await borrarCuenta(userId, { actorId: session.id });
  if (!borrado.ok) return { error: borrado.error };

  const { borrada } = borrado;
  const rastro = [
    borrada.entregas > 0 ? `${borrada.entregas} entregas` : null,
    borrada.practicas > 0 ? `${borrada.practicas} prácticas` : null,
    borrada.progreso > 0 ? `${borrada.progreso} unidades de progreso` : null,
    borrada.asignaciones > 0 ? `${borrada.asignaciones} asignaciones de curso` : null,
  ].filter((parte): parte is string => parte !== null);

  revalidatePath("/dashboard", "layout");
  return {
    hecho:
      rastro.length === 0
        ? `Cuenta de ${borrada.nombre} borrada. No tenía trabajo guardado.`
        : `Cuenta de ${borrada.nombre} borrada, con ${rastro.join(", ")}.`,
  };
}

/**
 * Soporte puntual sobre el trabajo de un alumno, para desatascar un caso
 * concreto sin tocar la marcha de la clase.
 *
 *  · «practica» reabre una de las 4 prácticas de una unidad que el alumno dio
 *    por comprobada sin querer. Se le queda el programa que tenía guardado.
 *  · «test» borra el resultado del test de una unidad para que lo pueda
 *    volver a hacer. Es el único arreglo que no existe en el panel del
 *    profesor: el test se entrega una vez y ya no se puede repetir.
 *
 * Nada de esto cambia los interruptores de la clase ni abre unidades: eso
 * sigue siendo del profesor, en su panel.
 */
export async function soporteAlumnoAction(
  _previous: CuentaFormState,
  formData: FormData,
): Promise<CuentaFormState> {
  await requireRole(["superadmin"]);

  const alumnoId = field(formData, "userId");
  if (!isUuid(alumnoId)) return { error: "Cuenta no válida." };

  const unidad = Number(field(formData, "unidad"));
  if (!Number.isInteger(unidad) || unidad < 1 || unidad > 9) {
    return { error: "Elige una unidad del 1 al 9." };
  }

  const que = field(formData, "que");

  if (que === "test") {
    const borrado = await borrarResultadoDeTest(alumnoId, unidad);
    revalidatePath("/dashboard", "layout");
    return borrado
      ? { hecho: `Test de la UD ${unidad} borrado: ya puede volver a hacerlo.` }
      : { aviso: `En la UD ${unidad} no hay ningún test entregado que borrar.` };
  }

  const practica = Number(field(formData, "practica"));
  if (que !== "practica" || !Number.isInteger(practica) || practica < 1 || practica > 4) {
    return { error: "Elige qué desbloquear." };
  }

  await reabrirPracticaIntermedia(alumnoId, unidad, practica);
  revalidatePath("/dashboard", "layout");
  return {
    hecho: `Práctica ${practica} de la UD ${unidad} reabierta: puede volver a editarla.`,
  };
}

/**
 * Cierra el año escolar y abre el siguiente.
 *
 * Es la operación más delicada de la plataforma, así que pide dos cosas: el
 * año nuevo y, escrito a mano, el año que se cierra. Si lo escrito no coincide
 * con el año activo, no se toca nada.
 */
export async function cerrarAnioAction(
  _previous: CierreFormState,
  formData: FormData,
): Promise<CierreFormState> {
  await requireRole(["superadmin"]);

  const activo = await getAnioActivo();
  const confirmacion = field(formData, "confirmacion").trim();
  const anioNuevo = field(formData, "anioNuevo").trim();
  const copiar = field(formData, "copiarDocentes") === "1";

  if (confirmacion !== activo) {
    return { error: `Para cerrarlo tienes que escribir «${activo}» tal cual.` };
  }
  if (!/^\d{4}-\d{4}$/.test(anioNuevo)) {
    return { error: "El año nuevo se escribe así: 2027-2028." };
  }
  if (anioNuevo === activo) {
    return { error: `${anioNuevo} es el año que estás cerrando. Escribe el siguiente.` };
  }

  try {
    const cierre = await cerrarAnioAcademico(anioNuevo, { copiarAsignacionesDocentes: copiar });
    revalidatePath("/dashboard", "layout");
    return { cierre };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `No se ha podido cerrar el año: ${error.message}`
          : "No se ha podido cerrar el año.",
    };
  }
}
