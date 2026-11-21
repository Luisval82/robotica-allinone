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

Pestaña exclusiva «Gestión de usuarios»: **una cuenta por línea** y un solo botón de Guardar por
fila, que guarda a la vez el nombre, el correo, el rol y —según el rol— el curso del alumno o los
cursos que imparte el docente. Un cambio de rol se aplica al momento: si esa persona tiene la
sesión abierta, su siguiente clic ya la lleva al panel que le corresponde.

Por qué una línea y un botón: con sesenta cuentas, una tarjeta por persona son siete pantallas de
scroll para cambiarle el rol a una, y tres botones por fila (rol, datos, cursos) multiplican por
tres los clics y los sitios donde mirar si se guardó. Al guardar, la fila dice **qué** ha cambiado
(«Guardado · rol: Profesor · cursos: 1º ESO, 2º ESO»), no solo que se ha guardado.

**Buscador y filtros.** Un cuadro de búsqueda por nombre o correo —sin tildes: «nuñez» encuentra
«Núñez»— y dos filas de filtros: por rol (Todos, Profesores, Alumnos, Superadmins) y por curso
(1º, 2º, 3º y *Sin curso*). Filtran en el navegador sobre la lista ya cargada, así que se nota al
teclear. Con las cuentas de un centro eso sobra; si algún día fueran miles, el filtro tendría que
bajar a la consulta y paginarse.

**Contadores** encima del listado: cuentas, profesores, alumnos, superadmins, **docentes sin
cursos asignados** y **cuentas desactivadas**. Los dos últimos se resaltan cuando no son cero,
porque son los que piden hacer algo. En la fila, además, un distintivo ámbar marca al docente sin
cursos y al alumno que todavía no ha elegido.

### Control de cuentas y soporte

Cada fila tiene un desplegable **«Cuenta y soporte»**, plegado: lo delicado no se hace de un clic
despistado. Dentro:

- **La ficha de la cuenta**: si entra con Google o con contraseña, su rol, sus cursos, su estado y
  la fecha de alta.
- **Activar / desactivar.** Una cuenta desactivada existe y conserva su trabajo entero, pero no
  entra: ni con contraseña ni con Google. Y si estaba dentro, se le cierra la sesión en el
  siguiente clic (lo hace `requireRole`, pasando por `/sesion/actualizar`, que es lo único que
  puede borrar la cookie). Es lo que se usa cuando alguien deja el centro a mitad de curso, en
  lugar de borrarle las entregas.
- **Borrar una cuenta de prueba.** Pide escribir el correo entero, como el cierre de año pide
  escribir el año, y al terminar dice qué se ha llevado por delante («borrada, con 6 entregas, 11
  prácticas»).
- **Desatascar una unidad** (solo alumnado): reabrir una de las 4 prácticas que dio por comprobada
  sin querer, o **borrar el resultado del test** de una unidad para que lo pueda repetir. Lo
  segundo no existe en el panel del profesor: el test se entrega una vez y no hay otra forma de
  arreglarlo. Nada de esto toca los interruptores de la clase, que siguen siendo del profesor.

Tres cosas que el panel no deja hacer, para no quedarse fuera de la plataforma: **cambiarte el rol
o desactivarte a ti mismo**, **dejar la plataforma sin superadministrador activo** y **borrar una
cuenta de superadministrador**. Se comprueban en pantalla, otra vez en el servidor y una tercera en
la propia base de datos (ver más abajo).

### Cursos que imparte cada docente

En la misma fila, cada profesor (y el superadministrador, si da clase) tiene unas **casillas 1 / 2
/ 3**: los cursos que imparte **este año académico**, guardados en `docente_cursos`.

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

### Los seguros que viven en la base de datos

El panel comprueba los permisos en pantalla y las acciones de servidor los vuelven a comprobar
—que un control no se dibuje no protege nada: un formulario se puede enviar a mano—. Pero dos
cosas no deben depender de que la aplicación se acuerde, así que están en Postgres:

- **`proteger_ultimo_superadmin`**, un disparador sobre `users` que salta en cualquier `update` o
  `delete` que toque a un superadministrador activo y aborta si la operación dejaría la plataforma
  sin ninguno. No hay forma de saltárselo: ni desde la aplicación, ni desde el editor SQL de
  Supabase, ni por un error en un despliegue futuro.
- **`borrar_cuenta(p_user_id, p_actor_id)`**, que es quien borra de verdad. Rechaza borrar tu
  propia cuenta y rechaza borrar un superadministrador, y devuelve el recuento de lo que se ha
  llevado por delante. Su `execute` está **revocado** de `public`, `anon` y `authenticated`: solo
  la puede llamar el servidor con la Secret key, igual que `cerrar_anio_academico`.

Por encima de eso, el acceso a datos sigue siendo el de siempre: **RLS activado sin ninguna
política**, de modo que con la Publishable key no se lee ni se escribe nada, y toda consulta pasa
por el servidor con la Secret key.

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
| Progreso y notas alumnado | **La matriz**: una fila por alumno y, por cada unidad, 5 cuadrados (la teoría y las 4 prácticas de programación) más la nota de la PRUEBA. Pulsar la nota abre la corrección de ese examen; pulsar un cuadrado, esa práctica concreta. |
| Unidades y pruebas | Interruptores de cada unidad (UD 1–9) y de su PRUEBA UD-X, para toda la clase o alumno por alumno. |
| Alumnado | El correo con el que entró cada alumno, su nombre (corregible) y su curso (cambiable). |
| Preparar clases | **Todas las unidades de todos los cursos, en abierto.** La teoría (vídeo con su guion, puertos, bloques nuevos con su explicación y programa de ejemplo), el montaje con las piezas, las 4 prácticas con su solución, el test con las respuestas marcadas y las 2 programaciones de la PRUEBA. Solo consulta: no abre ni cierra nada para el alumnado. |

Pulsando un cuadrado de la matriz se abre esa unidad del alumno: sus **4 prácticas de
programación** con su estado (sin empezar, borrador o comprobada), el programa con el que cerró
cada una y un botón para **reabrir** la que haya comprobado por error. Pulsando la nota se abre la
PRUEBA: el test pregunta a pregunta y las 2 programaciones, con la solución oficial al lado y el
campo de puntos.

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
- **Enunciados paso a paso**: los enunciados que encadenan varias acciones («Pon la luz en verde,
  espera 2 segundos, cámbiala a rojo y espera otros 2») se enseñan desglosados en pasos numerados,
  con subpasos cuando la frase los lleva detrás de dos puntos. Los pasos están en el campo `pasos`
  de cada práctica y se generan con `scripts/enunciados.py`, que parte la frase **por donde ella
  misma separa las acciones**: no añade nada ni dice qué bloques usar. **80 de los 162 enunciados**
  se desglosan en 228 pasos; los otros 82 son una sola acción y se enseñan de una pieza, porque
  desglosar una sola cosa no desglosa nada. Si un corte no queda limpio, el script deja la frase
  entera: media frase suelta es peor que la frase completa.
- **Prácticas de programación (las 4 intermedias)**: el alumno compone su programa eligiendo
  bloques de la unidad (y de las anteriores) y rellenando sus huecos. Puede **guardar borrador**
  tantas veces como quiera y, cuando lo tiene, pulsa **«Guardar y comprobar»**:
  - Se le pregunta antes, porque cerrar es definitivo.
  - La práctica queda **cerrada** —campos y envío deshabilitados— y pasa a «Comprobada».
  - Aparece **al lado la solución de ejemplo**, con una línea sobre lo que importa de ese reto y el
    recordatorio de que es *un* ejemplo válido, no la única respuesta.
  - El cierre se comprueba **en el servidor**: deshabilitar los campos no basta, porque el
    formulario se puede reenviar a mano.
- **Entregas de la PRUEBA (las 2 que puntúan)**: igual, pero se entregan **una sola vez** —también con
  confirmación— y ahí **no** se enseña la solución: esas las corrige el profesor, y su solución
  oficial sigue siendo material solo para él.
- **Convenio de puertos** (`src/lib/unidades.ts`): motores en A, B y C por orden; sensor de color en
  D, de distancia en E y de fuerza en F.

### Piezas del set (`src/lib/piezas.ts`)

Catálogo de los componentes del set **SPIKE Prime (45678)**, sacado de la hoja de inventario de la
caja mirándola pieza a pieza: los seis electrónicos, las vigas (3M–15M), los ejes (2M–11M), ruedas,
engranajes, marcos, cremallera, pasadores, bujes y gomas, cada uno con su color, su medida y
**cuántos trae la caja**.

Lo más útil para un alumno es el **código de colores**: en esta caja el color dice la medida.

| Vigas | 3 amarilla · 5 morada · 7 azul · 9 negra · 11 morada · 13 azul · 15 negra |
| --- | --- |
| **Ejes** | 2 rojo · 3 amarillo · 4 negro · 5 gris · 7 amarillo · 8 negro · 9 gris · 11 amarillo |

Por eso, cuando un modelo pide una viga o un eje, debajo de las piezas aparece la **regla de
colores** (`ReglaDeColores.tsx`): las siete vigas y los ocho ejes dibujados a escala, con sus
agujeros y cuántos hay en la caja. Contar los agujeros de una viga de 11 cuesta diez segundos; ver
que es morada y larga, medio.

Cada unidad tiene en su archivo de contenido una lista **`construccion.materiales`** con las piezas
de su modelo y, donde el texto lo dice, cuántas. Esa lista se pinta con sus dibujos en «Prepara
estas piezas de tu caja», encima del carrusel de montaje del alumno y en las Soluciones del
profesor. Se genera con `scripts/materiales.py` a partir de la frase de piezas de cada unidad, y se
puede corregir a mano editando el archivo de esa unidad. Si un modelo pide más piezas de las que
trae una caja, el panel lo avisa antes de empezar a montar.

Qué está comprobado y qué no:

- Nombres, medidas, colores y cantidades de la caja: **sí**, están en la hoja del set.
- **Cuántas piezas de cada medida lleva cada modelo**: **no**. Las piezas de construcción van sin
  cantidad a propósito; para fijarlas hay que montar el modelo y anotarlas.
- Los dibujos son propios. Las imágenes y las instrucciones de montaje oficiales son de LEGO y no
  se copian al repositorio: lo que hay aquí son esquemas dibujados a mano en SVG.

### La matriz de seguimiento

Era absurdo tener tres pestañas —progreso, notas de las pruebas y seguimiento de prácticas— para
mirar al mismo alumno: para saber cómo iba en la unidad 3 había que entrar en las tres. Ahora es
una matriz, y las tres consultas por alumno son **tres consultas para todo el curso**
(`getMatrizSeguimiento`). `/dashboard/profesor/notas` y `/practicas` redirigen a ella; sus
pantallas de detalle siguen donde estaban, porque es a donde lleva la matriz.

Por cada alumno y unidad hay cinco cuadrados y una nota:

| | |
| --- | --- |
| **T** | La teoría: verde con los 4 pasos leídos, naranja a medias, gris sin empezar. |
| **4 cuadrados** | Las 4 prácticas de programación, con un punto blanco si están guardadas pero sin «Guardar y comprobar». Cada uno abre **esa** práctica: el programa del alumno y la solución, uno al lado del otro. |
| **La nota** | La de la PRUEBA, sobre 10. Gris = provisional. Punto amarillo = tienes entregas sin corregir. Al pulsarla se abre la corrección de ese examen. |

Cada zona abre una cosa y solo una: los 4 cuadrados llevan a
`/practicas/[alumno]/[unidad]/[practica]` —una práctica, con su programa y la solución al lado— y
la nota, a `/notas/[alumno]/[unidad]`, que es la PRUEBA. Son direcciones propias, no ventanas
flotantes: se pueden compartir y recargar, y el botón de atrás devuelve la matriz donde estaba.

En pantallas táctiles los cuadrados pasan de 20 a 40 px (`pointer-coarse:`), con 6 px de
separación: 46 px de centro a centro, por encima de los 44 que pide Apple. Crece el cuadrado y no
un relleno invisible, para que lo que se ve sea exactamente lo que se toca y no haya zonas que se
solapen; y `touch-manipulation` quita el retardo del doble toque. A cambio, en el iPad la tabla se
desplaza unas tres pantallas a lo ancho, con la columna del alumno fijada. Si se prefiere verlo
todo de golpe y apuntar mejor, es un número en `MatrizSeguimiento.tsx`.

**El color de las prácticas no es una nota, y la pantalla lo dice.** Sale de comparar el programa
del alumno con la solución oficial (`src/lib/parecido.ts`): estructura^1,5 × (0,6 + 0,4 × valores),
donde la estructura es la subsecuencia común más larga de bloques contando la sangría. Un programa
distinto que funcione saldrá en naranja, y eso es inevitable comparando contra una sola solución:
el cuadrado sirve para decidir a quién mirar primero, no para calificar.

La fórmula no se eligió a ojo. Medida sobre las 108 soluciones oficiales: idéntica da 1; un valor
cambiado, 0,90; un bloque de menos, 0,84; dos bloques intercambiados, 0,72 (naranja, que es donde
debe caer un error de lógica); sacar todo fuera del bucle, 0,25. Y el programa de **otra** práctica
llega a verde claro en 1 de cada 9 casos; con una media ponderada normal eran 1 de cada 4.

### Informes en PDF (`/dashboard/profesor/informes/…`)

Desde la pestaña **«Alumnado»** salen dos informes:

- **«Informe PDF»**, en la fila de cada alumno: sus datos, el avance del curso, la nota media, el
  **gráfico de evolución**, el resumen por evaluaciones y la tabla unidad por unidad (teoría,
  prácticas, test, las 2 programaciones y la nota).
- **«Informe clase PDF»**, en la cabecera de cada curso: los contadores del grupo, el mismo
  gráfico con la media de la clase y una fila por alumno con su avance, sus prácticas, sus
  pruebas cerradas, la media de cada evaluación y la media final.

**Cómo se hace el PDF: lo imprime el navegador, no lo genera el servidor.** La página se maqueta
para papel con la hoja de estilos de impresión (`@media print` al final de `src/app/globals.css`)
y el navegador la guarda como PDF —«Guardar como PDF» en el escritorio, «Compartir → Imprimir» en
el iPad—. Con `?imprimir=1` en la dirección, que es como se llega desde los botones, el diálogo se
abre solo al cargar, después de `document.fonts.ready` (si se llama a `print()` antes, algunos
navegadores capturan la página con la tipografía de reserva).

Se hizo así a propósito, no por falta de ganas de poner una librería: el informe sale con la
tipografía, los colores y el diseño **exactos** de la plataforma, no hay una dependencia nueva que
mantener, y un cambio de estilo en la web se ve en el PDF sin tocar nada. Lo que se paga es un
clic y que el nombre del archivo lo pone el navegador. Si algún día hace falta un `.pdf` que se
descargue solo —para adjuntarlo a un correo automático, por ejemplo— ahí sí haría falta generarlo
en el servidor.

#### El análisis y la orientación de nota (`src/lib/analisis.ts`)

El informe individual abre con un bloque de cuatro frases —actividad, progreso, dedicación a las
prácticas y relación entre notas y trabajo— y un distintivo con la orientación: **la nota se
corresponde**, **podría ser mayor** o **podría ser menor**.

**Lo que este análisis NO puede saber, y lo dice en el propio informe.** La plataforma no registra
los accesos (no hay historial de inicios de sesión en ninguna tabla) ni el tiempo que alguien pasa
en una pantalla; `progreso` ni siquiera lleva fecha. Lo único fechado es lo que se entrega. Así
que «actividad» significa aquí qué ha entregado y qué días, y «dedicación» son prácticas hechas,
no horas. Si algún día hace falta de verdad, eso se arregla registrando los accesos, no afinando
el análisis.

**La regla de fondo es callarse antes que inventar.** Una tendencia sacada de una unidad no es una
tendencia, y orientar una nota con un solo examen corregido no orienta nada:

| | Mínimo | Si no se llega |
| --- | --- | --- |
| Tendencia de progreso | 3 unidades empezadas | «hacen falta 3 para ver si sube o baja» |
| Etiqueta de dedicación | 3 unidades empezadas | se da el dato sin etiqueta |
| Orientación de nota | 2 PRUEBAS cerradas | «sin datos suficientes para orientar» |
| Comparación con la clase | 5 alumnos en el curso | no se compara |

La orientación sale de comparar dos números en la misma escala, **solo en las unidades donde hay
nota cerrada**: el trabajo previo (la teoría vale 2 y cada una de las 4 prácticas otros 2, hasta
10) frente a la nota de la PRUEBA. Si el hueco pasa de 2 puntos —un 20 % de la escala, suficiente
para no saltar por una práctica de más o de menos— se señala en un sentido o en otro.

Dos decisiones que conviene conocer:

- **El parecido con la solución oficial NO entra en la orientación.** La propia plataforma avisa de
  que no es una nota —un programa distinto y correcto sale en naranja—, y meterlo en una
  orientación de calificación sería amplificar una señal que ya se sabe imprecisa. Se cuenta lo
  hecho, no lo bien hecho.
- **Con una o dos unidades no se etiqueta la dedicación.** Llamar «escasa» a la dedicación de quien
  acaba de empezar la UD 1 es un juicio sin recorrido, y este papel lo lee su profesor.

Comprobado sobre nueve escenarios, incluidos los alumnos reales de la base: quien curra y saca
poco sale como «podría ser mayor» (trabajo 10 frente a nota 5,2), quien saca mucho sin practicar
como «podría ser menor» (2 frente a 9), el equilibrado como «se corresponde» (8 frente a 7,5), y
los cinco alumnos reales —ninguno pasa de una unidad— como «sin datos suficientes», que es la
respuesta correcta.

**El gráfico es SVG escrito a mano** (`src/components/informes/GraficoEvolucion.tsx`), sin
librería de gráficas: se imprime nítido a cualquier tamaño, lo pinta el servidor —así el informe
sale entero en el primer HTML— y no añade peso. Los dos ejes miden lo mismo por dentro (0–100): el
avance en % a la izquierda y la nota 0–10 a la derecha, que es el mismo punto × 10; por eso la
raya discontinua del 50 % es también el 5 de aprobado. La línea **se parte** donde no hay nota, en
lugar de inventar el tramo. El mismo componente dibuja al alumno y la media del grupo, para poder
comparar los dos mirando dibujos iguales.

Las cuentas están en `src/lib/informes.ts`, fuera de las páginas, para que el informe individual y
el de la clase digan lo mismo. El avance por unidad usa `MILESTONES_PER_UNIT` (en `src/lib/types.ts`),
el mismo que la matriz de seguimiento: si contaran distinto, el porcentaje de la pantalla no
cuadraría con el del PDF. En las medias solo entran las PRUEBAS **cerradas del todo**; una prueba a
medias daría una media baja que no dice nada, y en un papel que alguien va a leer sin poder
preguntar eso es peor que no decir nada.

Quién puede abrirlos: el profesorado de ese curso y el superadministrador, con el mismo alcance
que el resto del panel. Un profesor que escriba a mano la dirección del informe de un alumno de un
curso que no imparte recibe un 404.

**Comprobado imprimiendo de verdad**, con Chrome y la misma hoja de estilos: A4 con márgenes, la
barra de acciones no sale en el papel, el gráfico no se corta, ninguna fila se parte por la mitad
y **la cabecera de la tabla se repite en cada página** (`thead { display: table-header-group }`),
probado con un grupo de 26 alumnos que ocupa dos páginas.

### Cómo se califica una PRUEBA

Una PRUEBA vale **10 puntos de 1**:

| Parte | Puntos | Quién corrige |
| --- | --- | --- |
| 8 preguntas de test | 1 cada una → 8 | La plataforma, al pulsar «Entregar» |
| Programación 1 | 1 | El profesor |
| Programación 2 | 1 | El profesor |

La nota final es la **suma**, no una media ponderada: no hay pesos que ajustar ni nada que
configurar. En la tabla de Nota pruebas cada casilla enseña esa suma; si falta el test o alguna
programación por corregir, la casilla lleva un punto amarillo, la nota se marca como provisional y
**esa prueba no entra en la media**, porque dar por nota final algo a lo que le falta la mitad
sería mentir en la propia tabla.

Las programaciones se puntúan sobre **1**, no sobre 10 (columna `entregas.puntos`, con un `check`
de 0 a 1 en la base de datos). El formulario trae los cuatro valores de siempre —1, 0,75, 0,5 y
0— y un campo por si hace falta otro. Las correcciones que había sobre 10 se convirtieron al
cambiar la escala, dividiéndolas entre 10.

Las **4 prácticas de programación** de cada unidad no llevan nota ni la van a llevar: son los retos
con los que el alumno aprende, no el examen. Su pestaña solo sigue si están montadas y si el alumno
las dio por terminadas con «Guardar y comprobar».

### Comprobar los tipos (`scripts/tipos.sh`)

En este repositorio `npx tsc --noEmit` no sirve a secas si se ejecuta sin `node_modules`: faltan los
tipos de React, Next y Node y salen cientos de errores que en Vercel no existen. Filtrarlos por
código de error (TS2322, TS2345…) parece lo lógico y es justo lo que falló una vez: el filtro tapó
un error de verdad y el build se rompió en Vercel.

Por eso el script no filtra por criterio: guarda una foto del ruido conocido en
`scripts/tipos-base.txt`, tomada de un commit que Vercel compiló bien, y avisa **solo de lo que es
nuevo**.

```bash
./scripts/tipos.sh          # comprueba
./scripts/tipos.sh --fijar  # vuelve a tomar la foto (solo si Vercel va bien)
```

### «Preparar clases» y lo que ve el alumno son dos sitios distintos

Un profesor necesita leer la unidad 9 de 3º en septiembre sin desbloquearle nada a nadie. Por eso
la consulta vive en `/dashboard/profesor/preparar` y el alumno entra por
`/dashboard/alumno/unidad/[numero]`: **rutas distintas y lógica distinta**. La del alumno comprueba
si la unidad está abierta para él; la del profesor no comprueba nada porque no abre nada, solo lee
el contenido del repositorio. No comparten ni una línea, así que no hay forma de que una toque a la
otra. Quién puede abrirla lo decide `requireRole(["profesor", "superadmin"])`, igual que el resto
del panel.

La pestaña **«Soluciones oficiales» se ha integrado aquí**: enseñaba el enunciado y la solución de
las 2 programaciones de la PRUEBA, y eso es un trozo de esta página. `/soluciones` redirige
conservando el curso y la unidad.

### El temario de los tres cursos (`scripts/temario-1eso.py`, `-2eso.py`, `-3eso.py`)

Las 9 unidades de 1º están repartidas en **3 evaluaciones de 3 unidades**. En cada evaluación se
tocan **todos los ámbitos** —pantalla, botón y sonido, motores y giros, y los tres sensores—, y lo
que sube de una a otra es la dificultad:

| | Unidades | Nivel | Qué se añade |
| --- | --- | --- | --- |
| **1.ª evaluación** | 1 · El Hub se enciende<br>2 · El primer motor<br>3 · Los tres sentidos | 1 | Programas cortos y seguidos. Sin anidar nada: una cosa detrás de otra, y los sensores solo con «Esperar hasta que». |
| **2.ª evaluación** | 4 · Repetir sin copiar<br>5 · Conducir y el girosensor<br>6 · Si... entonces | 2 | Bucles, base de dos motores, giros controlados, el girosensor puesto a cero y las primeras condiciones. |
| **3.ª evaluación** | 7 · Dos caminos<br>8 · Giros precisos<br>9 · La feria automática | 3 | Dos respuestas según el sensor, bucles con condición de salida, giros medidos con el giroscopio y varios programas a la vez. |

Cada unidad tiene **4 prácticas de programación** (36 en total) y una **PRUEBA** de 8 preguntas de
test más 2 programaciones evaluables (9 pruebas, 72 preguntas). Todo sale de un solo script, y no
por comodidad: el contenido tiene que cumplir reglas que a mano se incumplen sin enterarse. El
script **no escribe nada** si alguna falla:

- Ninguna solución puede usar un bloque fuera de la paleta de su unidad (la paleta de la unidad N
  son sus bloques más los de todas las anteriores).
- Los valores de un bloque tienen que caber en sus huecos: `escribir Hello` admite uno, no dos.
- Un sombrero va siempre a nivel 0, y nada se mete dentro de un bloque que no sea un contenedor.
- 4 prácticas, 2 programaciones de prueba y 8 preguntas con la respuesta correcta en rango.

Está probado metiendo errores a propósito de las cuatro clases: los caza todos. Los `pasos` con
viñetas y la lista de `materiales` no los escribe este script: los generan `enunciados.py` y
`materiales.py`, que ya existían.

```bash
PYTHONPATH=scripts python3 scripts/temario-1eso.py
PYTHONPATH=scripts python3 scripts/temario-2eso.py
PYTHONPATH=scripts python3 scripts/temario-3eso.py
python3 scripts/materiales.py && python3 scripts/enunciados.py
```

**Los tres scripts antiguos** que generaban contenido de 1º (`soluciones-intermedias.py`,
`practicas-intermedias.py`, `programas-1eso.py`) ahora lo saltan o están jubilados: si volvieran a
escribir sobre 1º, revertirían este temario sin avisar.

#### 2º de ESO

2º da por sabidos la matriz de luces, los botones y los sonidos: siguen apareciendo, pero como
apoyo, no como tema. El curso va de **motores y giros más finos**, **sensores leídos como número**
y, sobre todo, **variables**: el robot deja de reaccionar al momento y empieza a acordarse de lo
que ha pasado.

| | Unidades | Qué se añade |
| --- | --- | --- |
| **1.ª evaluación** | 1 · Variables: el robot se acuerda<br>2 · Medir de verdad: centímetros y cronómetro<br>3 · Sensores con número: presión, umbrales y cuentas | La primera variable, contar sucesos, la vuelta de rueda en centímetros, el cronómetro y los umbrales elegidos a mano. |
| **2.ª evaluación** | 4 · La posición del motor<br>5 · Dos condiciones a la vez: y, o, no<br>6 · Arrancar suave: aceleración, velocidad y azar | Posición absoluta y relativa del motor, condiciones compuestas, el seguidor de línea, la aceleración y el número al azar. |
| **3.ª evaluación** | 7 · Listas: guardar una serie entera<br>8 · Mis bloques: ponerle nombre a una maniobra<br>9 · Proyecto final: la estación que toma datos | Listas y recorridos con índice, bloques propios con entradas, el gráfico de líneas y un proyecto que mide, guarda y busca el mínimo. |

Las 28 familias de bloques que 1º no usa están repartidas entre estas 9 unidades, de 2 a 5 por
unidad, sin repetir ninguna y sin solaparse con 1º.

Dos detalles del generador que conviene conocer:

- **La paleta hereda los cursos anteriores.** La paleta de una unidad de 2º son sus bloques, los de
  las unidades anteriores de 2º y **todos los de 1º**, igual que hace `getPaleta` en la aplicación.
- **La respuesta correcta se reparte entre las cuatro letras** (`reparte_respuestas`). Escribiendo
  preguntas sale casi siempre la B, y un alumno que conteste siempre B aprobaría sin leer: en 2º
  las 72 respuestas quedan 18 en cada letra. **Ojo:** las entregas guardan el índice elegido, así
  que reordenar las opciones invalida los test ya entregados de ese curso; solo se puede hacer al
  regenerar el curso entero. **1º sigue con el reparto antiguo** (50 de 72 en la B): se puede
  arreglar regenerándolo, a cambio de invalidar los test de 1º ya entregados.
- **El enlace a la lección oficial se elige por tema**, no por el vídeo del que se copia el guion:
  cada unidad nombra en `"enlace"` una URL del catálogo de lecciones que ya hay en el repositorio.
  El generador se para si una unidad nombra una URL que no está, para que no se inventen enlaces.

#### 3º de ESO

3º cierra el ciclo y **no añade ni un bloque nuevo**: el catálogo de 72 familias se agota entre 1º
(44) y 2º (28). Lo que añade es otra cosa, y es la difícil: **organizar**. Varias pilas corriendo a
la vez, bloques propios que llaman a bloques propios, y todo lo anterior exigido junto.

| | Unidades | Qué se añade |
| --- | --- | --- |
| **1.ª evaluación** | 1 · Varias cosas a la vez<br>2 · Mensajes entre programas<br>3 · Bloques propios: una librería | Varios sombreros en el mismo lienzo, la variable como tablón común, mensajes con y sin espera, y los primeros bloques propios con entradas y cuentas. |
| **2.ª evaluación** | 4 · Sensores de guardia<br>5 · Bloques que miran y deciden<br>6 · Estados | Un sombrero por sensor, bloques propios que encierran una lectura y dejan la respuesta en una variable, y una variable de fase que manda sobre todas las pilas. |
| **3.ª evaluación** | 7 · Listas en marcha<br>8 · Maniobras compuestas<br>9 · Proyecto final: el almacén | Registrar mientras se conduce, bloques dentro de bloques hasta tener una librería, y un proyecto de siete pilas con tres sensores, dos listas y estados. |

Como en 3º los `bloques` de cada unidad no son nuevos sino **los que se trabajan**, el texto de la
pantalla del alumno y de «Preparar clases» dice eso y no «los bloques nuevos». La paleta del lienzo
sigue separando los de la unidad (`propios`) de los heredados (`anteriores`), así que el alumno ve
primero los cuatro o cinco de la unidad y debajo todo lo que ya sabe.

Las respuestas de los 72 test de 3º también quedan repartidas 18 por letra
(ver `reparte_respuestas`). **1º sigue con el reparto antiguo** (50 de 72 en la B): arreglarlo pasa
por regenerarlo, a cambio de invalidar los test de 1º ya entregados.

Las unidades 1 y 2 de 3º **se quedan sin enlace a lección oficial**: LEGO no tiene ninguna sobre
ejecución simultánea ni sobre mensajes entre programas, y se prefiere dejarlo vacío antes que
poner uno que no venga a cuento.

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
