/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  ✏️  CONFIGURACIÓN DE LA PLATAFORMA — lo único que necesitas editar   ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// ──────────────────────────────────────────────────────────────────────────
// 👉 DOMINIO DEL CORREO CORPORATIVO DEL COLEGIO
//
//    Cambia SOLO el texto entre comillas por el dominio real de tu centro.
//    Vale con o sin arroba: "micolegio.es" o "@micolegio.es".
//
//    · Solo podrán registrarse e iniciar sesión los correos que terminen así.
//    · Los usuarios de prueba de src/data/users.json adoptan este dominio
//      automáticamente (no hace falta editarlos uno a uno).
// ──────────────────────────────────────────────────────────────────────────
export const SCHOOL_EMAIL_DOMAIN = "micolegio.es";

// ──────────────────────────────────────────────────────────────────────────
// 👉 USUARIOS DE PRUEBA VISIBLES EN LA PANTALLA DE LOGIN
//
//    true  → se muestra el recuadro con correos y contraseñas de prueba.
//    false → se oculta. Ponlo en false antes de abrir la plataforma al
//            alumnado (y borra o cambia los usuarios de src/data/users.json).
// ──────────────────────────────────────────────────────────────────────────
export const SHOW_DEMO_CREDENTIALS = true;

export const APP_NAME = "ROBOTICA ALLINONE";

export const LEGO_EDUCATION_URL = "https://education.lego.com/";
