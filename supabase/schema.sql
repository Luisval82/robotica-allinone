-- ════════════════════════════════════════════════════════════════════════
--  ROBOTICA ALLINONE — esquema de base de datos (Supabase / PostgreSQL)
--
--  Pégalo entero en el SQL Editor de tu proyecto de Supabase y pulsa "Run".
--  Es seguro volver a ejecutarlo: las tablas se crean solo si no existen y
--  los datos de ejemplo se insertan solo si no están ya.
--
--  Qué crea:
--   1) users            → cuentas, rol (superadmin/profesor/alumno) y curso.
--   2) class_access      → interruptores de unidad y PRUEBA UD-X por CURSO.
--   3) student_access    → interruptores individuales por ALUMNO.
--   4) progreso           → pasos de teoría hechos y nota del test (8 preguntas).
--   5) entregas            → las 2 entregas de programación por bloques de cada unidad.
--  Al final: Row Level Security activado sin políticas (nadie puede leer ni
--  escribir con la Publishable key; la aplicación usa la Secret key, que
--  salta RLS igual que antes hacía la service_role key) y unos usuarios de
--  demostración para que el login y los paneles funcionen desde el primer
--  despliegue.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── 1) Usuarios ────────────────────────────────────────────────────────

create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  password_hash text not null,
  role          text not null check (role in ('superadmin', 'profesor', 'alumno')),
  course        text check (course in ('1ESO', '2ESO', '3ESO')),
  created_at    timestamptz not null default now()
);

create index if not exists users_role_idx on public.users (role);
create index if not exists users_course_idx on public.users (course);

-- ── 2) Interruptores por curso (clase entera) ─────────────────────────

create table if not exists public.class_access (
  course  text not null check (course in ('1ESO', '2ESO', '3ESO')),
  unidad  integer not null check (unidad between 1 and 9),
  kind    text not null check (kind in ('unidad', 'prueba')),
  abierta boolean not null,
  primary key (course, unidad, kind)
);

-- ── 3) Interruptores individuales por alumno ──────────────────────────

create table if not exists public.student_access (
  student_id uuid not null references public.users (id) on delete cascade,
  unidad     integer not null check (unidad between 1 and 9),
  kind       text not null check (kind in ('unidad', 'prueba')),
  abierta    boolean not null,
  primary key (student_id, unidad, kind)
);

-- ── 4) Progreso y nota del test de cada unidad ────────────────────────

create table if not exists public.progreso (
  alumno_id       uuid not null references public.users (id) on delete cascade,
  unidad          integer not null check (unidad between 1 and 9),
  pasos_teoria    integer not null default 0 check (pasos_teoria between 0 and 4),
  test_aciertos   integer check (test_aciertos between 0 and 8),
  test_respuestas jsonb,
  primary key (alumno_id, unidad)
);

-- ── 5) Entregas de programación por bloques (2 por unidad) ────────────

create table if not exists public.entregas (
  id            uuid primary key default gen_random_uuid(),
  alumno_id     uuid not null references public.users (id) on delete cascade,
  unidad        integer not null check (unidad between 1 and 9),
  practica      integer not null check (practica in (1, 2)),
  bloques       jsonb not null default '[]'::jsonb,
  explicacion   text not null default '',
  entregada_en  timestamptz not null default now(),
  nota          numeric(4, 2) check (nota is null or (nota >= 0 and nota <= 10)),
  comentario    text not null default '',
  corregida_en  timestamptz,
  corregida_por text,
  unique (alumno_id, unidad, practica)
);

create index if not exists entregas_alumno_idx on public.entregas (alumno_id);
create index if not exists entregas_pendientes_idx on public.entregas (nota) where nota is null;

-- ── Seguridad: RLS activado, sin políticas ────────────────────────────
--
-- Con RLS activado y ninguna política, nadie puede leer ni escribir estas
-- tablas con la Publishable key (ni anónimo ni autenticado). La aplicación
-- consulta siempre con la Secret key desde el servidor (src/lib/supabase.ts),
-- que salta RLS igual que antes hacía la service_role key. Así, aunque la
-- Publishable key viaje algún día al navegador, no deja ver ni tocar datos.

alter table public.users          enable row level security;
alter table public.class_access   enable row level security;
alter table public.student_access enable row level security;
alter table public.progreso       enable row level security;
alter table public.entregas       enable row level security;

-- ── Datos de demostración ──────────────────────────────────────────────
--
-- Los 5 primeros son los que se enseñan en la pantalla de login (correo
-- cambia según SCHOOL_EMAIL_DOMAIN en src/config/site.ts; aquí usamos el
-- dominio actual, colegiovaldeserra.com). Los 6 siguientes son alumnado de
-- relleno para poder probar el panel de profesor con progreso ya hecho.
-- Las contraseñas están cifradas (scrypt) con el mismo método que usa la
-- aplicación: si cambias una contraseña de demostración, cambia también la
-- lista DEMO_CREDENTIALS de src/lib/db/users.ts para que siga coincidiendo
-- con lo que se enseña en el login.
--
-- ON CONFLICT (id) DO NOTHING → puedes volver a ejecutar este script sin
-- duplicar nada ni borrar cambios que ya hayas hecho desde la aplicación.

insert into public.users (id, name, email, password_hash, role, course, created_at) values
  ('d918c954-70f3-4fcc-a661-26e194c746f9', 'Superadmin Demo',       'superadmin@colegiovaldeserra.com',    '62efa55333173f48b50b8b842692d50b:b94faf172bb5e7563a399cd1727f54ab1b96cbde99a6296d2fc26c8d61502ac46abc99b9fdd7b4b9b210e2f2bbbfc064911b5e088a89a13aca20547aa88bafa8', 'superadmin', null,    '2026-11-14T09:00:00.000Z'),
  ('235cd301-8b77-47d6-bea3-953347cebf4f', 'Profe Demo',             'profesor@colegiovaldeserra.com',      'e16afdbb0365596a0e8ad2634f5f0051:f92a175da4841301cbaa1f196e143a2562f96ca0992b05f19cf27daa1a61d1e3930bc17ae1e28fce0cdf1a1ec48a0789b4bdbf36e76eac33f6f0ec95fac2ecd0', 'profesor',   null,    '2026-11-14T09:00:00.000Z'),
  ('12559525-fc17-40cf-97a1-361a69e96c30', 'Alumno Demo Primero',    'alumno1@colegiovaldeserra.com',       'caabe69980226b6362852aa3850b151a:ed4a79c2412faae15f7ce4a7df9de94d0c660cd9d8943af2d69157dc777667a8b8ce0dceac2a0bb3120e4a794812d428641e18f3410d8c78fa0c84087afefe53', 'alumno',     '1ESO', '2026-11-14T09:00:00.000Z'),
  ('3e6ef4f3-35bd-41fb-a549-1ba101abfd59', 'Alumna Demo Segundo',    'alumno2@colegiovaldeserra.com',       '7f84d06b2598dcad7fb733651ca66978:b8f967f298ae69060e75b8cd7f79842d839a6a219b00be51632c02af406ee45faeafe1478371fe8b8f4693638c872ee09782bbad66262d251960beead432a90e', 'alumno',     '2ESO', '2026-11-14T09:00:00.000Z'),
  ('c99956d5-d95b-44f9-a35f-36200478272d', 'Alumno Demo Tercero',    'alumno3@colegiovaldeserra.com',       'f440863859c90516025779586c132250:d38ada642512bd3fbd21dc64256341fb4c2866bd18448d978504a165cb408046d52d71d0a9ddbefa9f396127dcc713d19681985302bf41c54872eacd73f54daa', 'alumno',     '3ESO', '2026-11-14T09:00:00.000Z'),
  ('6b25a793-88f1-4a13-b91d-051aab875fc5', 'Marta Ejemplo',          'marta.ejemplo@colegiovaldeserra.com', '31648de2fb5fe3a0889e50cb748b7877:b89e6955061c6205bbbbc89c0adc774f68fd48926097ee7fa3e30e559ae0ade5a3cb7499bebae17006eb7cbb4e8fbccbd5eb4147a1f75e6b6739d589b94aa343', 'alumno',     '1ESO', '2026-11-14T09:00:00.000Z'),
  ('42a2e782-b592-47a1-af10-2949d3956360', 'Hugo Ejemplo',           'hugo.ejemplo@colegiovaldeserra.com',  'ac40a1d1ecc3a7e80e484c05c14e8395:41abea00e750f7111e5b5a29192d7b0d4fe03f4e94e2b66962d99360347c1f3ea3104db5186dbec4c20ff3874ce9031f905d2a8b6470306cf4bb7c0386e27c61', 'alumno',     '1ESO', '2026-11-14T09:00:00.000Z'),
  ('25d2c019-c3f0-4b6d-bb2f-65fa01f706b4', 'Nora Ejemplo',           'nora.ejemplo@colegiovaldeserra.com',  'b50aeaf1ebcd75cadb54f2476e23c693:c687ed967392c333c9638d514a16665b7014429df39ebdeffb5b1d53e652ecdad5f1708c5e64a019362b9aae74b815d1c9508fa780ae37fcad2d9bf99ba468d2', 'alumno',     '2ESO', '2026-11-14T09:00:00.000Z'),
  ('b9db7151-436e-4528-bfe9-0aea79cc6645', 'Iván Ejemplo',           'ivan.ejemplo@colegiovaldeserra.com',  '34de76a7092b5162154f1d3aa363f584:6f55505d7e100ef8692b247ce9169b3196f98eac05af0a18665db672f10b9d7d19a7aaaf5cd943fad8c77780951267ff3147dde577c0b0700b81dc1618b58ad6', 'alumno',     '2ESO', '2026-11-14T09:00:00.000Z'),
  ('539ab4ad-0f60-4c53-b6d2-33c036abce29', 'Sara Ejemplo',           'sara.ejemplo@colegiovaldeserra.com',  '0b3c5ac9e8d99fff883621e61d2f4d1b:3eee2523ab4cd99bf8e414cfac2a13d455e70901247ae3082a184e91333e87c68deb71bf3cf75430d06e63551ec67b12aaa360920816fd5c6f274a3a20f2f611', 'alumno',     '3ESO', '2026-11-14T09:00:00.000Z'),
  ('62616f77-9ff9-464e-af15-30cb190c14f4', 'Leo Ejemplo',            'leo.ejemplo@colegiovaldeserra.com',   '87059efc566834e6450e4b8e13ddd4a9:4a2bd9d6d7ca267a328f0cb48fbdb95312fdd77f4a7d29b3fcd85cddf0a448ba03efe9b97794a920ccab4b9ed0848f5dc5e8966b6dbfde0c5ce7166c8319e177', 'alumno',     '3ESO', '2026-11-14T09:00:00.000Z')
on conflict (id) do nothing;

insert into public.progreso (alumno_id, unidad, pasos_teoria, test_aciertos) values
  ('6b25a793-88f1-4a13-b91d-051aab875fc5', 1, 4, 8),
  ('42a2e782-b592-47a1-af10-2949d3956360', 1, 4, 5),
  ('25d2c019-c3f0-4b6d-bb2f-65fa01f706b4', 1, 4, 6),
  ('b9db7151-436e-4528-bfe9-0aea79cc6645', 1, 4, 3),
  ('539ab4ad-0f60-4c53-b6d2-33c036abce29', 1, 4, 7),
  ('62616f77-9ff9-464e-af15-30cb190c14f4', 1, 2, null)
on conflict (alumno_id, unidad) do nothing;

insert into public.entregas
  (id, alumno_id, unidad, practica, bloques, explicacion, entregada_en, nota, comentario, corregida_en, corregida_por)
values
  ('2226b3ae-6e7b-49e9-b770-77d83650980b', '6b25a793-88f1-4a13-b91d-051aab875fc5', 1, 1,
   '[{"texto":"Cuando se inicia el programa","nivel":0},
     {"texto":"Fijar luz del botón central","valor":"azul","nivel":0},
     {"texto":"Escribir en la matriz de luces 5x5","valor":"MARTA","nivel":0},
     {"texto":"Apagar la matriz de luces 5x5","nivel":0}]'::jsonb,
   '', '2026-11-10T10:31:00.000Z', 9,
   'Bien resuelto y en el orden correcto. Prueba ahora a cambiar el color del botón antes de apagar la matriz.',
   '2026-11-11T08:45:00.000Z', 'Profe Demo'),

  ('7cf8f305-b6a4-43fd-9990-fde2c9aa615a', '6b25a793-88f1-4a13-b91d-051aab875fc5', 1, 2,
   '[{"texto":"Cuando se inicia el programa","nivel":0},
     {"texto":"Encender la matriz de luces 5x5 X segundos","valor":"corazón · 2","nivel":0},
     {"texto":"Tocar nota X segundos","valor":"60 · 0.5","nivel":0},
     {"texto":"Tocar nota X segundos","valor":"62 · 0.5","nivel":0},
     {"texto":"Tocar nota X segundos","valor":"64 · 0.5","nivel":0},
     {"texto":"Esperar X segundos","valor":"1","nivel":0},
     {"texto":"Apagar la matriz de luces 5x5","nivel":0}]'::jsonb,
   '', '2026-11-12T10:12:00.000Z', null, '', null, null),

  ('1d2c3e5e-04cf-4c8e-ab6c-acb8ba451531', '42a2e782-b592-47a1-af10-2949d3956360', 1, 1,
   '[{"texto":"Cuando se inicia el programa","nivel":0},
     {"texto":"Escribir en la matriz de luces 5x5","valor":"HUGO","nivel":0},
     {"texto":"Fijar luz del botón central","valor":"verde","nivel":0},
     {"texto":"Apagar la matriz de luces 5x5","nivel":0}]'::jsonb,
   'He puesto el color del botón después del nombre porque no sabía dónde iba.',
   '2026-11-12T10:05:00.000Z', null, '', null, null),

  ('2a777d2a-85db-4e9e-a1b3-181223a7f1dc', '25d2c019-c3f0-4b6d-bb2f-65fa01f706b4', 1, 1,
   '[{"texto":"Cuando se inicia el programa","nivel":0},
     {"texto":"Bucle infinito","nivel":0},
     {"texto":"Si... entonces... Si no...","valor":"¿Es de color verde?","nivel":1},
     {"texto":"Empezar a mover...","valor":"recto","nivel":2},
     {"texto":"Si no","nivel":1},
     {"texto":"Parar movimiento","nivel":2}]'::jsonb,
   '', '2026-11-10T12:35:00.000Z', 7.5,
   'Funciona. Te falta explicar qué pasa cuando el sensor no ve ninguna tarjeta.',
   '2026-11-11T09:10:00.000Z', 'Profe Demo'),

  ('67b8fa12-2c7f-4392-8919-6bd0a13df24a', '25d2c019-c3f0-4b6d-bb2f-65fa01f706b4', 1, 2,
   '[{"texto":"Cuando se inicia el programa","nivel":0},
     {"texto":"Bucle infinito","nivel":0},
     {"texto":"Si... entonces... Si no...","valor":"¿Es de color verde?","nivel":1},
     {"texto":"Empezar a mover...","valor":"recto","nivel":2},
     {"texto":"Si no","nivel":1},
     {"texto":"Si... entonces... Si no...","valor":"¿Es de color rojo?","nivel":2},
     {"texto":"Parar movimiento","nivel":3}]'::jsonb,
   '', '2026-11-13T12:20:00.000Z', null, '', null, null),

  ('33b4a736-4ea6-47d1-a2ef-16e546a49adc', '539ab4ad-0f60-4c53-b6d2-33c036abce29', 1, 1,
   '[{"texto":"Cuando se inicia el programa","nivel":0},
     {"texto":"Repetir bucle","valor":"4","nivel":0},
     {"texto":"Mover durante","valor":"10 cm","nivel":1},
     {"texto":"Mover con dirección durante","valor":"dirección 100 · 90°","nivel":1}]'::jsonb,
   'No he usado Mis bloques, lo he hecho directamente.',
   '2026-11-12T09:22:00.000Z', null, '', null, null)
on conflict (id) do nothing;

-- Nada de class_access ni student_access: por defecto solo la UD 1 está
-- abierta y las PRUEBAS están cerradas (lo decide la aplicación, no la
-- base de datos), exactamente como hacía la versión en memoria.
