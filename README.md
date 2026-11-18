# ROBOTICA ALLINONE

Plataforma de robótica con LEGO® Education SPIKE™ Prime para 1º, 2º y 3º de ESO.
Nueve unidades por curso, solo con bloques de palabras (ver [TEMARIO.md](./TEMARIO.md)).

**Fase actual: parte del alumno** — cada unidad tiene su vista interior con cuatro pasos en
orden (guion de vídeo, puertos del Hub, bloques de palabras y modelo final) y la PRUEBA UD-X con
test autocorregido y dos entregas de programación por bloques. Están redactadas las 27 unidades
(9 por curso) a partir de `TEMARIO.md`.

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

Pestaña exclusiva «Gestión de usuarios»: lista todas las cuentas con un **selector de rol**
(Alumno, Profesor o Superadministrador) y un botón de Guardar. El cambio se aplica al momento: si
esa persona tiene la sesión abierta, su siguiente clic ya la lleva al panel que le corresponde.
Quien pasa a alumno conserva el curso con el que se registró; si no tenía, se le elige ahí mismo.

Dos cosas que el panel no deja hacer, para no quedarse fuera de la plataforma: **cambiarte el rol
a ti mismo** y **quitar el último superadministrador**. Ambas se comprueban también en el servidor.

Desde aquí hay un botón directo a las **fichas del alumnado** (`/dashboard/profesor/alumnos`), que
es donde se corrige el nombre y se mueve de curso a cada alumno.

### Cursos que imparte cada docente

En la misma tabla, cada profesor (y el superadministrador, si da clase) tiene unas **casillas 1º /
2º / 3º ESO**: los cursos que imparte **este año académico**, guardados en `docente_cursos`.

En su panel, ese profesor ve solo el alumnado, las notas, las entregas y los interruptores de
unidad de esos cursos; tampoco puede corregir una entrega ni mover a un alumno de un curso ajeno
(se comprueba en el servidor, no solo escondiendo los botones). Dos excepciones pensadas a
propósito:

- Un profesor **sin ningún curso marcado los ve todos**, con un aviso en pantalla. Así un profesor
  nuevo no se encuentra un panel vacío sin saber por qué.
- Las fichas de los alumnos que **todavía no han elegido curso** las ve todo el profesorado: hasta
  que se matriculan no son de nadie, y alguien tiene que poder colocarlos.
- Las **Soluciones** oficiales no se filtran: son material de clase, útil para preparar.

El superadministrador tiene visibilidad global siempre.

### Gestión de año escolar (`/dashboard/admin/anio`)

Cada entrega, cada test, cada práctica y cada interruptor de unidad lleva guardado el **año
académico** (`2026-2027`) en el que se hizo, y ese año forma parte de su clave. Solo hay un año
activo a la vez: eso es lo que se está trabajando, y todo lo demás es histórico.

**Al cerrar un año** (botón con confirmación: hay que escribir a mano el año que se cierra):

1. Se archivan las **matrículas** del año que termina —en qué curso estaba cada alumno—, y el año
   queda marcado con su fecha de cierre.
2. Se activa el año nuevo. Las asignaciones de cursos del profesorado se copian, o se dejan en
   blanco si desmarcas la casilla.
3. Los alumnos se quedan **sin curso activo**: al entrar les sale otra vez la pantalla de matrícula
   —con el curso siguiente ya propuesto— y empiezan las unidades desde cero, porque el progreso del
   año anterior está guardado con *su* año.

**No se borra nada.** Lo de los años cerrados se consulta en `/dashboard/admin/anio/<año>`: notas de
los tests unidad por unidad, entregas y medias, con el curso que cada alumno tenía *ese* año.

Todo el cierre lo hace la base de datos en una sola operación (`cerrar_anio_academico()`, en
`supabase/schema.sql`): o se hace completo, o no se hace nada. Esa función solo la puede ejecutar el
servidor con la Secret key.

## Panel del profesor (`/dashboard/profesor`)

| Pestaña | Qué hace |
| --- | --- |
| Alumnado | Alumnos por curso con su progreso general, unidades abiertas, media de tests y entregas por corregir. |
| Unidades y pruebas | Interruptores de cada unidad (UD 1–9) y de su PRUEBA UD-X, para toda la clase o alumno por alumno. |
| Notas de los tests | Nota automática de cada test (8 preguntas, sobre 10) por alumno y unidad, con la media. |
| Entregas | Programa entregado, enlace a la solución oficial, nota (0–10) y comentario. |
| Soluciones | Enunciado y solución oficial, en bloques de palabras, de las 2 prácticas de cada unidad. |

Pulsando cualquier casilla de la tabla de **Notas** se abre el seguimiento de ese alumno en esa
unidad: el test pregunta a pregunta y sus **4 prácticas de programación** con su estado (sin
empezar, borrador o comprobada), el programa con el que cerró cada una y un botón para **reabrir**
la que haya comprobado por error.

Reglas de los interruptores (`src/lib/db/aula.ts`):

- Por defecto solo está abierta la **UD 1** y todas las PRUEBAS están cerradas.
- El interruptor **de la clase** vale para todo el curso y borra los ajustes individuales de esa
  unidad. El interruptor **individual** cambia solo a ese alumno.
- La **PRUEBA UD-X** se abre sola cuando el alumno termina la teoría; el profesor puede abrirla
  antes. Con la unidad bloqueada, la PRUEBA no es accesible.
- «Clase» significa curso completo (1º, 2º o 3º ESO); todavía no hay grupos (A, B…).

El progreso general cuenta cuatro hitos por unidad: teoría, test y las dos entregas (36 en total).

## Panel del alumno y unidades (`/dashboard/alumno`)

El alumno ve las 9 unidades de su curso y entra en las que tiene abiertas
(`/dashboard/alumno/unidad/N`). Dentro, los contenedores se abren en orden:

| Paso | Contenido | De dónde sale |
| --- | --- | --- |
| 1 · Guion de vídeo | Reproductor del vídeo (si tiene enlace) y, debajo, el guion con lo que se ve y lo que se dice | `src/data/contenido/` |
| 2 · Esquema de puertos del Hub | Qué va en cada puerto, A–F | Se deduce del hardware de `TEMARIO.md` |
| 3 · Bloques de palabras | Cada bloque con su forma, su color y qué hace | `TEMARIO.md` + `src/data/bloques.json` |
| 4 · Modelo final | Piezas y pasos de montaje | `src/data/contenido/` |
| PRUEBA UD-X | Test de 8 preguntas y 2 entregas | `src/data/contenido/` |

- Cada paso termina con «He terminado este paso», que abre el siguiente. Al terminar los cuatro
  se abre la PRUEBA (el profesor puede abrirla antes con su interruptor).
- Cada unidad tiene un botón que abre <https://spike.legoeducation.com/> en una pestaña nueva.
- **Test**: al pulsar «Entregar» se corrige en el servidor, la nota aparece al momento y queda
  guardada para el profesor. Hay un solo intento. Las respuestas correctas no se envían al
  navegador hasta que el test está entregado.
- **Prácticas de programación (las 4 intermedias)**: el alumno compone su programa eligiendo
  bloques de la unidad (y de las anteriores) y rellenando sus huecos. Puede **guardar borrador**
  tantas veces como quiera y, cuando lo tiene, pulsa **«Guardar y comprobar»**:
  - Se le pregunta antes, porque cerrar es definitivo.
  - La práctica queda **cerrada** —campos y envío deshabilitados— y pasa a «Comprobada».
  - Aparece **al lado la solución de ejemplo**, con una línea sobre lo que importa de ese reto y el
    recordatorio de que es *un* ejemplo válido, no la única respuesta.
  - El cierre se comprueba **en el servidor**: deshabilitar los campos no basta, porque el
    formulario se puede reenviar a mano.
- **Entregas de la PRUEBA (las 2 con nota)**: igual, pero se entregan **una sola vez** —también con
  confirmación— y ahí **no** se enseña la solución: esas las corrige el profesor, y su solución
  oficial sigue siendo material solo para él.
- **Convenio de puertos** (`src/lib/unidades.ts`): motores en A, B y C por orden; sensor de color en
  D, de distancia en E y de fuerza en F.

### Piezas del set (`src/lib/piezas.ts`)

Catálogo de los componentes del set **SPIKE Prime (45678)**: los seis electrónicos con cuántos trae
la caja, las vigas por longitud (3M, 5M, 7M, 9M, 11M, 15M), los ejes (2M–12M), ruedas, engranajes,
pasadores y bujes. Cada pieza lleva su color y una línea de qué es.

Cada unidad tiene en su archivo de contenido una lista **`construccion.materiales`** con las piezas
de su modelo y, donde el texto lo dice, cuántas. Esa lista se pinta con sus dibujos en «Prepara
estas piezas de tu caja», encima del carrusel de montaje del alumno y en las Soluciones del
profesor. Se genera con `scripts/materiales.py` a partir de la frase de piezas de cada unidad, y se
puede corregir a mano editando el archivo de esa unidad.

Qué está comprobado y qué no:

- Los seis componentes electrónicos y cuántos trae la caja: **sí**.
- Las medidas en módulos y el convenio de color de ejes (impares gris, pares negro) y pasadores
  (negro de 2M, azul de 3M): **sí**, es el convenio de LEGO Technic.
- El color exacto de cada viga en este set y **cuántas vigas de cada medida lleva cada modelo**:
  **no**. Las piezas de construcción van sin cantidad a propósito; para fijarlas hay que montar el
  modelo y anotarlas.

### Contenido de las unidades

- `src/data/unidades.json` y `src/data/bloques.json` cubren las **27 unidades**: título, hardware,
  bloques (con categoría, forma y color) y modelo. Los bloques marcados con `*` en el temario llevan
  `"pendiente": true`: su nombre está por comprobar en la app SPIKE.
- `src/data/contenido/CURSO-N.json` contiene lo redactado de cada unidad: reto, guion de vídeo,
  explicación de cada bloque, pasos de montaje, test (con la respuesta correcta y su explicación) y
  las dos prácticas de la PRUEBA con su solución oficial, y las **4 prácticas intermedias** con su
  enunciado, su pista, su solución de ejemplo (`solucion`) y su nota (`notas`). Hay **27 archivos**,
  uno por unidad. En total: 216 preguntas de test, 54 prácticas de PRUEBA y **108 prácticas
  intermedias**, todas con solución.
- Las 108 soluciones de ejemplo se escribieron con `scripts/soluciones-intermedias.py`, que valida
  que cada bloque usado esté en la paleta de su unidad y que los valores cuadren con los huecos y
  desplegables de ese bloque. Para cambiar una, edita el archivo de la unidad o el script.
- Para corregir un texto, una pregunta o una solución, edita el archivo de esa unidad. Si añades
  un archivo nuevo, regístralo en `src/data/contenido/index.ts`.
- **Vídeo real (paso 1)**: añade el campo `"url"` dentro de `"video"` en el archivo de esa unidad
  (por ejemplo `"url": "https://youtu.be/XXXXXXXXXXX"`) y aparece un reproductor de verdad encima
  del guion, que se deja debajo como apoyo. Admite un enlace de YouTube, Vimeo, Google Drive o un
  archivo de vídeo (`.mp4`, `.webm`…) — ver `src/lib/video.ts`. Sin `"url"`, el paso 1 muestra el
  aviso de que falta el vídeo.
  - **Importante sobre "oficial" en YouTube**: LEGO® Education no publica sus tutoriales en
    YouTube; los aloja en su propio reproductor (23video), en `education.lego.com`. Ese
    reproductor sí ofrece enlaces de **embed oficiales** (parámetro `source=embed`), así que en
    las unidades sobre Hub, Motores y Sensores (`1ESO-1/2/3/5/7/8`, `2ESO-5/6`, `3ESO-3/5`) el
    campo `"video.url"` ya lleva ese enlace de embed real de LEGO y el reproductor lo muestra
    incrustado de verdad.
  - Para el resto de temas (bucles, variables, línea, proyectos finales…) LEGO no tiene vídeo
    propio, así que 22 de las 27 unidades llevan en su lugar
    `"video.enlaceOficial": { "titulo": "...", "url": "..." }`: un enlace verificado a la lección
    o tutorial oficial de `education.lego.com` sobre ese mismo tema. Se muestra como una tarjeta
    con enlace (no como vídeo embebido) debajo del reproductor o del aviso de «falta vídeo». Las
    5 unidades sin correspondencia oficial razonable (`1ESO-9`, `2ESO-4`, `2ESO-7`, `2ESO-8`, y
    las que no tienen ni vídeo ni lección oficial) se dejaron sin ese enlace en vez de forzar uno
    que no encajara. Si localizas o prefieres un vídeo de YouTube de un canal concreto para
    alguna unidad, añádelo tú en `"video.url"`: el reproductor lo incrusta igual.
- Todo el contenido es un borrador redactado a partir del temario: conviene repasarlo con la app
  SPIKE y el set delante antes de usarlo en clase, sobre todo las soluciones de 3º.
- Los pasos de montaje describen el modelo por funciones, no pieza a pieza: revísalos con el set
  delante. Los colores de las categorías están en `src/app/globals.css` (`--color-block-*`).

### Datos de prueba

`src/data/progreso-demo.json` trae progreso, notas y entregas **inventados** para los seis alumnos
de relleno, para que el panel del profesor no esté vacío. Los tres alumnos del login empiezan de
cero y sirven para probar el recorrido completo. Vacía sus dos listas cuando empiece el uso real.

## Cómo funciona el acceso

- **Entrar con Google** (`/acceso/google`): botón «Entrar con la cuenta del colegio». Solo aparece
  si están puestas `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`, y solo admite correos verificados
  del dominio del colegio. Se reconoce a cada persona por el identificador de Google, que no
  cambia aunque le cambien el correo.
  - Si **ya tenía cuenta** con ese correo (un profesor o el superadministrador dados de alta con
    contraseña), se le enlaza Google y **conserva su rol**: entra directo a su panel, sin pantalla
    de curso ni perfil de alumno.
  - Si es **nueva**, nace como alumno y pasa por `/bienvenida` a decir su nombre y su curso… salvo
    que su correo esté en `SUPERADMIN_EMAILS` o `PROFESOR_EMAILS` (listas separadas por comas en
    Vercel), en cuyo caso entra ya con ese rol. Útil para la primera entrada del superadministrador,
    cuando todavía no hay nadie que le pueda dar el rol.
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

- **Todo lo que se cambia desde la web vive en memoria**: cuentas nuevas, roles, interruptores,
  pasos terminados, tests, entregas y correcciones se pierden al reiniciar el servidor y, en Vercel, cuando la función se reinicia o
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
│  ├─ unidades.json          Las 27 unidades, generadas desde TEMARIO.md
│  ├─ bloques.json           Catálogo de bloques: categoría, forma y color
│  └─ contenido/             Guion, montaje, test y prácticas de cada unidad redactada
├─ lib/
│  ├─ db/                    Capa de datos: store (memoria), users y aula
│  ├─ contenido.ts           Contenido de las unidades, tests y soluciones (solo servidor)
│  ├─ bloques.ts             Categoría, forma y color de cada bloque
│  ├─ paleta.ts              Bloques disponibles para las entregas de cada unidad
│  ├─ format.ts              Formato de notas y fechas
│  ├─ auth.ts                getSession, requireRole, abrir y cerrar sesión
│  ├─ session.ts             Cookie de sesión firmada
│  ├─ password.ts            Huella de contraseñas (scrypt)
│  ├─ validation.ts          Validación de correo corporativo y formularios
│  ├─ routes.ts              Panel de cada rol y permisos por zona
│  ├─ unidades.ts            Unidades por curso y esquema de puertos del Hub
│  └─ types.ts               Roles, cursos y tipos compartidos
├─ actions/
│  ├─ auth.ts                Login, registro y salir
│  ├─ admin.ts               Dar y quitar el rol de Profesor
│  ├─ alumno.ts              Terminar pasos, entregar el test y entregar programas
│  └─ profesor.ts            Interruptores y corrección de entregas
├─ components/
│  ├─ brand/                 Hub (matriz 5x5), logotipo y bloques de palabras
│  ├─ layout/                Cabecera
│  ├─ auth/                  Formularios y usuarios de prueba
│  ├─ admin/                 Control del rol de Profesor
│  ├─ profesor/              Pestañas, tabla de interruptores y corrección
│  ├─ unidad/                Pasos, esquema de puertos, test y caja de entrega
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
      └─ alumno              Unidades del curso y vista interior de cada una (unidad/N)
```

## Diseño

Los colores se definen una sola vez en `src/app/globals.css` y se usan como utilidades de Tailwind:
`bg-spike-600` (turquesa), `bg-hub-400` (amarillo), `text-ink-900` (gris oscuro) y
`bg-block-*` (un color por categoría de bloques). Tipografías: Fredoka para titulares y
Nunito Sans para el texto.

---

LEGO®, SPIKE™ y el logotipo de LEGO Education son marcas de The LEGO Group. Este proyecto es un
material docente independiente y no está patrocinado ni avalado por The LEGO Group.
