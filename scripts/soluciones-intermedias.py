"""Las soluciones de ejemplo de las 108 prácticas intermedias.

Se las enseña la plataforma al alumno cuando pulsa «Guardar y comprobar», para
que compare su programa con uno que funciona. NO son la única respuesta
válida: son un ejemplo resuelto. Por eso cada una lleva una nota corta con lo
que de verdad importa de ese reto.

Reglas que se siguen aquí:
  · Solo bloques que el alumno ya tiene en su paleta (los de su unidad y los
    de las unidades anteriores, que son acumulativas).
  · Puertos del convenio de la plataforma: motores A, B y C; sensor de color
    D, de distancia E, de fuerza F.
  · «valores» para los bloques con desplegables y huecos, en su orden;
    «valor» para los demás (la etiqueta que se ve en su píldora).
  · «nivel» es la sangría: lo que va dentro de un bucle o de un «Si» sube uno.
"""

import json

# ── Atajos para escribir los programas ───────────────────────────────────


def b(texto, nivel=0, valores=None, valor=None):
    fila = {"texto": texto, "nivel": nivel}
    if valores is not None:
        fila["valores"] = valores
    if valor is not None:
        fila["valor"] = valor
    return fila


def ini(nivel=0):
    return b("Cuando se inicia el programa", nivel)


def esperar(segundos, nivel=0):
    return b("Esperar X segundos", nivel, valor=str(segundos))


def nota_musical(valor, nivel=0):
    return b("Tocar nota X segundos", nivel, valor=valor)


def escribir(texto, nivel=0):
    return b("escribir Hello", nivel, valores=[texto])


def apagar(nivel=0):
    return b("apagar píxeles", nivel, valores=[])


def dibujo(cual="corazón", segundos=None, nivel=0):
    if segundos is None:
        return b("encender dibujo", nivel, valores=[cual])
    return b("encender dibujo durante 2 segundos", nivel, valores=[cual, str(segundos)])


def luz_boton(color, nivel=0):
    return b("poner luz del botón central en rojo", nivel, valores=[color])


def motor_durante(puerto, sentido, cantidad, unidad, nivel=0):
    return b("A ir durante 1 rotaciones", nivel, valores=[puerto, sentido, str(cantidad), unidad])


def motor_posicion(puerto, posicion, nivel=0, ruta="por la ruta más corta"):
    return b("A ir por la ruta más corta a la posición 0", nivel, valores=[puerto, ruta, str(posicion)])


def motor_velocidad(puerto, velocidad, nivel=0):
    return b("A fijar velocidad al 75 %", nivel, valores=[puerto, str(velocidad)])


def motor_arrancar(puerto="A", sentido="↻", nivel=0):
    return b("A arrancar motor", nivel, valores=[puerto, sentido])


def motor_parar(puerto="A", nivel=0):
    return b("A parar motor", nivel, valores=[puerto])


def repetir(veces, nivel=0):
    return b("Repetir bucle", nivel, valor=str(veces))


def repetir_hasta(condicion, nivel=0):
    return b("Repetir bucle hasta", nivel, valor=condicion)


def bucle_infinito(nivel=0):
    return b("Bucle infinito", nivel)


def esperar_hasta(condicion, nivel=0):
    return b("Esperar hasta que", nivel, valor=condicion)


def si(condicion, nivel=0):
    return b("Si... entonces...", nivel, valor=condicion)


def si_sino(condicion, nivel=0):
    return b("Si... entonces... Si no...", nivel, valor=condicion)


def sino(nivel=0):
    return b("Si no", nivel)


def sonido(cual="timbre", nivel=0):
    return b("Tocar sonido hasta acabar", nivel, valor=cual)


def fijar_var(valor, nivel=0):
    return b("Fijar variable a", nivel, valor=valor)


def cambiar_var(valor, nivel=0):
    return b("Cambiar variable por", nivel, valor=valor)


# ── Preparación del robot rodante, los tres bloques de siempre ───────────
def preparar_movimiento(par="A+B", velocidad=50, nivel=0):
    return [
        b("fijar A+B como motores en movimiento", nivel, valores=[par]),
        b("fijar 1 rotación del motor en 17.5 cm recorridos", nivel, valores=["17.5", "cm"]),
        b("fijar velocidad de movimiento al 50 %", nivel, valores=[str(velocidad)]),
    ]


def mover(direccion, cantidad, unidad, nivel=0):
    return b("mover ↑ durante 10 rotaciones", nivel, valores=[direccion, str(cantidad), unidad])


def mover_girando(direccion, cantidad, unidad, nivel=0):
    return b(
        "mover derecha: 30 durante 10 rotaciones", nivel, valores=[direccion, str(cantidad), unidad]
    )


def empezar_mover(direccion="↑", nivel=0):
    return b("empezar a mover a ↑", nivel, valores=[direccion])


def empezar_mover_girando(direccion, nivel=0):
    return b("empezar a mover derecha: 30", nivel, valores=[direccion])


def parar_movimiento(nivel=0):
    return b("parar movimiento", nivel, valores=[])


def definir(firma, nivel=0):
    return b("Definir mi bloque", nivel, valor=firma)


def mi_bloque(llamada, nivel=0):
    return b("Mi bloque", nivel, valor=llamada)


def S(notas, *filas):
    """Una solución: su nota corta y las filas del programa."""
    return {"notas": notas, "solucion": list(filas)}


SOLUCIONES = {}

# ══ 1º ESO ═══════════════════════════════════════════════════════════════

SOLUCIONES["1ESO-1"] = [
    S(
        "Con «durante» el dibujo se apaga solo al acabar. El «apagar píxeles» del final deja la matriz limpia del todo.",
        ini(),
        dibujo("corazón", 3),
        apagar(),
    ),
    S(
        "El orden es lo que cuenta: «escribir» no deja pasar al bloque siguiente hasta que termina de escribir tu nombre.",
        ini(),
        escribir("tu nombre"),
        dibujo("corazón", 2),
        apagar(),
    ),
    S(
        "Sin los «Esperar» en medio, los dos colores se pondrían tan rápido que solo verías el último.",
        ini(),
        luz_boton("verde"),
        esperar(2),
        luz_boton("rojo"),
        esperar(2),
    ),
    S(
        "Un ejemplo entre muchos: vale cualquier nota, cualquier mensaje y cualquier dibujo. Lo importante es que la matriz acabe apagada.",
        ini(),
        nota_musical("60 · 0.5"),
        escribir("¡HOLA!"),
        dibujo("corazón", 2),
        apagar(),
    ),
]

SOLUCIONES["1ESO-2"] = [
    S(
        "«ir durante» para solo al terminar las 2 rotaciones: no hace falta añadir «parar motor».",
        ini(),
        motor_durante("A", "↻", 2, "rotaciones"),
    ),
    S(
        "«fijar velocidad» no mueve nada por sí solo: hay que ponerlo ANTES de cada giro para que ese giro lo use.",
        ini(),
        motor_velocidad("A", 20),
        motor_durante("A", "↻", 3, "segundos"),
        motor_velocidad("A", 100),
        motor_durante("A", "↻", 3, "segundos"),
    ),
    S(
        "«arrancar motor» no espera: el programa sigue y es el «Esperar» el que decide cuánto gira antes de pararlo.",
        ini(),
        motor_arrancar("A"),
        esperar(4),
        motor_parar("A"),
    ),
    S(
        "Fíjate en que la velocidad cambia con el motor en marcha: no hay que pararlo para subirla.",
        ini(),
        motor_velocidad("A", 30),
        motor_arrancar("A"),
        esperar(3),
        motor_velocidad("A", 70),
        esperar(3),
        motor_parar("A"),
    ),
]

SOLUCIONES["1ESO-3"] = [
    S(
        "«ir a la posición» va a un ángulo exacto, da igual dónde estuviera la barrera al empezar.",
        ini(),
        motor_posicion("A", 90),
    ),
    S(
        "Bajar es volver a la posición 0: el mismo bloque con otro número.",
        ini(),
        motor_posicion("A", 90),
        esperar(3),
        motor_posicion("A", 0),
    ),
    S(
        "La velocidad se fija una sola vez al principio: vale para los dos movimientos que vienen después.",
        ini(),
        motor_velocidad("A", 20),
        motor_posicion("A", 90),
        esperar(3),
        motor_posicion("A", 0),
    ),
    S(
        "Primero el aviso y luego el movimiento: así al coche le da tiempo a verlo.",
        ini(),
        motor_velocidad("A", 20),
        nota_musical("60 · 0.5"),
        motor_posicion("A", 90),
        esperar(3),
        motor_posicion("A", 0),
    ),
]

SOLUCIONES["1ESO-4"] = [
    S(
        "Lo que va dentro del «Repetir» —con la sangría— se hace 4 veces. 4 × 90 grados es la vuelta completa.",
        ini(),
        repetir(4),
        motor_durante("A", "↻", 90, "grados", nivel=1),
    ),
    S(
        "La espera va dentro del bucle, debajo del giro: así hay parada en cada cabina y no una sola al final.",
        ini(),
        repetir(4),
        motor_durante("A", "↻", 90, "grados", nivel=1),
        esperar(2, nivel=1),
    ),
    S(
        "El sonido va dentro del bucle y encima del giro: suena al empezar cada tramo.",
        ini(),
        repetir(4),
        sonido("timbre", nivel=1),
        motor_durante("A", "↻", 90, "grados", nivel=1),
        esperar(2, nivel=1),
    ),
    S(
        "360 grados entre 8 paradas son 45 grados por tramo. Si pones 90, la noria daría dos vueltas.",
        ini(),
        repetir(8),
        sonido("timbre", nivel=1),
        motor_durante("A", "↻", 45, "grados", nivel=1),
        esperar(2, nivel=1),
    ),
]

SOLUCIONES["1ESO-5"] = [
    S(
        "«Esperar hasta que» deja el programa quieto, sin gastar nada, hasta que la respuesta del sensor es «sí».",
        ini(),
        esperar_hasta("¿Está presionado? F"),
        nota_musical("60 · 0.5"),
    ),
    S(
        "Primero la espera y después el movimiento: si los cambias de orden, la puerta se abre sola al arrancar.",
        ini(),
        esperar_hasta("¿Está presionado? F"),
        motor_posicion("A", 90),
    ),
    S(
        "Cerrar es volver a la posición 0, igual que la barrera de la unidad 3.",
        ini(),
        esperar_hasta("¿Está presionado? F"),
        motor_posicion("A", 90),
        esperar(3),
        motor_posicion("A", 0),
    ),
    S(
        "El timbre suena entero antes de que la puerta se mueva, porque «Tocar sonido hasta acabar» no deja pasar al siguiente bloque.",
        ini(),
        motor_velocidad("A", 30),
        esperar_hasta("¿Está presionado? F"),
        sonido("timbre"),
        motor_posicion("A", 90),
        esperar(3),
        motor_posicion("A", 0),
    ),
]

SOLUCIONES["1ESO-6"] = [
    S(
        "Los tres bloques de preparación van una sola vez, al principio. Sin el de los centímetros, «100 cm» no significaría nada.",
        ini(),
        *preparar_movimiento(velocidad=40),
        mover("↑", 100, "cm"),
    ),
    S(
        "Para volver no hace falta otro bloque: basta con cambiar la flecha del desplegable a ↓.",
        ini(),
        *preparar_movimiento(velocidad=40),
        mover("↑", 30, "cm"),
        mover("↓", 30, "cm"),
    ),
    S(
        "El giro va en grados y con dirección 100: con 100 el robot gira sobre sí mismo, como un compás.",
        ini(),
        *preparar_movimiento(velocidad=40),
        mover("↑", 20, "cm"),
        mover_girando("derecha: 100", 90, "grados"),
    ),
    S(
        "Un lado y un giro, repetidos 4 veces. Si el cuadrado no cierra, ajusta los grados: depende de las ruedas.",
        ini(),
        *preparar_movimiento(velocidad=40),
        repetir(4),
        mover("↑", 30, "cm", nivel=1),
        mover_girando("derecha: 100", 90, "grados", nivel=1),
    ),
]

SOLUCIONES["1ESO-7"] = [
    S(
        "El bloque redondo del sensor se mete dentro del hueco de «escribir»: lo que se ve es el número que mide en ese momento.",
        ini(),
        repetir(10),
        escribir("Distancia", nivel=1),
        esperar(0.5, nivel=1),
    ),
    S(
        "«empezar a mover» no espera a nada: el programa sigue y es el «Esperar» el que decide cuánto rueda.",
        ini(),
        *preparar_movimiento(velocidad=30),
        empezar_mover("↑"),
        esperar(3),
        parar_movimiento(),
    ),
    S(
        "Esta es la diferencia con «mover durante»: aquí el robot no sabe cuánto va a rodar, para cuando el sensor lo dice.",
        ini(),
        *preparar_movimiento(velocidad=30),
        empezar_mover("↑"),
        esperar_hasta("¿Está más próximo a 15 cm? E"),
        parar_movimiento(),
    ),
    S(
        "El aviso va después de parar: primero se frena y luego se avisa, no al revés.",
        ini(),
        *preparar_movimiento(velocidad=30),
        empezar_mover("↑"),
        esperar_hasta("¿Está más próximo a 15 cm? E"),
        parar_movimiento(),
        nota_musical("48 · 1"),
        dibujo("corazón", 2),
    ),
]

SOLUCIONES["1ESO-8"] = [
    S(
        "Con «Si… entonces…» hacen falta dos bloques, uno por caso. Son dos preguntas distintas al sensor.",
        ini(),
        si("¿Es de color verde? D"),
        escribir("PASA", nivel=1),
        si("¿Es de color rojo? D"),
        escribir("ALTO", nivel=1),
    ),
    S(
        "La pregunta va en el hueco hexagonal del «Si» y el movimiento, dentro, con la sangría.",
        ini(),
        si("¿Es de color verde? D"),
        motor_posicion("A", 90, nivel=1),
    ),
    S(
        "Sin el bucle, el programa mira el color una sola vez, en el instante de arrancar, y se acaba.",
        ini(),
        bucle_infinito(),
        si("¿Es de color verde? D", nivel=1),
        motor_posicion("A", 90, nivel=2),
    ),
    S(
        "Tres bloques dentro del «Si», y el «Si» dentro del bucle: fíjate en los dos niveles de sangría.",
        ini(),
        bucle_infinito(),
        si("¿Es de color verde? D", nivel=1),
        motor_posicion("A", 90, nivel=2),
        esperar(3, nivel=2),
        motor_posicion("A", 0, nivel=2),
    ),
]

SOLUCIONES["1ESO-9"] = [
    S(
        "Lo mismo que la puerta de la unidad 5, pero lo que espera no es una puerta: es el tiovivo.",
        ini(),
        esperar_hasta("¿Está presionado? F"),
        motor_arrancar("A"),
    ),
    S(
        "Arrancar, esperar, parar: el «Esperar» es el que marca cuánto dura el viaje.",
        ini(),
        esperar_hasta("¿Está presionado? F"),
        motor_arrancar("A"),
        esperar(5),
        motor_parar("A"),
    ),
    S(
        "Al cambiar «Esperar 5 segundos» por «Esperar hasta que», el viaje ya no dura un tiempo fijo: dura hasta que alguien se acerca.",
        ini(),
        esperar_hasta("¿Está presionado? F"),
        motor_arrancar("A"),
        esperar_hasta("¿Está más próximo a 15 cm? E"),
        motor_parar("A"),
    ),
    S(
        "Es el modelo final en pequeño. Un ejemplo: también vale avisar al final en vez de al principio.",
        ini(),
        esperar_hasta("¿Está presionado? F"),
        sonido("timbre"),
        motor_arrancar("A"),
        esperar_hasta("¿Está más próximo a 15 cm? E"),
        motor_parar("A"),
        sonido("timbre"),
    ),
]

# ══ 2º ESO ═══════════════════════════════════════════════════════════════

SOLUCIONES["2ESO-1"] = [
    S(
        "Con «Si… entonces… Si no…» basta un bloque: la rama de abajo se hace justo cuando la respuesta es «no».",
        ini(),
        si_sino("¿Es de color verde? D"),
        escribir("PASA", nivel=1),
        sino(),
        escribir("ALTO", nivel=1),
    ),
    S(
        "Un bloque de movimiento en cada rama. «empezar a mover» no espera, así que la decisión se toma al momento.",
        ini(),
        *preparar_movimiento(velocidad=30),
        si_sino("¿Es de color verde? D"),
        empezar_mover("↑", nivel=1),
        sino(),
        parar_movimiento(nivel=1),
    ),
    S(
        "Con el bucle, el vehículo reacciona en cuanto cambias la tarjeta. Sin él decidiría una vez y se acabaría el programa.",
        ini(),
        *preparar_movimiento(velocidad=30),
        bucle_infinito(),
        si_sino("¿Es de color verde? D", nivel=1),
        empezar_mover("↑", nivel=2),
        sino(nivel=1),
        parar_movimiento(nivel=2),
    ),
    S(
        "El tercer caso es un «Si» metido dentro de la rama «Si no»: si no es verde, se pregunta si es rojo.",
        ini(),
        *preparar_movimiento(velocidad=30),
        bucle_infinito(),
        si_sino("¿Es de color verde? D", nivel=1),
        empezar_mover("↑", nivel=2),
        sino(nivel=1),
        parar_movimiento(nivel=2),
        si("¿Es de color rojo? D", nivel=2),
        dibujo("corazón", nivel=3),
    ),
]

SOLUCIONES["2ESO-2"] = [
    S(
        "Apunta los dos números: el del suelo blanco y el de la línea negra. De ahí sale el umbral de las prácticas siguientes.",
        ini(),
        bucle_infinito(),
        escribir("Luz reflejada", nivel=1),
        esperar(0.5, nivel=1),
    ),
    S(
        "El 50 es el punto de corte: cámbialo por el valor que esté a medio camino entre tu blanco y tu negro.",
        ini(),
        bucle_infinito(),
        si_sino("¿Es la luz reflejada < 50? D", nivel=1),
        escribir("OSCURO", nivel=2),
        sino(nivel=1),
        escribir("CLARO", nivel=2),
    ),
    S(
        "Son dos «empezar a mover» con dirección, uno en cada rama: positivo gira a la derecha y negativo, a la izquierda.",
        ini(),
        *preparar_movimiento(velocidad=30),
        si_sino("¿Es la luz reflejada < 50? D"),
        empezar_mover_girando("derecha: 50", nivel=1),
        sino(),
        empezar_mover_girando("derecha: -50", nivel=1),
    ),
    S(
        "Ese zigzag continuo ES el seguimiento de línea. Si zigzaguea demasiado, baja la velocidad y la dirección.",
        ini(),
        *preparar_movimiento(velocidad=25),
        bucle_infinito(),
        si_sino("¿Es la luz reflejada < 50? D", nivel=1),
        empezar_mover_girando("derecha: 50", nivel=2),
        sino(nivel=1),
        empezar_mover_girando("derecha: -50", nivel=2),
    ),
]

SOLUCIONES["2ESO-3"] = [
    S(
        "Fijar la variable a 0 al empezar evita arrastrar el aforo de la vez anterior.",
        ini(),
        fijar_var("aforo · 0"),
        escribir("aforo"),
    ),
    S(
        "«Cambiar variable por 1» suma al valor que ya había. Con −1 restaría, que es lo que harías en la salida.",
        ini(),
        fijar_var("aforo · 0"),
        b("Cuando está más próximo a", 0, valor="E · 10 cm"),
        cambiar_var("aforo · 1"),
    ),
    S(
        "La variable se mete dentro del hueco de «escribir»: no escribe la palabra «aforo», escribe su valor.",
        ini(),
        fijar_var("aforo · 0"),
        escribir("aforo"),
        b("Cuando está más próximo a", 0, valor="E · 10 cm"),
        cambiar_var("aforo · 1"),
        escribir("aforo"),
    ),
    S(
        "90 grados es un cuarto de vuelta del torno: justo el hueco para que pase una persona.",
        ini(),
        fijar_var("aforo · 0"),
        escribir("aforo"),
        b("Cuando está más próximo a", 0, valor="E · 10 cm"),
        motor_durante("A", "↻", 90, "grados"),
        cambiar_var("aforo · 1"),
        escribir("aforo"),
    ),
]

SOLUCIONES["2ESO-4"] = [
    S(
        "El operador «menor que» es el que va en el hueco hexagonal, con el bloque redondo de la distancia dentro.",
        ini(),
        bucle_infinito(),
        si_sino("Distancia < 20", nivel=1),
        escribir("CERCA", nivel=2),
        sino(nivel=1),
        escribir("LEJOS", nivel=2),
    ),
    S(
        "Media décima de segundo basta para el aviso: si la nota dura más, los pitidos se juntan.",
        ini(),
        bucle_infinito(),
        si("Distancia < 20", nivel=1),
        nota_musical("72 · 0.5", nivel=2),
    ),
    S(
        "«Entre 10 y 30» son dos comparaciones unidas con el operador «y»: las dos tienen que cumplirse.",
        ini(),
        bucle_infinito(),
        si_sino("Distancia < 10", nivel=1),
        nota_musical("72 · 0.1", nivel=2),
        esperar(0.1, nivel=2),
        sino(nivel=1),
        si("Distancia > 10 y Distancia < 30", nivel=2),
        nota_musical("72 · 0.1", nivel=3),
        esperar(0.6, nivel=3),
    ),
    S(
        "Al dividir la distancia, la espera se encoge sola al acercarte: eso es lo que hace el sensor de un coche.",
        ini(),
        bucle_infinito(),
        si("Distancia < 50", nivel=1),
        nota_musical("72 · 0.1", nivel=2),
        esperar("Distancia ÷ 50", nivel=2),
    ),
]

SOLUCIONES["2ESO-5"] = [
    S(
        "Aprieta flojo y fuerte mientras lo miras: así sabes entre qué números se mueve tu sensor.",
        ini(),
        bucle_infinito(),
        escribir("Presión", nivel=1),
        esperar(0.2, nivel=1),
    ),
    S(
        "Ojo: al soltar, la presión vuelve a 0. Si la aguja se queda a cero, fija la variable justo ANTES de soltar.",
        ini(),
        esperar_hasta("¿Está presionado? F"),
        fijar_var("fuerza · Presión"),
        esperar_hasta("no ¿Está presionado? F"),
        escribir("fuerza"),
    ),
    S(
        "Si la presión llega a 100 y quieres que la aguja gire 180 grados, el factor es 1,8.",
        ini(),
        esperar_hasta("¿Está presionado? F"),
        fijar_var("fuerza · Presión"),
        esperar_hasta("no ¿Está presionado? F"),
        fijar_var("grados · fuerza × 1.8"),
        escribir("grados"),
    ),
    S(
        "Volver a 0 al final es lo que deja la máquina lista para el siguiente. Es el modelo final en pequeño.",
        ini(),
        motor_velocidad("A", 40),
        esperar_hasta("¿Está presionado? F"),
        fijar_var("fuerza · Presión"),
        esperar_hasta("no ¿Está presionado? F"),
        fijar_var("grados · fuerza × 1.8"),
        motor_posicion("A", "grados"),
        esperar(3),
        motor_posicion("A", 0),
    ),
]

SOLUCIONES["2ESO-6"] = [
    S(
        "Mueve el Hub con la mano: el número es el giro acumulado desde que lo pusiste a cero.",
        ini(),
        b("Fijar el ángulo de guiñada del Hub a 0", 0),
        bucle_infinito(),
        escribir("Ángulo de guiñada", nivel=1),
        esperar(0.2, nivel=1),
    ),
    S(
        "Con dirección 100 el robot gira sobre sí mismo: una rueda hacia delante y la otra hacia atrás.",
        ini(),
        *preparar_movimiento(velocidad=30),
        b("Fijar el ángulo de guiñada del Hub a 0", 0),
        empezar_mover_girando("derecha: 100"),
        esperar(2),
        parar_movimiento(),
    ),
    S(
        "El bucle no hace nada por dentro: solo da vueltas mirando el ángulo. También valdría «Esperar hasta que».",
        ini(),
        *preparar_movimiento(velocidad=30),
        b("Fijar el ángulo de guiñada del Hub a 0", 0),
        empezar_mover_girando("derecha: 100"),
        repetir_hasta("Ángulo de guiñada > 89"),
        esperar(0.05, nivel=1),
        parar_movimiento(),
    ),
    S(
        "Si no pones el ángulo a cero antes de cada giro, el segundo se queda corto: ya partiría de 90.",
        ini(),
        *preparar_movimiento(velocidad=30),
        repetir(4),
        b("Fijar el ángulo de guiñada del Hub a 0", 1),
        empezar_mover_girando("derecha: 100", nivel=1),
        repetir_hasta("Ángulo de guiñada > 89", nivel=1),
        esperar(0.05, nivel=2),
        parar_movimiento(nivel=1),
        esperar(1, nivel=1),
    ),
]

SOLUCIONES["2ESO-7"] = [
    S(
        "Este bloque es un sombrero: empieza su propia pila y no se encaja debajo de nada.",
        b("Cuando se presiona el botón del Hub", 0, valor="izquierdo"),
        dibujo("corazón", 2),
    ),
    S(
        "Dos pilas separadas, cada una con su sombrero. No hay un «programa principal»: conviven las dos.",
        b("Cuando se presiona el botón del Hub", 0, valor="izquierdo"),
        motor_arrancar("A"),
        b("Cuando se presiona el botón del Hub", 0, valor="derecho"),
        motor_parar("A"),
    ),
    S(
        "El mensaje es el aviso: una pila lo lanza y otra, en cuanto lo recibe, hace su trabajo.",
        b("Cuando se presiona el botón del Hub", 0, valor="izquierdo"),
        b("Enviar mensaje", 0, valor="girar"),
        b("Cuando se reciba el mensaje", 0, valor="girar"),
        motor_arrancar("A"),
        esperar(2),
        motor_parar("A"),
    ),
    S(
        "Nombres claros en los mensajes: con «girar» y «subir» se entiende el programa de un vistazo.",
        b("Cuando se presiona el botón del Hub", 0, valor="izquierdo"),
        b("Enviar mensaje", 0, valor="girar"),
        b("Cuando se presiona el botón del Hub", 0, valor="derecho"),
        b("Enviar mensaje", 0, valor="subir"),
        b("Cuando se reciba el mensaje", 0, valor="girar"),
        motor_durante("A", "↻", 90, "grados"),
        b("Cuando se reciba el mensaje", 0, valor="subir"),
        motor_posicion("B", 60),
        esperar(2),
        motor_posicion("B", 0),
    ),
]

SOLUCIONES["2ESO-8"] = [
    S(
        "El cronómetro corre solo: no hay que hacer nada para que suba, solo leerlo.",
        ini(),
        b("Reiniciar cronómetro", 0),
        bucle_infinito(),
        escribir("Cronómetro", nivel=1),
        esperar(0.2, nivel=1),
    ),
    S(
        "Entre el reinicio y la pulsación pasa tu tiempo de reacción: eso es justo lo que lee el cronómetro.",
        ini(),
        b("Reiniciar cronómetro", 0),
        esperar_hasta("¿Está presionado? F"),
        escribir("Cronómetro"),
    ),
    S(
        "El bloque del número al azar va dentro del hueco de «Esperar»: así nunca sabes cuándo va a salir.",
        ini(),
        esperar("Elegir un número aleatorio entre 2 y 5"),
        dibujo("corazón"),
    ),
    S(
        "El reinicio del cronómetro va justo después de levantar la bandera: si lo pones antes, estarías midiendo también la espera.",
        ini(),
        apagar(),
        esperar("Elegir un número aleatorio entre 2 y 5"),
        dibujo("corazón"),
        b("Reiniciar cronómetro", 0),
        esperar_hasta("¿Está presionado? F"),
        apagar(),
        escribir("Cronómetro"),
    ),
]

SOLUCIONES["2ESO-9"] = [
    S(
        "Un ángulo distinto de la rampa para cada cajón, y el empujador después, cuando la rampa ya está puesta.",
        ini(),
        si_sino("¿Es de color rojo? D"),
        motor_posicion("B", 45, nivel=1),
        sino(),
        motor_posicion("B", 135, nivel=1),
        motor_durante("A", "↻", 1, "rotaciones"),
    ),
    S(
        "Las dos variables se ponen a 0 al empezar y cada una sube en su rama del «Si».",
        ini(),
        fijar_var("rojas · 0"),
        fijar_var("otras · 0"),
        si_sino("¿Es de color rojo? D"),
        motor_posicion("B", 45, nivel=1),
        cambiar_var("rojas · 1", nivel=1),
        sino(),
        motor_posicion("B", 135, nivel=1),
        cambiar_var("otras · 1", nivel=1),
        motor_durante("A", "↻", 1, "rotaciones"),
    ),
    S(
        "Dos «escribir», uno por variable: pasan uno detrás de otro por la matriz.",
        ini(),
        fijar_var("rojas · 0"),
        fijar_var("otras · 0"),
        si_sino("¿Es de color rojo? D"),
        cambiar_var("rojas · 1", nivel=1),
        sino(),
        cambiar_var("otras · 1", nivel=1),
        motor_durante("A", "↻", 1, "rotaciones"),
        escribir("rojas"),
        escribir("otras"),
    ),
    S(
        "La condición compara la SUMA de las dos variables con 10: da igual de qué color sean las piezas.",
        ini(),
        fijar_var("rojas · 0"),
        fijar_var("otras · 0"),
        repetir_hasta("rojas + otras = 10"),
        si_sino("¿Es de color rojo? D", nivel=1),
        motor_posicion("B", 45, nivel=2),
        cambiar_var("rojas · 1", nivel=2),
        sino(nivel=1),
        motor_posicion("B", 135, nivel=2),
        cambiar_var("otras · 1", nivel=2),
        motor_durante("A", "↻", 1, "rotaciones", nivel=1),
        escribir("rojas"),
        escribir("otras"),
    ),
]

# ══ 3º ESO ═══════════════════════════════════════════════════════════════

SOLUCIONES["3ESO-1"] = [
    S(
        "Un bloque propio se define aparte, en su propia pila, y aparece abajo del todo de la paleta, en «Mis bloques».",
        definir("lado"),
        mover("↑", 20, "cm", nivel=1),
        mover_girando("derecha: 100", 90, "grados", nivel=1),
    ),
    S(
        "Fíjate en lo corto que queda el programa principal: cuatro veces una orden que tú has inventado.",
        definir("lado"),
        mover("↑", 20, "cm", nivel=1),
        mover_girando("derecha: 100", 90, "grados", nivel=1),
        ini(),
        *preparar_movimiento(velocidad=40),
        repetir(4),
        mi_bloque("lado", nivel=1),
    ),
    S(
        "La entrada se usa dentro del bloque igual que una variable: donde iba el 20 ahora va «longitud».",
        definir("lado (longitud)"),
        mover("↑", "longitud", "cm", nivel=1),
        mover_girando("derecha: 100", 90, "grados", nivel=1),
        ini(),
        *preparar_movimiento(velocidad=40),
        repetir(4),
        mi_bloque("lado (25)", nivel=1),
    ),
    S(
        "360 entre el número de lados da el giro de cada esquina: 120 grados en el triángulo y 72 en el pentágono.",
        definir("lado (longitud, giro)"),
        mover("↑", "longitud", "cm", nivel=1),
        mover_girando("derecha: 100", "giro", "grados", nivel=1),
        ini(),
        *preparar_movimiento(velocidad=40),
        fijar_var("lados · 5"),
        repetir("lados"),
        mi_bloque("lado (20, 360 ÷ lados)", nivel=1),
    ),
]

SOLUCIONES["3ESO-2"] = [
    S(
        "Mide tú el blanco y el negro y pon tus números: el punto medio es la suma de los dos dividida entre dos.",
        ini(),
        fijar_var("blanco · 85"),
        fijar_var("negro · 15"),
        fijar_var("medio · (blanco + negro) ÷ 2"),
        escribir("medio"),
    ),
    S(
        "Si el error sale 0, el sensor está justo en el borde de la línea: ahí es donde tiene que ir el robot.",
        ini(),
        fijar_var("medio · 50"),
        bucle_infinito(),
        fijar_var("error · Luz reflejada − medio", nivel=1),
        escribir("error", nivel=1),
    ),
    S(
        "El multiplicador convierte el error en giro: cuanto más lejos del borde, más cerrada la corrección.",
        ini(),
        *preparar_movimiento(velocidad=30),
        fijar_var("medio · 50"),
        fijar_var("error · Luz reflejada − medio"),
        fijar_var("giro · error × 1.5"),
        empezar_mover_girando("derecha: giro"),
    ),
    S(
        "Multiplicador alto: nervioso y zigzagueante. Bajo: suave, pero se sale en las curvas cerradas. Busca el tuyo.",
        ini(),
        *preparar_movimiento(velocidad=30),
        fijar_var("medio · 50"),
        bucle_infinito(),
        fijar_var("error · Luz reflejada − medio", nivel=1),
        fijar_var("giro · error × 1.5", nivel=1),
        empezar_mover_girando("derecha: giro", nivel=1),
    ),
]

SOLUCIONES["3ESO-3"] = [
    S(
        "La posición relativa cuenta desde donde esté el motor, no desde un cero fijo: por eso se pone a 0 antes.",
        ini(),
        b("Fijar la posición relativa en…", 0, valor="C · 0"),
        b("Ir a la posición relativa del motor a velocidad", 0, valor="C · 90 · 30 %"),
    ),
    S(
        "Al cerrar baja la velocidad: con un 15 % la pinza aprieta sin aplastar el objeto.",
        ini(),
        b("Fijar la posición relativa en…", 0, valor="C · 0"),
        b("Ir a la posición relativa del motor a velocidad", 0, valor="C · 90 · 30 %"),
        esperar(2),
        b("Ir a la posición relativa del motor a velocidad", 0, valor="C · 0 · 15 %"),
    ),
    S(
        "Con aceleración baja, el motor arranca y frena poco a poco. Compara el movimiento con y sin este bloque.",
        ini(),
        b("Fijar aceleración del motor", 0, valor="C · 20"),
        b("Fijar la posición relativa en…", 0, valor="C · 0"),
        b("Ir a la posición relativa del motor a velocidad", 0, valor="C · 90 · 30 %"),
        esperar(2),
        b("Ir a la posición relativa del motor a velocidad", 0, valor="C · 0 · 15 %"),
    ),
    S(
        "«Frenar al parar» es lo que evita que el robot se pase de largo y suelte la carga donde no toca.",
        ini(),
        *preparar_movimiento(velocidad=30),
        b("Fijar motores de movimiento para que frenen al parar", 0, valor="frenar"),
        b("Fijar la posición relativa en…", 0, valor="C · 0"),
        b("Ir a la posición relativa del motor a velocidad", 0, valor="C · 0 · 15 %"),
        mover("↑", 30, "cm"),
        b("Ir a la posición relativa del motor a velocidad", 0, valor="C · 90 · 30 %"),
        mover("↓", 30, "cm"),
    ),
]

SOLUCIONES["3ESO-4"] = [
    S(
        "Los elementos se añaden al empezar el programa y en orden: el primero que añades es el número 1.",
        ini(),
        b("Añadir elemento a lista", 0, valor="combinación · 90"),
        b("Añadir elemento a lista", 0, valor="combinación · 180"),
        b("Añadir elemento a lista", 0, valor="combinación · 45"),
    ),
    S(
        "La posición del motor del dial es el número que marcas al girarlo con la mano.",
        ini(),
        bucle_infinito(),
        escribir("posición de A", nivel=1),
        esperar(0.2, nivel=1),
    ),
    S(
        "«Elemento 1 de combinación» es el primer número que guardaste: el que hay que acertar primero.",
        ini(),
        b("Añadir elemento a lista", 0, valor="combinación · 90"),
        esperar_hasta("¿Está presionado? F"),
        si("posición de A = Elemento 1 de combinación"),
        dibujo("corazón", 1, nivel=1),
    ),
    S(
        "La variable «paso» dice por qué número vas. Si fallas, vuelve a 1 y hay que empezar la combinación otra vez.",
        ini(),
        b("Añadir elemento a lista", 0, valor="combinación · 90"),
        b("Añadir elemento a lista", 0, valor="combinación · 180"),
        b("Añadir elemento a lista", 0, valor="combinación · 45"),
        fijar_var("paso · 1"),
        repetir_hasta("paso > Longitud de combinación"),
        esperar_hasta("¿Está presionado? F", nivel=1),
        si_sino("posición de A = Elemento paso de combinación", nivel=1),
        cambiar_var("paso · 1", nivel=2),
        sino(nivel=1),
        fijar_var("paso · 1", nivel=2),
        motor_posicion("B", 90),
    ),
]

SOLUCIONES["3ESO-5"] = [
    S(
        "Acerca y aleja el coche de delante con la mano y decide a qué distancia quieres que se mantenga el tuyo.",
        ini(),
        bucle_infinito(),
        escribir("Distancia", nivel=1),
        esperar(0.2, nivel=1),
    ),
    S(
        "Error positivo: está lejos, hay que acelerar. Negativo: demasiado cerca, hay que frenar o retroceder.",
        ini(),
        bucle_infinito(),
        fijar_var("error · Distancia − 15", nivel=1),
        escribir("error", nivel=1),
    ),
    S(
        "Al multiplicar el error, la velocidad sale negativa cuando está demasiado cerca: el robot retrocede solo.",
        ini(),
        *preparar_movimiento(velocidad=30),
        fijar_var("error · Distancia − 15"),
        fijar_var("velocidad · error × 3"),
        b("Empezar a mover a velocidad...", 0, valor="velocidad"),
    ),
    S(
        "Si da tirones, baja el multiplicador. Esto es un control proporcional, lo mismo que el seguidor de línea.",
        ini(),
        *preparar_movimiento(velocidad=30),
        bucle_infinito(),
        fijar_var("error · Distancia − 15", nivel=1),
        fijar_var("velocidad · error × 3", nivel=1),
        b("Empezar a mover a velocidad...", 1, valor="velocidad"),
    ),
]

SOLUCIONES["3ESO-6"] = [
    S(
        "«Enviar mensaje y esperar» no sigue hasta que la otra pila termina: por eso el dibujo aparece con la puerta ya abierta.",
        ini(),
        b("Enviar mensaje y esperar", 0, valor="abrir puerta"),
        dibujo("corazón", 1),
        b("Cuando se reciba el mensaje", 0, valor="abrir puerta"),
        motor_posicion("B", 90),
    ),
    S(
        "La pila de arriba vigila y avisa; la de abajo solo sabe mover el motor. Cada una hace una cosa.",
        ini(),
        esperar_hasta("¿Está más próximo a 10 cm? E"),
        b("Enviar mensaje y esperar", 0, valor="abrir puerta"),
        b("Cuando se reciba el mensaje", 0, valor="abrir puerta"),
        motor_posicion("B", 90),
        esperar(3),
        motor_posicion("B", 0),
    ),
    S(
        "El color de la tarjeta elige el programa y la variable lo recuerda durante todo el lavado.",
        b("Cuando el color es", 0, valor="azul · D"),
        fijar_var("programa · 1"),
        escribir("programa"),
        b("Cuando el color es", 0, valor="rojo · D"),
        fijar_var("programa · 2"),
        escribir("programa"),
    ),
    S(
        "Cada fase, su propia pila. El programa principal solo encadena mensajes: se lee como una lista de pasos.",
        ini(),
        fijar_var("programa · 1"),
        esperar_hasta("¿Está más próximo a 10 cm? E"),
        b("Enviar mensaje y esperar", 0, valor="abrir"),
        b("Enviar mensaje y esperar", 0, valor="lavar"),
        b("Enviar mensaje y esperar", 0, valor="cerrar"),
        b("Cuando se reciba el mensaje", 0, valor="abrir"),
        motor_posicion("B", 90),
        b("Cuando se reciba el mensaje", 0, valor="lavar"),
        si_sino("programa = 1"),
        motor_durante("A", "↻", 5, "segundos", nivel=1),
        sino(),
        motor_durante("A", "↻", 10, "segundos", nivel=1),
        b("Cuando se reciba el mensaje", 0, valor="cerrar"),
        motor_posicion("B", 0),
    ),
]

SOLUCIONES["3ESO-7"] = [
    S(
        "Hay que activar la extensión antes: está abajo a la izquierda, en el botón de las extensiones.",
        ini(),
        bucle_infinito(),
        b("Extensión Gráfico de líneas", 1, valor="trazar Ángulo de guiñada"),
        esperar(0.1, nivel=1),
    ),
    S(
        "Reinicia el cronómetro antes de arrancar: es lo que después te dirá cuánto ha durado el ensayo.",
        ini(),
        b("Reiniciar cronómetro", 0),
        motor_velocidad("A", 60),
        motor_arrancar("A"),
        esperar(5),
        motor_parar("A"),
    ),
    S(
        "Cada elemento de la lista es una medida: con una espera de 0,1 segundos guardas unas diez por segundo.",
        ini(),
        b("Reiniciar cronómetro", 0),
        motor_velocidad("A", 60),
        motor_arrancar("A"),
        repetir_hasta("Cronómetro > 5"),
        b("Añadir elemento a lista", 1, valor="sacudidas · Ángulo de guiñada"),
        b("Extensión Gráfico de líneas", 1, valor="trazar Ángulo de guiñada"),
        esperar(0.1, nivel=1),
        motor_parar("A"),
    ),
    S(
        "Misma duración y misma velocidad en las dos pruebas: si cambias eso, la comparación no vale de nada.",
        ini(),
        b("Reiniciar cronómetro", 0),
        motor_velocidad("A", 60),
        motor_arrancar("A"),
        repetir_hasta("Cronómetro > 5"),
        b("Añadir elemento a lista", 1, valor="torre 1 · Ángulo de guiñada"),
        b("Extensión Gráfico de líneas", 1, valor="trazar Ángulo de guiñada"),
        esperar(0.1, nivel=1),
        motor_parar("A"),
        escribir("Longitud de torre 1"),
    ),
]

SOLUCIONES["3ESO-8"] = [
    S(
        "El bloque avanza sin saber cuánto: para cuando el sensor dice que hay pared. El bucle solo vigila.",
        definir("avanzar"),
        empezar_mover("↑", nivel=1),
        repetir_hasta("¿Está más próximo a 10 cm? E", nivel=1),
        esperar(0.05, nivel=2),
        parar_movimiento(nivel=1),
    ),
    S(
        "El ángulo a cero antes de girar, y la entrada «grados» en la condición: así el mismo bloque gira 90 o 180.",
        definir("girar (grados)"),
        b("Fijar el ángulo de guiñada del Hub a 0", 1),
        empezar_mover_girando("derecha: 100", nivel=1),
        repetir_hasta("Ángulo de guiñada > grados", nivel=1),
        esperar(0.05, nivel=2),
        parar_movimiento(nivel=1),
    ),
    S(
        "Así se recorre un laberinto: avanzar mientras se pueda y girar cuando no. Dos órdenes y una decisión.",
        ini(),
        *preparar_movimiento(velocidad=30),
        si_sino("¿Está más próximo a 10 cm? E"),
        mi_bloque("girar (90)", nivel=1),
        sino(),
        mi_bloque("avanzar", nivel=1),
    ),
    S(
        "Pulsar el sensor de fuerza es tu manera de decirle al robot «ya he salido». Fíjate en lo corto que queda el programa.",
        ini(),
        *preparar_movimiento(velocidad=30),
        repetir_hasta("¿Está presionado? F"),
        si_sino("¿Está más próximo a 10 cm? E", nivel=1),
        mi_bloque("girar (90)", nivel=2),
        sino(nivel=1),
        mi_bloque("avanzar", nivel=2),
        parar_movimiento(),
        dibujo("corazón", 2),
    ),
]

SOLUCIONES["3ESO-9"] = [
    S(
        "Con estos dos bloques hechos, el programa final cabe en una pantalla. Es la misma idea del laberinto.",
        definir("seguir línea"),
        fijar_var("error · Luz reflejada − 50", nivel=1),
        empezar_mover_girando("derecha: error × 1.5", nivel=1),
        definir("girar (grados)"),
        b("Fijar el ángulo de guiñada del Hub a 0", 1),
        empezar_mover_girando("derecha: 100", nivel=1),
        repetir_hasta("Ángulo de guiñada > grados", nivel=1),
        esperar(0.05, nivel=2),
        parar_movimiento(nivel=1),
    ),
    S(
        "Apunta la correspondencia antes de programar: un color para cada estación y el mismo criterio para todos.",
        ini(),
        bucle_infinito(),
        si_sino("¿Es de color rojo? D", nivel=1),
        escribir("ESTACION A", nivel=2),
        sino(nivel=1),
        si("¿Es de color azul? D", nivel=2),
        escribir("ESTACION B", nivel=3),
    ),
    S(
        "Levanta despacio: con la carga alta el robot se vuelca con mucha facilidad.",
        ini(),
        b("Fijar la posición relativa en…", 0, valor="C · 0"),
        b("Ir a la posición relativa del motor a velocidad", 0, valor="C · -120 · 20 %"),
        esperar(1),
        b("Ir a la posición relativa del motor a velocidad", 0, valor="C · 0 · 15 %"),
    ),
    S(
        "La lista guarda la ruta y el bucle la recorre. Este es el proyecto final en pequeño: pruébalo antes de montarlo entero.",
        ini(),
        *preparar_movimiento(velocidad=30),
        b("Añadir elemento a lista", 0, valor="ruta · rojo"),
        b("Añadir elemento a lista", 0, valor="ruta · azul"),
        fijar_var("entregados · 0"),
        repetir_hasta("entregados = Longitud de ruta"),
        mi_bloque("seguir línea", nivel=1),
        si("¿Es de color rojo? D", nivel=1),
        parar_movimiento(nivel=2),
        cambiar_var("entregados · 1", nivel=2),
        b("Enviar mensaje", 2, valor="entregado"),
        b("Cuando se reciba el mensaje", 0, valor="entregado"),
        b("Añadir elemento a lista", 0, valor="registro · entregados"),
    ),
]


# ── Inyección en los archivos de contenido ───────────────────────────────



# ⚠ 1º de ESO ya NO se genera aquí. Su temario entero —las 9 unidades en 3
# evaluaciones— lo escribe scripts/temario-1eso.py, que además comprueba que
# ninguna solución use un bloque fuera de la paleta de su unidad. Si este
# script volviera a tocar 1ESO, revertiría ese temario sin avisar.
def _salta_1eso(clave):
    return str(clave).startswith("1ESO") or str(clave).startswith("1eso")


def main() -> None:
    bloques_validos = {
        b["texto"] for b in json.load(open("src/data/bloques.json", encoding="utf-8"))["bloques"]
    } | {
        a["texto"]
        for a in json.load(open("src/data/bloques.json", encoding="utf-8"))["auxiliares"]
    }

    total = 0
    problemas = []
    for clave, soluciones in SOLUCIONES.items():
        if _salta_1eso(clave):
            continue
        ruta = f"src/data/contenido/{clave}.json"
        datos = json.load(open(ruta, encoding="utf-8"))
        intermedias = datos.get("intermedias") or []
        if len(intermedias) != len(soluciones):
            problemas.append(f"{clave}: {len(intermedias)} prácticas y {len(soluciones)} soluciones")
            continue

        for practica, sol in zip(intermedias, soluciones):
            for fila in sol["solucion"]:
                if fila["texto"] not in bloques_validos:
                    problemas.append(f"{clave} p{practica['practica']}: bloque «{fila['texto']}»")
            practica["solucion"] = sol["solucion"]
            practica["notas"] = sol["notas"]
            total += 1

        json.dump(datos, open(ruta, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    if problemas:
        print("PROBLEMAS:")
        for p in problemas:
            print(" ·", p)
    print(f"{total} soluciones escritas en {len(SOLUCIONES)} unidades.")


if __name__ == "__main__":
    main()
