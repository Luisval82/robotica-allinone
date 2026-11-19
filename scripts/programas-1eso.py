"""Programa de ejemplo de cada unidad de 1º ESO.

No es la solución de ninguna práctica: es una demostración corta que usa los
bloques nuevos de la unidad, para que el alumno vea cómo se encajan antes de
montar el suyo. Se guarda en «programa» dentro de src/data/contenido/.
"""

import json


def b(texto, *, valor=None, valores=None, nivel=0):
    fila = {"texto": texto, "nivel": nivel}
    if valores is not None:
        fila["valores"] = valores
    elif valor is not None:
        fila["valor"] = valor
    return fila


INICIO = b("Cuando se inicia el programa")

PROGRAMAS = {
    1: {
        "titulo": "El Hub saluda",
        "explicacion": (
            "Los bloques se encajan de arriba abajo y se ejecutan en ese orden. "
            "Fíjate en que el último bloque apaga la matriz: si no, el dibujo se "
            "quedaría encendido para siempre."
        ),
        "bloques": [
            INICIO,
            b("poner luz del botón central en rojo", valores=["verde"]),
            b("encender dibujo durante 2 segundos", valores=["corazón", "2"]),
            b("escribir Hello", valores=["HOLA"]),
            b("Tocar nota X segundos", valor="60 · 0.5"),
            b("apagar píxeles"),
        ],
    },
    2: {
        "titulo": "Un motor que arranca y para",
        "explicacion": (
            "«fijar velocidad» no mueve nada: guarda el valor para los bloques de "
            "motor que vengan después. Entre arrancar y parar, un «Esperar» decide "
            "cuánto tiempo gira."
        ),
        "bloques": [
            INICIO,
            b("A fijar velocidad al 75 %", valores=["A", "40"]),
            b("A arrancar motor", valores=["A", "↻"]),
            b("Esperar X segundos", valor="3"),
            b("A parar motor", valores=["A"]),
        ],
    },
    3: {
        "titulo": "La barrera sube y baja",
        "explicacion": (
            "Ir «a la posición» lleva el motor a un ángulo exacto, da igual dónde "
            "estuviera. Con una velocidad baja la barrera no da tirones."
        ),
        "bloques": [
            INICIO,
            b("A fijar velocidad al 75 %", valores=["A", "20"]),
            b("A ir por la ruta más corta a la posición 0", valores=["A", "por la ruta más corta", "90"]),
            b("Esperar X segundos", valor="3"),
            b("Tocar nota X segundos", valor="60 · 0.5"),
            b("A ir por la ruta más corta a la posición 0", valores=["A", "por la ruta más corta", "0"]),
        ],
    },
    4: {
        "titulo": "La noria gira por tramos",
        "explicacion": (
            "Lo que va dentro del «Repetir» se hace cuatro veces seguidas. Un tramo "
            "son 90 grados, así que cuatro tramos dan la vuelta completa."
        ),
        "bloques": [
            INICIO,
            b("Repetir bucle", valor="4"),
            b("A ir durante 1 rotaciones", valores=["A", "↻", "90", "grados"], nivel=1),
            b("Tocar sonido hasta acabar", valor="timbre", nivel=1),
            b("Esperar X segundos", valor="2", nivel=1),
            b("encender dibujo", valores=["corazón"]),
        ],
    },
    5: {
        "titulo": "La puerta se abre al pulsar",
        "explicacion": (
            "«Esperar hasta que» detiene el programa hasta que la respuesta del "
            "sensor es «sí». Hasta que alguien no pulsa, no pasa nada."
        ),
        "bloques": [
            INICIO,
            b("Esperar hasta que", valor="¿Está presionado? F"),
            b("Tocar sonido hasta acabar", valor="timbre"),
            b("A ir por la ruta más corta a la posición 0", valores=["A", "por la ruta más corta", "90"]),
            b("Esperar X segundos", valor="3"),
            b("A ir por la ruta más corta a la posición 0", valores=["A", "por la ruta más corta", "0"]),
        ],
    },
    6: {
        "titulo": "Media vuelta al cuadrado",
        "explicacion": (
            "Los tres primeros bloques se ponen una sola vez, al principio: dicen qué "
            "motores llevan el robot, a qué velocidad y cuánto avanza en una vuelta de "
            "rueda. A partir de ahí ya puedes pedirle centímetros."
        ),
        "bloques": [
            INICIO,
            b("fijar A+B como motores en movimiento", valores=["A+B"]),
            b("fijar 1 rotación del motor en 17.5 cm recorridos", valores=["17.5", "cm"]),
            b("fijar velocidad de movimiento al 50 %", valores=["30"]),
            b("mover ↑ durante 10 rotaciones", valores=["↑", "30", "cm"]),
            b("mover derecha: 30 durante 10 rotaciones", valores=["derecha: 100", "90", "grados"]),
            b("mover ↑ durante 10 rotaciones", valores=["↑", "30", "cm"]),
        ],
    },
    7: {
        "titulo": "Frena antes de chocar",
        "explicacion": (
            "«empezar a mover» arranca el robot y el programa sigue adelante, así que "
            "puede quedarse vigilando el sensor mientras rueda. En cuanto el obstáculo "
            "está cerca, para."
        ),
        "bloques": [
            INICIO,
            b("fijar velocidad de movimiento al 50 %", valores=["25"]),
            b("empezar a mover a ↑", valores=["↑"]),
            b("Esperar hasta que", valor="¿Está más próximo a 15 cm? E"),
            b("parar movimiento"),
            b("Tocar nota X segundos", valor="48 · 1"),
        ],
    },
    8: {
        "titulo": "Solo con la tarjeta verde",
        "explicacion": (
            "El «Si… entonces…» mira el color una vez y decide. Metido dentro de un "
            "bucle infinito, el garaje se queda comprobando tarjetas todo el rato."
        ),
        "bloques": [
            INICIO,
            b("Bucle infinito"),
            b("Si... entonces...", valor="¿Es de color verde? D", nivel=1),
            b("A ir por la ruta más corta a la posición 0", valores=["A", "por la ruta más corta", "90"], nivel=2),
            b("Esperar X segundos", valor="3", nivel=2),
            b("A ir por la ruta más corta a la posición 0", valores=["A", "por la ruta más corta", "0"], nivel=2),
        ],
    },
    9: {
        "titulo": "El tiovivo, de principio a fin",
        "explicacion": (
            "Un proyecto encadena lo de todas las unidades: esperar a que pulsen, "
            "arrancar, vigilar el sensor mientras gira y parar cuando alguien se acerca."
        ),
        "bloques": [
            INICIO,
            b("Esperar hasta que", valor="¿Está presionado? F"),
            b("Tocar sonido hasta acabar", valor="timbre"),
            b("A arrancar motor", valores=["A", "↻"]),
            b("Esperar hasta que", valor="¿Está más próximo a 15 cm? E"),
            b("A parar motor", valores=["A"]),
        ],
    },
}


def main() -> None:
    # ⚠ Este script ya no se usa: el temario completo de 1º de ESO, programas
    # de ejemplo incluidos, lo escribe scripts/temario-1eso.py. Se deja el
    # archivo como registro de los programas antiguos, pero no escribe nada:
    # si lo hiciera, revertiría el temario nuevo sin avisar.
    print("Este script está jubilado. Usa scripts/temario-1eso.py")
    return
    for numero, programa in PROGRAMAS.items():
        ruta = f"src/data/contenido/1ESO-{numero}.json"
        datos = json.load(open(ruta, encoding="utf-8"))
        # «programa» va detrás de «bloques», que es donde se muestra.
        nuevo = {}
        for clave, valor in datos.items():
            nuevo[clave] = valor
            if clave == "bloques":
                nuevo["programa"] = programa
        json.dump(nuevo, open(ruta, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        print(f"1ESO-{numero}: «{programa['titulo']}» ({len(programa['bloques'])} bloques)")


if __name__ == "__main__":
    main()
