"""Las 4 prácticas intermedias de cada unidad.

Van antes del modelo final y de la PRUEBA: retos cortos para afianzar los
bloques de la unidad uno a uno. No las corrige el profesor; el alumno las
monta, las guarda y las prueba en el Hub con la app del iPad.

Cada unidad sigue la misma progresión:
  1 · usar el bloque nuevo tal cual,
  2 · cambiarle los valores o repetirlo,
  3 · combinar dos bloques de la unidad,
  4 · un reto abierto que ya se parece al modelo final.
"""

# ⚠ CUIDADO: este script REESCRIBE las prácticas intermedias y al hacerlo
# BORRA sus «solucion», «notas» y «pasos». Está pensado para ejecutarse ANTES
# de scripts/soluciones-intermedias.py, que es quien vuelve a poner las
# soluciones. Ejecutado después, deja las prácticas sin solución y sin aviso
# ninguno. Si lo ejecutas por error:  git checkout -- src/data/contenido/


import json

P = {
    # ── 1º ESO ──────────────────────────────────────────────────────────
    "1ESO-1": [
        ("Enciende un dibujo", "Haz que la matriz del Hub muestre un corazón durante 3 segundos y después se apague.", "Acuérdate de «apagar píxeles» al final: si no, el dibujo se queda puesto."),
        ("Tu nombre en la matriz", "Escribe tu nombre en la matriz y, justo después, muestra un dibujo cualquiera durante 2 segundos.", "«escribir» hace pasar las letras una a una y el programa espera a que termine."),
        ("Semáforo del botón", "Pon la luz del botón central en verde, espera 2 segundos, cámbiala a rojo y espera otros 2.", "Son dos bloques de luz con un «Esperar» entre medias."),
        ("Rótulo de bienvenida", "Monta un saludo completo: una nota, tu mensaje escrito, un dibujo 2 segundos y la matriz apagada al final.", "Ordena los bloques como quieres que ocurran: de arriba abajo."),
    ],
    "1ESO-2": [
        ("Un giro corto", "Haz que el motor del puerto A gire 2 rotaciones y pare.", "«ir durante» ya para solo al terminar; no hace falta «parar motor»."),
        ("Despacio y deprisa", "El motor gira 3 segundos al 20 % y después 3 segundos al 100 %.", "«fijar velocidad» no mueve nada: hay que ponerlo antes de cada giro."),
        ("Arranca y para", "Usa «arrancar motor», espera 4 segundos y para el motor.", "Esta pareja sirve cuando no sabes de antemano cuánto tiene que girar."),
        ("Ventilador de dos marchas", "El ventilador arranca al 30 %, a los 3 segundos sube al 70 % sin pararse, y a los 3 segundos se detiene.", "Cambia la velocidad mientras el motor está en marcha: no hace falta pararlo."),
    ],
    "1ESO-3": [
        ("Sube la barrera", "Lleva el motor A a la posición 90 y déjalo ahí.", "«ir a la posición» va a un ángulo exacto, da igual dónde estuviera."),
        ("Sube y baja", "La barrera sube a 90, espera 3 segundos y vuelve a la posición 0.", "Son dos bloques de posición con un «Esperar» en medio."),
        ("Sin tirones", "Repite la subida y la bajada, pero fijando antes la velocidad al 20 %.", "A menos velocidad, el movimiento es más suave y no da tirones."),
        ("Barrera con aviso", "Antes de subir, el Hub da una nota de aviso; después sube, espera y baja.", "Primero el sonido, luego el movimiento."),
    ],
    "1ESO-4": [
        ("Cuatro tramos", "Usa un «Repetir» 4 veces para que el motor gire 90 grados en cada vuelta.", "Lo que va dentro del bucle se hace tantas veces como digas."),
        ("Parada en cada cabina", "Dentro del mismo bucle, añade una espera de 2 segundos después de cada tramo.", "El orden dentro del bucle también cuenta."),
        ("Noria con sonido", "Añade un sonido al principio de cada tramo, antes de que el motor gire.", "Mete el bloque de sonido dentro del bucle, encima del de motor."),
        ("Ocho cabinas", "Haz la misma noria pero con 8 paradas: piensa cuántos grados le tocan a cada tramo.", "Una vuelta entera son 360 grados: repártelos entre las paradas."),
    ],
    "1ESO-5": [
        ("Espera al botón", "El programa no hace nada hasta que alguien pulsa el sensor de fuerza; entonces suena una nota.", "«Esperar hasta que» detiene el programa hasta que la respuesta es «sí»."),
        ("Puerta que se abre", "Al pulsar, la puerta se abre llevando el motor a la posición 90.", "Primero la espera, después el movimiento."),
        ("Y se cierra sola", "Después de abrirse, la puerta espera 3 segundos y se cierra.", "Cerrar es volver a la posición 0."),
        ("Puerta con timbre", "Monta la puerta completa: espera la pulsación, suena el timbre, se abre, espera y se cierra.", "Comprueba el orden antes de probarlo en el Hub."),
    ],
    "1ESO-6": [
        ("Un metro recto", "Prepara los motores de movimiento y haz que el robot avance 100 cm.", "Los tres bloques de preparación van una sola vez, al principio."),
        ("Adelante y atrás", "El robot avanza 30 cm y vuelve hacia atrás otros 30 cm.", "Para ir hacia atrás, cambia la flecha del desplegable."),
        ("Un giro de 90°", "Haz que el robot avance 20 cm y después gire 90 grados a la derecha.", "El giro se hace con «mover derecha» y grados, no con centímetros."),
        ("El cuadrado", "Recorre un cuadrado de 30 cm de lado usando un «Repetir» para no escribir cuatro veces lo mismo.", "Un lado y un giro, repetido cuatro veces."),
    ],
    "1ESO-7": [
        ("Mira la distancia", "Haz que el Hub escriba en la matriz la distancia que mide el sensor.", "El bloque redondo de distancia se mete dentro del hueco de «escribir»."),
        ("Arranca sin parar", "Usa «empezar a mover» y comprueba que el programa sigue mientras el robot rueda.", "«empezar a mover» no espera: por eso puedes vigilar el sensor a la vez."),
        ("Frena a 15 cm", "El robot arranca y se detiene cuando el obstáculo está a menos de 15 cm.", "«Esperar hasta que» con la pregunta del sensor de distancia."),
        ("Frena y avisa", "Igual que la anterior, pero al frenar suena una nota grave y se enciende un dibujo.", "Después de parar el movimiento, añade el aviso."),
    ],
    "1ESO-8": [
        ("¿De qué color es?", "Escribe en la matriz un mensaje distinto según veas la tarjeta verde o no.", "«Si… entonces…» mira la pregunta una sola vez y decide."),
        ("Abre con el verde", "Si el sensor ve verde, la barrera sube a 90 grados.", "La pregunta del color va en el hueco del «Si»."),
        ("Siempre vigilando", "Mete la comprobación dentro de un bucle infinito para que el garaje no deje de mirar.", "Sin el bucle, el programa comprueba una vez y se acaba."),
        ("Abrir y cerrar", "Con la tarjeta correcta: sube la barrera, espera 3 segundos y vuelve a bajarla, todo dentro del bucle.", "Tres bloques dentro del «Si», y el «Si» dentro del bucle."),
    ],
    "1ESO-9": [
        ("Arranque con botón", "El tiovivo no arranca hasta que alguien pulsa el sensor de fuerza.", "Lo mismo que en la unidad 5, pero ahora para arrancar un motor."),
        ("Gira y para", "Al pulsar, el motor arranca, gira 5 segundos y se detiene.", "Arrancar, esperar, parar."),
        ("Parada de seguridad", "El tiovivo se detiene si alguien se acerca a menos de 15 cm, aunque no hayan pasado los 5 segundos.", "Cambia el «Esperar X segundos» por un «Esperar hasta que» con el sensor."),
        ("Tiovivo completo", "Junta todo: espera la pulsación, suena el aviso, el tiovivo gira y se para cuando alguien se acerca.", "Es el modelo final en pequeño: pruébalo antes de montarlo entero."),
    ],
    # ── 2º ESO ──────────────────────────────────────────────────────────
    "2ESO-1": [
        ("Verde o no verde", "Con un «Si… entonces… Si no…», escribe «PASA» cuando veas verde y «ALTO» cuando no.", "La rama «Si no» se hace cuando la respuesta es «no»."),
        ("Circula y para", "Si la tarjeta es verde, el vehículo empieza a moverse; si no, se para.", "Un bloque de movimiento en cada rama."),
        ("Semáforo continuo", "Mete la decisión en un bucle infinito para que reaccione en cuanto cambie la tarjeta.", "Sin bucle, decide una vez y se acaba el programa."),
        ("Tres colores", "Añade un tercer caso: con la tarjeta roja, además de parar, el Hub enciende un dibujo de aviso.", "Puedes anidar otro «Si» dentro de la rama «Si no»."),
    ],
    "2ESO-2": [
        ("Mide la luz", "Escribe en la matriz el valor de luz reflejada que está leyendo el sensor.", "Pásalo por el suelo blanco y por la línea negra y apunta los dos valores."),
        ("Blanco o negro", "Decide con un «Si… entonces… Si no…» si lo que ve el sensor es claro u oscuro, y escríbelo.", "El punto de corte suele estar a medio camino entre los dos valores que apuntaste."),
        ("Gira a un lado", "Cuando el sensor vea negro, el robot empieza a moverse girando a la derecha; cuando vea blanco, a la izquierda.", "Son dos «empezar a mover con dirección», uno en cada rama."),
        ("Sigue la línea", "Mete todo en un bucle infinito: ese zigzag continuo es el seguimiento de línea.", "Con la velocidad alta zigzaguea más; pruébalo despacio primero."),
    ],
    "2ESO-3": [
        ("Crea el contador", "Crea una variable «aforo» y ponla a 0 al empezar el programa.", "Fijar la variable al principio evita arrastrar el valor de la vez anterior."),
        ("Suma uno", "Cada vez que alguien pasa por delante del sensor, la variable sube de uno en uno.", "«Cambiar variable por 1» suma; con −1 restaría."),
        ("Enséñalo", "Después de cada paso, escribe el valor del aforo en la matriz.", "La variable se mete dentro del hueco de «escribir»."),
        ("Torno completo", "Junta las tres partes y haz que además el motor dé un cuarto de vuelta por cada persona.", "90 grados por persona es un cuarto de vuelta del torno."),
    ],
    "2ESO-4": [
        ("¿Está cerca?", "Escribe «CERCA» si la distancia es menor que 20, y si no, «LEJOS».", "El operador «menor que» va dentro del hueco del «Si»."),
        ("Pitido simple", "Si está a menos de 20 cm, suena una nota corta.", "Una nota de medio segundo basta para el aviso."),
        ("Dos avisos", "Pita rápido si está a menos de 10 cm y despacio si está entre 10 y 30.", "Para «entre 10 y 30» necesitas el operador «y» con dos comparaciones."),
        ("Cuanto más cerca, más rápido", "Calcula la espera entre pitidos a partir de la distancia, con una operación aritmética.", "Por ejemplo, esperar la distancia dividida entre 100: a menos distancia, menos espera."),
    ],
    "2ESO-5": [
        ("Mide la presión", "Escribe en la matriz el valor de presión del sensor de fuerza mientras aprietas.", "Prueba a apretar flojo y fuerte para ver el rango."),
        ("Guarda la fuerza", "Crea la variable «fuerza» y guarda en ella la presión en el momento de soltar.", "Fija la variable justo después de que deje de estar presionado."),
        ("Convierte a grados", "Multiplica la fuerza por un número para convertirla en el ángulo de la aguja.", "Si la presión llega a 100 y la aguja gira 180, el factor es 1,8."),
        ("Prueba tu fuerza", "La aguja va al ángulo calculado, espera 3 segundos y vuelve a 0 para el siguiente.", "Este es el modelo final en pequeño."),
    ],
    "2ESO-6": [
        ("Pon el ángulo a cero", "Fija el ángulo de guiñada a 0 y escribe el valor del giroscopio en la matriz.", "Mueve el Hub con la mano y mira cómo cambia el número."),
        ("Gira y mira", "El robot empieza a girar sobre sí mismo y tú observas cómo sube el ángulo.", "Con «empezar a mover con dirección» a tope gira sobre sí mismo."),
        ("Para a los 90°", "Usa «Repetir hasta» para que el giro se pare cuando el ángulo llegue a 90.", "La condición es «ángulo mayor que 89»."),
        ("Cuatro giros exactos", "Repite cuatro veces el giro de 90 grados poniendo el ángulo a cero antes de cada uno.", "Si no reinicias el ángulo, el segundo giro se queda corto."),
    ],
    "2ESO-7": [
        ("Botón izquierdo", "Cuando se presione el botón izquierdo del Hub, enciende un dibujo.", "Este bloque es un sombrero: empieza su propia pila."),
        ("Dos botones", "Un botón arranca el motor y el otro lo para.", "Dos pilas distintas, cada una con su sombrero."),
        ("Avisa por mensaje", "Al pulsar un botón, envía un mensaje; otra pila lo recibe y mueve el motor.", "Los mensajes sirven para que una parte del programa avise a otra."),
        ("Grúa con dos mandos", "Un botón gira la grúa y el otro sube y baja el brazo, cada uno con su mensaje.", "Da nombres claros a los mensajes: «girar» y «subir»."),
    ],
    "2ESO-8": [
        ("Pon el cronómetro a cero", "Reinicia el cronómetro y escribe su valor en la matriz.", "Verás cómo el número va subiendo solo."),
        ("Mide tu reacción", "Reinicia el cronómetro, espera a que pulses el botón y escribe el tiempo que tardaste.", "El valor que escribes es tu tiempo de reacción."),
        ("Espera sorpresa", "Antes de levantar la bandera, espera un número aleatorio de segundos entre 2 y 5.", "El bloque de número aleatorio va dentro del hueco de «Esperar»."),
        ("Máquina de reflejos", "Junta todo: espera sorpresa, levanta la bandera, mide el tiempo y enséñalo.", "Pruébalo con un compañero y comparad los tiempos."),
    ],
    "2ESO-9": [
        ("Clasifica un color", "Si la pieza es roja, el motor la empuja a un lado; si no, al otro.", "Un ángulo distinto del motor para cada lado."),
        ("Lleva la cuenta", "Crea una variable por color y súmale uno cada vez que clasifiques una pieza.", "Pon las dos variables a 0 al empezar."),
        ("Enseña el recuento", "Al terminar, escribe en la matriz cuántas piezas hay de cada color, una detrás de otra.", "Dos bloques de «escribir», uno por variable."),
        ("Diez piezas", "Usa «Repetir hasta» para clasificar hasta llegar a diez piezas en total.", "La condición puede comparar la suma de las dos variables con 10."),
    ],
    # ── 3º ESO ──────────────────────────────────────────────────────────
    "3ESO-1": [
        ("Tu primer bloque", "Crea un bloque llamado «lado» que haga avanzar 20 cm y girar 90 grados.", "Al crearlo aparece en «Mis bloques», abajo del todo de la paleta."),
        ("El cuadrado con tu bloque", "Usa un «Repetir» cuatro veces con tu bloque «lado» dentro.", "Fíjate en lo corto que queda el programa."),
        ("Un bloque con entrada", "Cambia tu bloque para que reciba la longitud del lado como número.", "La entrada se usa dentro del bloque igual que una variable."),
        ("Polígonos a la carta", "Haz un triángulo y un pentágono cambiando solo el número de repeticiones y los grados del giro.", "Los grados de cada giro son 360 entre el número de lados."),
    ],
    "3ESO-2": [
        ("El punto medio", "Mide la luz sobre el blanco y sobre el negro y guarda en una variable el valor de en medio.", "El punto medio es la suma de los dos dividida entre dos."),
        ("Calcula el error", "Guarda en otra variable la diferencia entre lo que lee el sensor y ese punto medio.", "Si el error es 0, el robot está justo en el borde de la línea."),
        ("Dirección proporcional", "Usa el error multiplicado por un número como dirección de «empezar a mover».", "Cuanto mayor sea el error, más cerrado será el giro."),
        ("Seguimiento suave", "Mete el cálculo en un bucle infinito y ajusta el multiplicador hasta que no zigzaguee.", "Multiplicador alto: nervioso. Bajo: se sale en las curvas."),
    ],
    "3ESO-3": [
        ("Abre la pinza", "Mueve el motor de la pinza a una posición relativa para abrirla del todo.", "La posición relativa cuenta desde donde estaba, no desde un cero fijo."),
        ("Abrir y cerrar", "Abre la pinza, espera 2 segundos y ciérrala con cuidado.", "Baja la velocidad para que no aplaste el objeto."),
        ("Sin dar tirones", "Fija la aceleración del motor antes de mover la pinza y compara cómo se mueve.", "Con aceleración baja arranca y frena suave."),
        ("Coge y traslada", "Cierra la pinza, avanza 30 cm, abre la pinza y vuelve al punto de partida.", "Fija los motores de movimiento para que frenen al parar: así no se pasa de largo."),
    ],
    "3ESO-4": [
        ("Crea la combinación", "Crea una lista y añádele tres números: esa es la combinación.", "Añade los elementos al empezar el programa."),
        ("Lee el dial", "Escribe en la matriz la posición del motor del dial mientras lo giras con la mano.", "Esa posición es el número que marca el dial."),
        ("Compara el primero", "Comprueba si el número marcado coincide con el primer elemento de la lista.", "«Elemento 1 de la lista» te da el primer número."),
        ("Caja fuerte", "Con un «Repetir hasta», ve comprobando los tres números en orden y abre solo si están todos.", "Lleva la cuenta de por cuál vas con una variable."),
    ],
    "3ESO-5": [
        ("Distancia al de delante", "Escribe en la matriz la distancia al coche de delante mientras lo acercas y lo alejas.", "Apunta a qué distancia quieres que se mantenga."),
        ("El error de distancia", "Guarda en una variable la diferencia entre la distancia medida y los 15 cm deseados.", "Error positivo: está lejos. Negativo: demasiado cerca."),
        ("Velocidad calculada", "Convierte ese error en una velocidad multiplicándolo por un número.", "Si está lejos acelera; si está cerca, la velocidad sale negativa y retrocede."),
        ("Control de crucero", "Mete el cálculo en un bucle infinito y comprueba que mantiene la distancia al moverse el de delante.", "Ajusta el multiplicador hasta que no dé tirones."),
    ],
    "3ESO-6": [
        ("Avisa y espera", "Envía un mensaje y espera a que termine antes de seguir con el programa.", "«Enviar mensaje y esperar» no sigue hasta que la otra pila acaba."),
        ("Detecta el coche", "Cuando el sensor vea el coche, envía el mensaje «abrir puerta».", "La otra pila se encarga de mover el motor."),
        ("Elige el programa", "Guarda en una variable el programa de lavado elegido y escríbelo en la matriz.", "Puedes elegirlo con el color de una tarjeta."),
        ("Túnel de lavado", "Encadena las fases con mensajes: detectar, abrir, lavar según el programa y cerrar.", "Cada fase, su propia pila: así se lee mucho mejor."),
    ],
    "3ESO-7": [
        ("Dibuja el movimiento", "Usa la extensión de gráfico de líneas para ir dibujando el ángulo del Hub.", "Mueve el Hub con la mano y mira la línea del gráfico."),
        ("Pon la mesa a vibrar", "Arranca el motor de la mesa sísmica y detenlo a los 5 segundos.", "Reinicia el cronómetro antes de empezar."),
        ("Registra la sacudida", "Mientras la mesa vibra, ve añadiendo a una lista el ángulo del Hub.", "Cada elemento de la lista es una medida en el tiempo."),
        ("Compara dos torres", "Repite la prueba con dos torres distintas y compara los gráficos para decidir cuál aguanta mejor.", "Misma duración y misma velocidad de motor: si no, la comparación no vale."),
    ],
    "3ESO-8": [
        ("Avanza un tramo", "Crea un bloque «avanzar» que recorra un tramo del laberinto y páralo al llegar a la pared.", "Usa la pregunta del sensor de distancia para saber cuándo parar."),
        ("Gira exacto", "Crea un bloque «girar» con una entrada en grados que use el giroscopio.", "Pon el ángulo a cero antes de cada giro."),
        ("¿Hay pared?", "Decide con un «Si… entonces… Si no…» si hay pared delante y, según eso, avanza o gira.", "Así se recorre un laberinto: avanzar mientras se pueda, girar si no."),
        ("Sal del laberinto", "Mete la decisión en un «Repetir hasta» que termine cuando pulses el botón del Hub.", "Pulsar el botón es tu forma de decir «ya he salido»."),
    ],
    "3ESO-9": [
        ("Los bloques del almacén", "Crea los bloques «seguir línea» y «girar» que vas a reutilizar en todo el proyecto.", "Si los haces bien, el programa final cabe en una pantalla."),
        ("Reconoce la estación", "Cuando el sensor vea un color, escribe en la matriz a qué estación corresponde.", "Un color por estación: apunta la correspondencia antes de programar."),
        ("Coge la carga", "Con la posición relativa del motor, baja la horquilla, levántala y comprueba que no se cae.", "Levanta despacio: con la carga alta el robot se vuelca con facilidad."),
        ("Ruta de reparto", "Guarda en una lista el orden de las estaciones y recórrelas una a una con tus bloques.", "Este es el proyecto final en pequeño: pruébalo antes de montarlo entero."),
    ],
}



# ⚠ 1º de ESO ya NO se genera aquí. Su temario entero —las 9 unidades en 3
# evaluaciones— lo escribe scripts/temario-1eso.py, que además comprueba que
# ninguna solución use un bloque fuera de la paleta de su unidad. Si este
# script volviera a tocar 1ESO, revertiría ese temario sin avisar.
def _salta_1eso(clave):
    return str(clave).startswith("1ESO") or str(clave).startswith("1eso")


def main() -> None:
    total = 0
    for clave, practicas in P.items():
        if _salta_1eso(clave):
            continue
        ruta = f"src/data/contenido/{clave}.json"
        datos = json.load(open(ruta, encoding="utf-8"))
        intermedias = [
            {"practica": i + 1, "titulo": titulo, "enunciado": enunciado, "pista": pista}
            for i, (titulo, enunciado, pista) in enumerate(practicas)
        ]
        # Van antes de «construccion», que es el modelo final.
        nuevo = {}
        for campo, valor in datos.items():
            if campo == "construccion":
                nuevo["intermedias"] = intermedias
            nuevo[campo] = valor
        if "intermedias" not in nuevo:
            nuevo["intermedias"] = intermedias
        json.dump(nuevo, open(ruta, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        total += len(intermedias)
        print(f"{clave}: {len(intermedias)} prácticas")
    print(f"Total: {total} prácticas intermedias en {len(P)} unidades.")


if __name__ == "__main__":
    main()
