# ROBOTICA ALLINONE

Plataforma de robótica con LEGO® Education SPIKE™ Prime para 1º, 2º y 3º de ESO.
Nueve unidades por curso, solo con bloques de palabras (ver [TEMARIO.md](./TEMARIO.md)).

**Fase actual: paneles del superadministrador y del profesor** — sobre la base (login y registro
con correo del colegio, tres roles y rutas protegidas) ya funcionan la gestión de roles, los
interruptores de unidades y pruebas, las notas de los tests, la corrección de entregas y el visor
de soluciones. Falta la parte del alumno dentro de cada unidad (teoría, test y entregas).

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
| Dominio del correo del colegio | `SCHOOL_EMAIL_DOMAIN` | `"colegiovaldeserra.com"` |
| Mostrar usuarios de prueba en el login | `SHOW_DEMO_CREDENTIALS` | `true` |

Los usuarios de prueba adoptan automáticamente el dominio que pongas.

## Usuarios de prueba

Están en `src/data/users.json`. Los cinco primeros se ven en la pantalla de login (un clic rellena
el formulario):

| Rol | Correo | Contraseña | Panel |
| --- | --- | --- | --- |
| Superadministrador | `superadmin@colegiovaldeserra.com` | `Admin1234` | `/dashboard/admin` |
| Profesor | `profesor@colegiovaldeserra.com` | `Profe1234` | `/dashboard/profesor` |
| Alumno 1º ESO | `alumno1@colegiovaldeserra.com` | `Alumno1234` | `/dashboard/alumno` |
| Alumno 2º ESO | `alumno2@colegiovaldeserra.com` | `Alumno1234` | `/dashboard/alumno` |
| Alumno 3º ESO | `alumno3@colegiovaldeserra.com` | `Alumno1234` | `/dashboard/alumno` |

Hay además seis alumnos de relleno (dos por curso, `"enLogin": false`) para que las clases no
estén vacías: `marta.ejemplo`, `hugo.ejemplo`, `nora.ejemplo`, `ivan.ejemplo`, `sara.ejemplo` y
`leo.ejemplo`, todos con `Alumno1234`.

## Panel del superadministrador (`/dashboard/admin`)

Pestaña exclusiva «Gestión de usuarios»: lista todas las cuentas con un botón para **dar** o
**quitar el rol de Profesor**. El cambio se aplica al momento: si esa persona tiene la sesión
abierta, su siguiente clic ya la lleva al panel que le corresponde. Quien deja de ser profesor
vuelve a ser alumno del curso con el que se registró. El superadministrador no se puede cambiar.

## Panel del profesor (`/dashboard/profesor`)

| Pestaña | Qué hace |
| --- | --- |
| Alumnado | Alumnos por curso con su progreso general, unidades abiertas, media de tests y entregas por corregir. |
| Unidades y pruebas | Interruptores de cada unidad (UD 1–9) y de su PRUEBA UD-X, para toda la clase o alumno por alumno. |
| Notas de los tests | Nota automática de cada test (8 preguntas, sobre 10) por alumno y unidad, con la media. |
| Entregas | Programa entregado, enlace a la solución oficial, nota (0–10) y comentario. |
| Soluciones | Enunciado y solución oficial, en bloques de palabras, de las 2 prácticas de cada unidad. |

Reglas de los interruptores (`src/lib/db/aula.ts`):

- Por defecto solo está abierta la **UD 1** y todas las PRUEBAS están cerradas.
- El interruptor **de la clase** vale para todo el curso y borra los ajustes individuales de esa
  unidad. El interruptor **individual** cambia solo a ese alumno.
- La **PRUEBA UD-X** se abre sola cuando el alumno termina la teoría; el profesor puede abrirla
  antes. Con la unidad bloqueada, la PRUEBA no es accesible.
- «Clase» significa curso completo (1º, 2º o 3º ESO); todavía no hay grupos (A, B…).

El progreso general cuenta cuatro hitos por unidad: teoría, test y las dos entregas (36 en total).

### Datos de prueba y contenido pendiente

- `src/data/progreso-demo.json` trae progreso, notas y entregas **inventados** para los alumnos de
  prueba, para ver el panel funcionando antes de que exista la parte del alumno. Vacía sus dos
  listas cuando empiece el uso real.
- `src/data/practicas.json` contiene las prácticas y sus soluciones. Solo hay **4 ejemplos** (UD 1
  de 1º y de 2º ESO), redactados a partir de `TEMARIO.md`: revísalos en la app SPIKE. Las otras 50
  aparecen como «Solución sin redactar» hasta que las añadas en ese archivo.

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
  - Cada página y cada acción de servidor repite la comprobación con `requireRole()`
    (`src/lib/auth.ts`), que además compara la cookie con la base de datos: si el rol ha cambiado,
    `/sesion/actualizar` renueva la cookie.

## Límites de esta fase (base de datos simulada)

- **Todo lo que se cambia desde la web vive en memoria**: cuentas nuevas, roles, interruptores y
  correcciones se pierden al reiniciar el servidor y, en Vercel, cuando la función se reinicia o
  si atienden la petición dos instancias distintas. Sirve para probar, no para dar clase.
- Toda la aplicación accede a los datos a través de `src/lib/db/`. Para pasar a una base de datos
  real (por ejemplo Supabase) solo hay que reescribir las funciones de esa carpeta.

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
│  ├─ progreso-demo.json     Progreso, notas y entregas de prueba
│  ├─ practicas.json         Prácticas y soluciones oficiales (solo profesorado)
│  └─ unidades.json          Las 27 unidades, generadas desde TEMARIO.md
├─ lib/
│  ├─ db/                    Capa de datos: store (memoria), users y aula
│  ├─ practicas.ts           Lectura de las soluciones oficiales
│  ├─ format.ts              Formato de notas y fechas
│  ├─ auth.ts                getSession, requireRole, abrir y cerrar sesión
│  ├─ session.ts             Cookie de sesión firmada
│  ├─ password.ts            Huella de contraseñas (scrypt)
│  ├─ validation.ts          Validación de correo corporativo y formularios
│  ├─ routes.ts              Panel de cada rol y permisos por zona
│  ├─ unidades.ts            Unidades por curso
│  └─ types.ts               Roles, cursos y tipos compartidos
├─ actions/
│  ├─ auth.ts                Login, registro y salir
│  ├─ admin.ts               Dar y quitar el rol de Profesor
│  └─ profesor.ts            Interruptores y corrección de entregas
├─ components/
│  ├─ brand/                 Hub (matriz 5x5), logotipo y bloques de palabras
│  ├─ layout/                Cabecera
│  ├─ auth/                  Formularios y usuarios de prueba
│  ├─ admin/                 Control del rol de Profesor
│  ├─ profesor/              Pestañas, tabla de interruptores, corrección y soluciones
│  └─ ui/                    Campo, botones, interruptor, barra de progreso e iconos
└─ app/
   ├─ globals.css            🎨 Tema SPIKE: colores, radios y sombras (@theme)
   ├─ layout.tsx             Tipografías y marco global
   ├─ (auth)/login           Iniciar sesión
   ├─ (auth)/registro        Crear cuenta
   ├─ sesion/actualizar      Renueva la cookie cuando cambia el rol
   └─ dashboard/
      ├─ admin               Gestión de usuarios
      ├─ profesor            Alumnado · unidades · notas · entregas · soluciones
      └─ alumno              Unidades del curso con su estado real
```

## Diseño

Los colores se definen una sola vez en `src/app/globals.css` y se usan como utilidades de Tailwind:
`bg-spike-600` (turquesa), `bg-hub-400` (amarillo), `text-ink-900` (gris oscuro) y
`bg-block-*` (un color por categoría de bloques). Tipografías: Fredoka para titulares y
Nunito Sans para el texto.

---

LEGO®, SPIKE™ y el logotipo de LEGO Education son marcas de The LEGO Group. Este proyecto es un
material docente independiente y no está patrocinado ni avalado por The LEGO Group.
