// Cliente de Supabase para el servidor.
//
// La plataforma no usa Supabase Auth: el login, las contraseñas (scrypt) y
// la cookie de sesión siguen siendo los de src/lib/password.ts y
// src/lib/session.ts. Supabase se usa solo como base de datos (PostgreSQL).
//
// Claves (formato nuevo de Supabase, noviembre 2026):
//  · Publishable key (sb_publishable_...) — pensada para el navegador. Esta
//    aplicación no hace ninguna consulta desde el cliente, así que no se usa
//    todavía; se deja aquí lista por si algún día hace falta (p. ej. Realtime
//    desde un componente de cliente).
//  · Secret key (sb_secret_...) — es la que usa TODA la aplicación, siempre
//    desde el servidor (Server Actions y páginas con "server-only"). Salta
//    las políticas de Row Level Security igual que antes hacía la clave
//    service_role, así que nunca debe llegar al navegador ni a un commit.
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

function createAdminClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error(
      "Faltan las variables de Supabase: define NEXT_PUBLIC_SUPABASE_URL y " +
        "SUPABASE_SECRET_KEY en .env.local (y en Vercel → Settings → Environment Variables).",
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Se guarda en globalThis para no abrir un cliente nuevo en cada recarga en
// caliente de `next dev` (el mismo patrón que usaba antes el almacén en memoria).
const globalForSupabase = globalThis as typeof globalThis & { __roboticaSupabase?: SupabaseClient };

export const supabase: SupabaseClient = globalForSupabase.__roboticaSupabase ?? createAdminClient();

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.__roboticaSupabase = supabase;
}
