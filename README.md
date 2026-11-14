# ROBOTICA ALLINONE

Plataforma de robótica con LEGO® Education SPIKE™ Prime para 1º, 2º y 3º de ESO.
Nueve unidades por curso, solo con bloques de palabras (ver [TEMARIO.md](./TEMARIO.md)).

**Fase actual: base de la plataforma** — diseño global, login y registro con correo del colegio,
base de datos simulada con tres roles y rutas protegidas.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · listo para Vercel.

## Ponerlo en marcha

Necesitas Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. La primera vez, `npm install` crea `package-lock.json`: súbelo
también al repositorio.

## Lo que tienes que editar

Todo está en **`src/config/site.ts`**:

| Qué | Constante | Valor inicial |
| --- | --- | --- |
| Dominio del correo del colegio | `SCHOOL_EMAIL_DOMAIN` | `"micolegio.es"` |
| Mostrar usuarios de prueba en el login | `SHOW_DEMO_CREDENTIALS` | `true` |

Los usuarios de prueba adoptan automáticamente el dominio que pongas.

## Usuarios de prueba

Están en `src/data/users.json` y se ven en la pantalla de login (un clic rellena el formulario).

| Rol | Correo | Contraseña | Panel |
| --- | --- | --- | --- |
| Superadministrador | `superadmin@micolegio.es` | `Admin1234` | `/dashboard/admin` |
| Profesor | `profesor@micolegio.es` | `Profe1234` | `/dashboard/profesor` |
| Alumno 1º ESO | `alumno1@micolegio.es` | `Alumno1234` | `/dashboard/alumno` |
| Alumno 2º ESO | `alumno2@micolegio.es` | `Alumno1234` | `/dashboard/alumno` |
| Alumno 3º ESO | `alumno3@micolegio.es` | `Alumno1234` | `/dashboard/alumno` |

## Cómo funciona el acceso

- **Registro**: nombre, correo del colegio, contraseña (mínimo 8 caracteres) y curso. Toda cuenta
  nueva entra como **alumno**; el rol de Profesor lo concederá el superadministrador.
- **Correo corporativo**: se comprueba en el navegador (aviso inmediato) y otra vez en el servidor.
- **Sesión**: cookie `httpOnly` firmada (HMAC-SHA256) que caduca a las 8 horas.
- **Rutas protegidas** (`src/proxy.ts`, el antiguo `middleware.ts` en Next.js 16):
  - sin sesión, `/dashboard/*` lleva a `/login`;
  - con sesión, `/`, `/login`, `/registro` y `/dashboard` llevan al panel del rol;
  - con un rol que no corresponde, se vuelve al panel propio. El superadministrador entra también
    al panel de profesor.
  - Cada página repite la comprobación con `requireRole()` (`src/lib/auth.ts`).

## Límites de esta fase (base de datos simulada)

- Las cuentas que se registran se guardan **en memoria**: se pierden al reiniciar el servidor y,
  en Vercel, cuando la función se reinicia. Los usuarios de prueba siempre están disponibles.
- Toda la aplicación accede a los datos a través de `src/lib/db.ts`. Para pasar a una base de datos
  real (por ejemplo Supabase) solo hay que reescribir las funciones de ese archivo.

## Desplegar en Vercel

1. Importa el repositorio en Vercel (detecta Next.js sin configuración).
2. En *Settings → Environment Variables* añade `SESSION_SECRET` con un texto largo y aleatorio
   (ver `.env.example`).
3. Antes de abrirlo al alumnado: `SHOW_DEMO_CREDENTIALS = false` y cambia o borra los usuarios de
   `src/data/users.json`.

## Estructura

```
src/
├─ proxy.ts                  Rutas protegidas y redirecciones por rol
├─ config/site.ts            ✏️ Dominio del colegio y opciones editables
├─ data/
│  ├─ users.json             Usuarios de prueba (base de datos simulada)
│  └─ unidades.json          Las 27 unidades, generadas desde TEMARIO.md
├─ lib/
│  ├─ db.ts                  Capa de datos (única puerta a los usuarios)
│  ├─ auth.ts                getSession, requireRole, abrir y cerrar sesión
│  ├─ session.ts             Cookie de sesión firmada
│  ├─ password.ts            Huella de contraseñas (scrypt)
│  ├─ validation.ts          Validación de correo corporativo y formularios
│  ├─ routes.ts              Panel de cada rol y permisos por zona
│  ├─ unidades.ts            Unidades por curso
│  └─ types.ts               Roles, cursos y tipos compartidos
├─ actions/auth.ts           Acciones de servidor: login, registro y salir
├─ components/
│  ├─ brand/                 Hub (matriz 5x5), logotipo y bloques de palabras
│  ├─ layout/                Cabecera
│  ├─ auth/                  Formularios y usuarios de prueba
│  └─ ui/                    Campo, botón, insignia de rol e iconos
└─ app/
   ├─ globals.css            🎨 Tema SPIKE: colores, radios y sombras (@theme)
   ├─ layout.tsx             Tipografías y marco global
   ├─ (auth)/login           Iniciar sesión
   ├─ (auth)/registro        Crear cuenta
   └─ dashboard/             admin · profesor · alumno
```

## Diseño

Los colores se definen una sola vez en `src/app/globals.css` y se usan como utilidades de Tailwind:
`bg-spike-600` (turquesa), `bg-hub-400` (amarillo), `text-ink-900` (gris oscuro) y
`bg-block-*` (un color por categoría de bloques). Tipografías: Fredoka para titulares y
Nunito Sans para el texto.

---

LEGO®, SPIKE™ y el logotipo de LEGO Education son marcas de The LEGO Group. Este proyecto es un
material docente independiente y no está patrocinado ni avalado por The LEGO Group.
