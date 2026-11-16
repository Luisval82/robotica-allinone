/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  ✏️  CONFIGURACIÓN DE LA PLATAFORMA — lo único que necesitas editar   ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// ──────────────────────────────────────────────────────────────────────────
// 👉 DOMINIO DEL CORREO CORPORATIVO DEL COLEGIO
//
//    Cambia SOLO el texto entre comillas por el dominio real de tu centro.
//    Vale con o sin arroba: "colegiovaldeserra.com" o "@colegiovaldeserra.com".
//
//    · Solo podrán registrarse e iniciar sesión los correos que terminen así.
//    · Los usuarios de prueba viven ahora en la base de datos de Supabase
//      (ver supabase/schema.sql) y en la lista DEMO_CREDENTIALS de
//      src/lib/db/users.ts; si cambias este dominio, actualiza también sus
//      correos en esos dos sitios.
// ──────────────────────────────────────────────────────────────────────────
export const SCHOOL_EMAIL_DOMAIN = "colegiovaldeserra.com";

// ──────────────────────────────────────────────────────────────────────────
// 👉 USUARIOS DE PRUEBA VISIBLES EN LA PANTALLA DE LOGIN
//
//    true  → se muestra el recuadro con correos y contraseñas de prueba.
//    false → se oculta. Ponlo en false antes de abrir la plataforma al
//            alumnado (y borra esas cuentas de la tabla users en Supabase).
// ──────────────────────────────────────────────────────────────────────────
export const SHOW_DEMO_CREDENTIALS = true;

export const APP_NAME = "ROBOTICA ALLINONE";

export const LEGO_EDUCATION_URL = "https://spike.legoeducation.com/";
