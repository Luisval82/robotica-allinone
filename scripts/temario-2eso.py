#!/usr/bin/env python3
"""El temario de 2º de ESO: 9 unidades en 3 evaluaciones.

Da continuidad a 1º, que ya está hecho. Lo que en 1º eran unidades enteras
—la matriz, el botón, los sonidos— aquí se da por sabido y solo aparece como
apoyo puntual cuando aclara algo. El curso va de tres cosas:

  · motores, movimientos y giros más finos,
  · sensores exigidos de verdad, leyendo números y no solo preguntas,
  · y variables, que es lo gordo: el robot deja de reaccionar al momento y
    empieza a acordarse de lo que ha pasado.

  1ª evaluación · UD 1-3 · variables y medidas: contar, medir y cronometrar
  2ª evaluación · UD 4-6 · posiciones de motor, condiciones compuestas, ritmo
  3ª evaluación · UD 7-9 · listas, bloques propios y un proyecto con datos

Las comprobaciones y el escritor están en scripts/temario_comun.py, los
mismos que usa 1º. La más importante sigue siendo que ninguna solución use un
bloque fuera de la paleta de su unidad; en 2º la paleta arrastra además TODO
lo de 1º, porque el alumno ya lo tiene aprendido.

    python3 scripts/temario-2eso.py && python3 scripts/materiales.py \\
      && python3 scripts/enunciados.py
"""

import json
import pathlib

from temario_comun import b, main, reparte_respuestas

_VIDEOS = pathlib.Path("/tmp/videos2eso.json")
VIDEOS = json.loads(_VIDEOS.read_text()) if _VIDEOS.exists() else {}

UNIDADES = []


# ───────────────────────────────────────────────────────────────────────────
# 1ª EVALUACIÓN · Variables y medidas
# ───────────────────────────────────────────────────────────────────────────

UNIDADES.append({
    "numero": 1,
    "enlace": "https://education.lego.com/en-au/lessons/spike-python-u4-doing-reps-with-loops/spike-python-u4l2-counting-reps-with-leo/",
    "video_de": 3,
    "evaluacion": 1,
    "nivel": 1,
    "titulo": "Variables: el robot se acuerda",
    "hardware": "Hub (Matriz de luces 5x5 y altavoz) + 1 Motor mediano + Sensor de fuerza",
    "modelo": "Contador de piezas: una palanca con el sensor de fuerza y un expulsor con el motor",
    "bloques": ["Variable", "Fijar variable a", "Cambiar variable por"],
    "reto": "Monta un contador que lleve la cuenta de las piezas que pasan y la enseñe en la pantalla.",
    "video": {
        "titulo": "Qué es una variable",
        "duracion": "5 min",
        "escenas": [
            {
                "plano": "Un programa de 1º: el robot reacciona al sensor y olvida lo que acaba de pasar.",
                "locucion": "Todo lo que programaste el año pasado era reaccionar al momento. El sensor nota algo, el robot hace algo y ahí se acaba. Si le preguntas cuántas veces ha pasado, no lo sabe: no se acuerda de nada.",
            },
            {
                "plano": "Una caja con una etiqueta que pone «cuenta» y un papel dentro con un número.",
                "locucion": "Una variable es una caja con nombre. Dentro guardas un número, y ese número se queda ahí hasta que tú lo cambies. El nombre es para poder pedirlo luego.",
            },
            {
                "plano": "El bloque «fijar cuenta a 0» y, al lado, el número del papel cambiando a 0.",
                "locucion": "«Fijar» mete un valor en la caja y tira lo que hubiera. Se usa al empezar, para arrancar desde cero.",
            },
            {
                "plano": "El bloque «cambiar cuenta por 1» y el papel pasando de 0 a 1, de 1 a 2.",
                "locucion": "«Cambiar por» suma a lo que ya había. Cambiar por 1 es contar uno más. Y cambiar por −1 es restar: no hay bloque de restar, se suma un número negativo.",
            },
            {
                "plano": "El bloque redondeado de la variable metido dentro de un bloque de escribir.",
                "locucion": "Y para leerla, el bloque redondeado con su nombre. Lo metes donde vaya un número: en la pantalla, en una comparación, dentro de otra cuenta.",
            },
            {
                "plano": "El contador montado: una pieza empuja la palanca y el número de la pantalla sube.",
                "locucion": "Con eso ya tienes un contador. Y un contador es el principio de casi todo: aforos, puntuaciones, vueltas dadas, piezas clasificadas.",
            },
        ],
    },
    "explicaciones": {
        "Variable": "El bloque redondeado con el nombre de la caja. Vale el número que haya dentro ahora mismo, y se mete allí donde haga falta un número.",
        "Fijar variable a": "Mete un valor en la variable y tira lo que hubiera antes. Va al principio, para empezar la cuenta desde donde quieras.",
        "Cambiar variable por": "Suma a lo que ya había. Por 1 cuenta hacia arriba; por −1, hacia abajo. No hay bloque de restar.",
    },
    "programa": {
        "titulo": "El contador de piezas",
        "explicacion": "La cuenta se pone a cero una sola vez, antes del bucle. Dentro, cada vez que se pulsa la palanca sube uno y la pantalla lo enseña.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("Fijar variable a", 0, "cuenta · 0"),
            b("Bucle infinito"),
            b("Esperar hasta que", 1, "¿Está presionado? F"),
            b("Cambiar variable por", 1, "cuenta · 1"),
            b("escribir Hello", 1, "cuenta"),
            b("Esperar hasta que", 1, "no ¿Está presionado? F"),
        ],
    },
    "construccion": {
        "piezas": "El Hub, un motor mediano, el sensor de fuerza, dos vigas de 15, cuatro vigas de 7, dos vigas angulares, un eje de 5, un panel y diez pasadores.",
        "pasos": [
            {
                "titulo": "La rampa",
                "texto": "Pon las dos vigas de 15 en paralelo e inclinadas, apoyadas por un extremo en dos vigas de 7. Las piezas bajarán rodando por ahí.",
            },
            {
                "titulo": "La palanca",
                "texto": "Monta las dos vigas angulares al final de la rampa, cruzadas, de forma que cualquier pieza que baje empuje una de ellas.",
            },
            {
                "titulo": "El sensor",
                "texto": "Coloca el sensor de fuerza justo detrás de la palanca, en el puerto F, tocándola. Al bajar una pieza, la palanca aprieta el sensor.",
            },
            {
                "titulo": "El expulsor",
                "texto": "Pon el motor al final con el eje de 5 y el panel montado, para que empuje la pieza fuera de la rampa después de contarla.",
            },
            {
                "titulo": "La prueba a mano",
                "texto": "Deja caer una pieza con el Hub encendido y mira que el sensor marque una sola pulsación. Si marca dos, la palanca rebota: ponla más corta.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "La caja con nombre",
            "enunciado": "Crea una variable llamada cuenta, ponla a 7 y escríbela en la pantalla.",
            "pista": "El bloque redondeado de la variable se mete dentro del hueco del bloque de escribir.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar variable a", 0, "cuenta · 7"),
                b("escribir Hello", 0, "cuenta"),
            ],
            "notas": "El ejercicio más corto del curso, y a propósito: lo único que tiene que quedar claro es que la variable guarda y la pantalla lee.",
        },
        {
            "titulo": "Sumar de uno en uno",
            "enunciado": "Pon la cuenta a 0 y haz cinco vueltas de bucle: sube la cuenta de uno en uno; escríbela en cada vuelta.",
            "pista": "El bloque de fijar va fuera del bucle; el de cambiar, dentro. Si fijas dentro, la cuenta vuelve a cero cada vuelta.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar variable a", 0, "cuenta · 0"),
                b("Repetir bucle", 0, "5"),
                b("Cambiar variable por", 1, "cuenta · 1"),
                b("escribir Hello", 1, "cuenta"),
            ],
            "notas": "Poner el «fijar» dentro del bucle es el error clásico de toda la unidad: el número no sube nunca de 1.",
        },
        {
            "titulo": "La cuenta atrás",
            "enunciado": "Pon una variable a 5 y haz cinco vueltas de bucle: réstale uno; escríbela.",
            "pista": "Para restar se cambia por −1: no hay bloque de restar.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar variable a", 0, "cuenta · 5"),
                b("Repetir bucle", 0, "5"),
                b("Cambiar variable por", 1, "cuenta · -1"),
                b("escribir Hello", 1, "cuenta"),
                b("Esperar X segundos", 1, "0.5"),
            ],
            "notas": "Lo único nuevo es el número negativo. Verlo bajar de 5 a 0 lo deja claro sin explicar nada.",
        },
        {
            "titulo": "El contador del sensor",
            "enunciado": "Pon la cuenta a 0 y, dentro de un bucle infinito, haz esto: espera a que se apriete el sensor de fuerza; sube la cuenta uno; escríbela; espera a que se suelte.",
            "pista": "La segunda espera es la importante: sin ella el programa cuenta decenas de veces mientras tengas el dedo puesto.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar variable a", 0, "cuenta · 0"),
                b("Bucle infinito"),
                b("Esperar hasta que", 1, "¿Está presionado? F"),
                b("Cambiar variable por", 1, "cuenta · 1"),
                b("escribir Hello", 1, "cuenta"),
                b("Esperar hasta que", 1, "no ¿Está presionado? F"),
            ],
            "notas": "Esperar a que se suelte es el truco de todos los contadores con botón. Sin él, un toque cuenta como veinte.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Qué es una variable?",
            "opciones": [
                "Un bloque que mueve el motor",
                "Una caja con nombre donde se guarda un número hasta que lo cambies",
                "Un sensor interno del Hub",
                "Otra forma de llamar a un bucle",
            ],
            "correcta": 1,
            "explicacion": "Guarda un valor y se lo puedes pedir después. Por eso el robot deja de olvidar lo que ha pasado.",
        },
        {
            "pregunta": "Diferencia entre «fijar cuenta a 0» y «cambiar cuenta por 1»:",
            "opciones": [
                "Ninguna",
                "«Fijar» mete ese valor y tira lo anterior; «cambiar» suma a lo que había",
                "«Fijar» solo vale para números y «cambiar» para textos",
                "«Cambiar» borra la variable",
            ],
            "correcta": 1,
            "explicacion": "Uno sustituye y el otro suma. Confundirlos deja el contador clavado o lo reinicia sin querer.",
        },
        {
            "pregunta": "Metes «fijar cuenta a 0» DENTRO del bucle. ¿Qué pasa?",
            "opciones": [
                "La cuenta sube normalmente",
                "La cuenta vuelve a 0 en cada vuelta y nunca pasa de 1",
                "El programa da error",
                "La cuenta sube de dos en dos",
            ],
            "correcta": 1,
            "explicacion": "En cada vuelta se borra lo contado. El «fijar» va una sola vez, antes de empezar.",
        },
        {
            "pregunta": "¿Cómo se resta 1 a una variable?",
            "opciones": [
                "Con el bloque «restar variable por 1»",
                "Cambiándola por −1",
                "Fijándola a −1",
                "No se puede restar",
            ],
            "correcta": 1,
            "explicacion": "No hay bloque de restar: se suma un número negativo.",
        },
        {
            "pregunta": "¿Qué forma tiene el bloque que lee una variable?",
            "opciones": ["De sombrero", "Rectangular, de pila", "Redondeado, como los números", "De rombo"],
            "correcta": 2,
            "explicacion": "Vale un número, así que es redondeado y encaja en los huecos de número.",
        },
        {
            "pregunta": "En un contador con botón, ¿para qué sirve esperar a que se suelte?",
            "opciones": [
                "Para que el motor descanse",
                "Para que un solo toque no cuente muchas veces",
                "Para que la pantalla no parpadee",
                "No sirve para nada",
            ],
            "correcta": 1,
            "explicacion": "El bucle da muchas vueltas por segundo. Si no esperas a que se suelte, cuenta en todas.",
        },
        {
            "pregunta": "Quieres que la pantalla enseñe el valor de la variable. ¿Qué haces?",
            "opciones": [
                "Escribir el nombre de la variable entre comillas",
                "Meter el bloque redondeado de la variable en el hueco del bloque de escribir",
                "Fijar la pantalla a la variable",
                "No se puede: la pantalla solo enseña texto fijo",
            ],
            "correcta": 1,
            "explicacion": "El hueco de escribir admite números, y el bloque de la variable es un número.",
        },
        {
            "pregunta": "¿Para qué sirve ponerle nombre a una variable?",
            "opciones": [
                "Para que el programa vaya más rápido",
                "Para poder pedirla después y para entender el programa al leerlo",
                "Es obligatorio pero da igual el nombre",
                "Para que el Hub la guarde al apagarse",
            ],
            "correcta": 1,
            "explicacion": "«cuenta» o «aforo» se entienden solos; «a» y «b» te obligan a adivinar qué guardaba cada una.",
        },
    ],
    "practicas": [
        {
            "titulo": "El contador de piezas",
            "enunciado": "Pon la cuenta a 0 y, dentro de un bucle infinito, haz esto: espera a que se apriete el sensor de fuerza; sube la cuenta uno; escríbela en la pantalla; espera a que se suelte.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar variable a", 0, "cuenta · 0"),
                b("Bucle infinito"),
                b("Esperar hasta que", 1, "¿Está presionado? F"),
                b("Cambiar variable por", 1, "cuenta · 1"),
                b("escribir Hello", 1, "cuenta"),
                b("Esperar hasta que", 1, "no ¿Está presionado? F"),
            ],
            "notas": "Se corrige que el «fijar» esté fuera del bucle y que haya espera a soltar. Sin eso, el contador no cuenta bien.",
        },
        {
            "titulo": "El aforo con expulsor",
            "enunciado": "Cuenta las piezas como en la práctica anterior y, cuando la cuenta llegue a 5, haz esto: pon el botón central en rojo; mueve el motor A media vuelta para expulsarlas; vuelve a poner la cuenta a 0.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar variable a", 0, "cuenta · 0"),
                b("Bucle infinito"),
                b("Esperar hasta que", 1, "¿Está presionado? F"),
                b("Cambiar variable por", 1, "cuenta · 1"),
                b("escribir Hello", 1, "cuenta"),
                b("Esperar hasta que", 1, "no ¿Está presionado? F"),
                b("Si... entonces...", 1, "cuenta = 5"),
                b("poner luz del botón central en rojo", 2, "rojo"),
                b("A ir durante 1 rotaciones", 2, "A", "↻", "180", "grados"),
                b("Fijar variable a", 2, "cuenta · 0"),
            ],
            "notas": "Aquí la variable ya no solo cuenta: decide. El «fijar a 0» de dentro del «Si» es el reinicio, no el del principio.",
        },
    ],
})


UNIDADES.append({
    "numero": 2,
    "enlace": "https://education.lego.com/en-us/lessons/prime-competition-ready/training-camp-1-driving-around/",
    "video_de": 5,
    "evaluacion": 1,
    "nivel": 1,
    "titulo": "Medir de verdad: centímetros y cronómetro",
    "hardware": "Hub (Giroscopio y matriz de luces 5x5) + 2 Motor mediano + Sensor de distancia",
    "modelo": "Base de conducción calibrada, con la rueda medida y una marca de salida en la mesa",
    "bloques": [
        "fijar 1 rotación del motor en 17.5 cm recorridos",
        "Reiniciar cronómetro",
        "Cronómetro",
    ],
    "reto": "Consigue que el robot recorra 50 centímetros de verdad y que te diga cuánto ha tardado.",
    "video": {
        "titulo": "De rotaciones a centímetros",
        "duracion": "5 min",
        "escenas": [
            {
                "plano": "Dos robots con ruedas de distinto tamaño hacen «2 rotaciones». Uno llega mucho más lejos.",
                "locucion": "El año pasado medías en rotaciones. El problema es que una rotación no es una distancia: depende de lo grande que sea la rueda. Dos robots con el mismo programa llegan a sitios distintos.",
            },
            {
                "plano": "Una cinta métrica rodeando una rueda. Marca 17,5 centímetros.",
                "locucion": "Lo que sí es fijo es cuánto avanza TU rueda en una vuelta: la vuelta de la rueda, su perímetro. Lo mides con una cinta, o la haces rodar una vuelta y mides la marca.",
            },
            {
                "plano": "El bloque de fijar la rotación en 17,5 cm, al principio del programa.",
                "locucion": "Le dices eso al Hub una sola vez, al empezar, y a partir de ahí puedes pedirle centímetros. «Avanza 50 centímetros» y avanza 50.",
            },
            {
                "plano": "Un cronómetro de pantalla poniéndose a cero y empezando a correr.",
                "locucion": "Y el Hub tiene un cronómetro. Siempre está corriendo; lo que haces es ponerlo a cero cuando quieres empezar a medir, igual que con el giroscopio.",
            },
            {
                "plano": "El bloque redondeado del cronómetro metido dentro de «fijar tiempo a».",
                "locucion": "El cronómetro es un número redondeado, así que se guarda en una variable, se compara o se escribe. Con eso ya puedes medir cuánto tarda el robot en algo.",
            },
            {
                "plano": "El robot recorre 50 cm, para y escribe en la pantalla el tiempo que ha tardado.",
                "locucion": "Distancia de verdad y tiempo de verdad. A partir de aquí el robot no hace cosas: hace medidas.",
            },
        ],
    },
    "explicaciones": {
        "fijar 1 rotación del motor en 17.5 cm recorridos": "Le dice al Hub cuánto avanza tu robot en una vuelta de rueda. Puesto al principio, los bloques de mover ya aceptan centímetros.",
        "Reiniciar cronómetro": "Pone el cronómetro a cero. No lo arranca —siempre está corriendo—: marca desde dónde empiezas a contar.",
        "Cronómetro": "Un número: los segundos que han pasado desde la última puesta a cero. Se guarda, se compara o se escribe.",
    },
    "programa": {
        "titulo": "Cincuenta centímetros cronometrados",
        "explicacion": "Primero se le dice al Hub cuánto mide la vuelta de rueda, y después ya se puede hablar en centímetros. El cronómetro se pone a cero justo antes de salir.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("fijar A+B como motores en movimiento", 0, "A+B"),
            b("fijar 1 rotación del motor en 17.5 cm recorridos", 0, "17.5", "cm"),
            b("fijar velocidad de movimiento al 50 %", 0, "40"),
            b("Reiniciar cronómetro"),
            b("mover ↑ durante 10 rotaciones", 0, "↑", "50", "cm"),
            b("Fijar variable a", 0, "tiempo · Cronómetro"),
            b("escribir Hello", 0, "tiempo"),
        ],
    },
    "construccion": {
        "piezas": "La base de conducción de 1º, el sensor de distancia, dos bujes, dos vigas de 7 y cuatro pasadores.",
        "pasos": [
            {
                "titulo": "Apretar las ruedas",
                "texto": "Pon un buje pegado a cada rueda para que no bailen en el eje. Una rueda floja avanza menos de lo que dice el programa.",
            },
            {
                "titulo": "Medir la vuelta de rueda",
                "texto": "Marca un punto de la rueda con cinta, hazla rodar una vuelta entera sobre la mesa y mide con una regla lo que ha avanzado. Ese número es el que va en el bloque.",
            },
            {
                "titulo": "El sensor de distancia",
                "texto": "Monta las dos vigas de 7 delante y encaja el sensor entre ellas, mirando al frente.",
            },
            {
                "titulo": "La pista",
                "texto": "Pega dos marcas de cinta en la mesa separadas 50 centímetros medidos con la regla. Es contra eso contra lo que vas a comprobar el robot.",
            },
            {
                "titulo": "La comprobación",
                "texto": "Lanza el robot desde la primera marca. Si se queda corto o se pasa, la vuelta de rueda que has puesto no es la buena: vuelve a medirla.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Treinta centímetros",
            "enunciado": "Dile al Hub cuánto mide la vuelta de tu rueda y haz que el robot avance 30 centímetros.",
            "pista": "El bloque de la vuelta de rueda va antes que cualquier movimiento, igual que el de fijar los motores.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar 1 rotación del motor en 17.5 cm recorridos", 0, "17.5", "cm"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "30", "cm"),
            ],
            "notas": "Se mide con la regla. Si falla por poco, casi siempre es que la vuelta de rueda está mal medida.",
        },
        {
            "titulo": "Cuánto he tardado",
            "enunciado": "Pon el cronómetro a cero, avanza 40 centímetros, guarda el cronómetro en una variable llamada tiempo y escríbela.",
            "pista": "El cronómetro se guarda justo al terminar el movimiento, no antes.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar 1 rotación del motor en 17.5 cm recorridos", 0, "17.5", "cm"),
                b("Reiniciar cronómetro"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "40", "cm"),
                b("Fijar variable a", 0, "tiempo · Cronómetro"),
                b("escribir Hello", 0, "tiempo"),
            ],
            "notas": "Primera medida de verdad del curso. Bajando la velocidad se ve que el número sube.",
        },
        {
            "titulo": "Diez segundos de patrulla",
            "enunciado": "Haz una patrulla con límite de tiempo: pon el cronómetro a cero; arranca hacia delante; repite hasta que el cronómetro pase de 10 segundos; para el movimiento.",
            "pista": "El cronómetro va dentro de la condición del bucle, comparado con 10.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("Reiniciar cronómetro"),
                b("empezar a mover a ↑", 0, "↑"),
                b("Repetir bucle hasta", 0, "Cronómetro > 10"),
                b("Esperar X segundos", 1, "0.05"),
                b("parar movimiento", 0),
            ],
            "notas": "Se podría hacer con «esperar 10 segundos», y conviene decirlo: lo que se practica es usar el cronómetro como condición.",
        },
        {
            "titulo": "La carrera hasta la pared",
            "enunciado": "Pon el cronómetro a cero, arranca hacia delante, repite hasta que haya algo a menos de 15 centímetros, para y escribe el tiempo que has tardado.",
            "pista": "Aquí no sabes cuánto va a durar: por eso se mide con el cronómetro en vez de contar segundos.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar velocidad de movimiento al 50 %", 0, "50"),
                b("Reiniciar cronómetro"),
                b("empezar a mover a ↑", 0, "↑"),
                b("Repetir bucle hasta", 0, "¿Está más próximo a? E 15 cm"),
                b("Esperar X segundos", 1, "0.05"),
                b("parar movimiento", 0),
                b("Fijar variable a", 0, "tiempo · Cronómetro"),
                b("escribir Hello", 0, "tiempo"),
            ],
            "notas": "Cambiando la velocidad y repitiendo sale una pequeña tabla de tiempos. Es el primer experimento del curso.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Por qué dos robots con el mismo programa en rotaciones llegan a sitios distintos?",
            "opciones": [
                "Porque los motores no son iguales",
                "Porque una rotación avanza más o menos según el tamaño de la rueda",
                "Porque uno tiene más batería",
                "Porque el programa se ejecuta a distinta velocidad",
            ],
            "correcta": 1,
            "explicacion": "La rotación mide vueltas de rueda, no distancia. Con ruedas distintas, la misma vuelta recorre distinto.",
        },
        {
            "pregunta": "¿Qué es la vuelta de rueda que hay que medir?",
            "opciones": [
                "El diámetro de la rueda",
                "Lo que avanza el robot cuando la rueda da una vuelta entera",
                "Las vueltas que da el motor en un segundo",
                "El ancho del neumático",
            ],
            "correcta": 1,
            "explicacion": "Es el perímetro: lo que recorre en una vuelta. Se mide haciéndola rodar una vuelta y midiendo con la regla.",
        },
        {
            "pregunta": "¿Dónde va el bloque que fija la vuelta de rueda?",
            "opciones": [
                "Al principio, antes de cualquier movimiento",
                "Justo antes de parar",
                "Dentro del bucle",
                "Al final del programa",
            ],
            "correcta": 0,
            "explicacion": "Afecta a los movimientos que vengan después. Puesto al final, no sirve de nada.",
        },
        {
            "pregunta": "¿Qué hace «Reiniciar cronómetro»?",
            "opciones": [
                "Arranca el cronómetro, que estaba parado",
                "Lo pone a cero: el cronómetro siempre está corriendo",
                "Para el cronómetro",
                "Borra el tiempo guardado en la variable",
            ],
            "correcta": 1,
            "explicacion": "Igual que el giroscopio: no arranca nada, marca desde dónde cuentas.",
        },
        {
            "pregunta": "El bloque «Cronómetro», ¿qué forma tiene?",
            "opciones": ["De rombo", "Redondeado, de número", "De sombrero", "Rectangular"],
            "correcta": 1,
            "explicacion": "Da los segundos que han pasado, así que es un número y va en huecos de número.",
        },
        {
            "pregunta": "Quieres saber cuánto tarda el robot en llegar a una pared. ¿Por qué no vale «esperar 5 segundos»?",
            "opciones": [
                "Porque no sabes de antemano cuánto va a tardar",
                "Porque el bloque de esperar no funciona con sensores",
                "Porque 5 segundos es poco",
                "Sí vale, es lo mismo",
            ],
            "correcta": 0,
            "explicacion": "La espera fija un tiempo que tú decides. El cronómetro mide el que sale, que es lo que quieres saber.",
        },
        {
            "pregunta": "Pides 50 centímetros y el robot recorre 60. ¿Qué pasa?",
            "opciones": [
                "La vuelta de rueda que has puesto es menor que la de verdad",
                "La batería está baja",
                "El giroscopio está descalibrado",
                "Hay que bajar la velocidad",
            ],
            "correcta": 0,
            "explicacion": "Si le dices que cada vuelta avanza poco, el Hub manda más vueltas de la cuenta y se pasa.",
        },
        {
            "pregunta": "¿Se puede guardar el cronómetro en una variable?",
            "opciones": [
                "No, el cronómetro no se puede leer",
                "Sí: es un número, y se guarda con «fijar variable a»",
                "Solo si antes lo paras",
                "Solo dentro de un bucle",
            ],
            "correcta": 1,
            "explicacion": "Guardarlo es justo lo que hace falta para comparar medidas, porque el cronómetro sigue corriendo.",
        },
    ],
    "practicas": [
        {
            "titulo": "Los cincuenta centímetros cronometrados",
            "enunciado": "Fija los motores y la vuelta de rueda, pon la velocidad al 40 %, pon el cronómetro a cero, avanza 50 centímetros, guarda el cronómetro en la variable tiempo y escríbela.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar 1 rotación del motor en 17.5 cm recorridos", 0, "17.5", "cm"),
                b("fijar velocidad de movimiento al 50 %", 0, "40"),
                b("Reiniciar cronómetro"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "50", "cm"),
                b("Fijar variable a", 0, "tiempo · Cronómetro"),
                b("escribir Hello", 0, "tiempo"),
            ],
            "notas": "Se comprueba con la regla contra la marca de la mesa. El orden de los tres bloques de preparación es lo que más falla.",
        },
        {
            "titulo": "La ida y la vuelta medidas",
            "enunciado": "Mide el tiempo de una ida y vuelta: pon el cronómetro a cero; avanza 40 centímetros; da media vuelta girando sobre el sitio; vuelve otros 40 centímetros; escribe el tiempo total.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar 1 rotación del motor en 17.5 cm recorridos", 0, "17.5", "cm"),
                b("fijar velocidad de movimiento al 50 %", 0, "40"),
                b("Reiniciar cronómetro"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "40", "cm"),
                b("mover derecha: 30 durante 10 rotaciones", 0, "derecha: 100", "1", "rotaciones"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "40", "cm"),
                b("Fijar variable a", 0, "tiempo · Cronómetro"),
                b("escribir Hello", 0, "tiempo"),
            ],
            "notas": "El giro sigue en rotaciones a propósito: girar sobre el sitio no recorre distancia hacia delante.",
        },
    ],
})


UNIDADES.append({
    "numero": 3,
    "enlace": "https://education.lego.com/en-us/lessons/spike-python-u3-sensor-control/spike-python-u3l1-start-sensing/",
    "evaluacion": 1,
    "nivel": 1,
    "titulo": "Sensores con número: presión, umbrales y cuentas",
    "hardware": "Hub (Matriz de luces 5x5 y altavoz) + 1 Motor mediano + Sensor de color + Sensor de distancia + Sensor de fuerza",
    "modelo": "Báscula de laboratorio: una plataforma apoyada en el sensor de fuerza con una aguja movida por el motor",
    "bloques": ["Presión (sensor de fuerza)", "Operadores aritméticos (+, −, ×, ÷)"],
    "reto": "Monta una báscula que lea cuánta fuerza recibe, la enseñe y vaya sumando las pesadas.",
    "video": {
        "titulo": "Preguntas que dan números",
        "duracion": "4 min",
        "escenas": [
            {
                "plano": "El bloque «¿Está presionado?» en forma de rombo, con dos respuestas: sí o no.",
                "locucion": "Hasta ahora, al sensor de fuerza solo le preguntabas una cosa: ¿te están apretando? Sí o no. Pero el sensor sabe más: sabe CUÁNTO lo aprietas.",
            },
            {
                "plano": "El bloque redondeado de la presión y un número que sube de 0 a 100 al apretar más.",
                "locucion": "La presión es un número de 0 a 100. Apoyar el dedo da veinte y pocos; apretar fuerte, más de ochenta. Eso ya no es un interruptor: es una medida.",
            },
            {
                "plano": "Tres números juntos en la pantalla: distancia, luz reflejada y presión.",
                "locucion": "Los tres sensores dan números, no solo respuestas. Distancia en centímetros, luz reflejada de 0 a 100 y ahora presión de 0 a 100.",
            },
            {
                "plano": "Los bloques de sumar, restar, multiplicar y dividir, encajados unos dentro de otros.",
                "locucion": "Y para hacer cuentas con esos números hay bloques de sumar, restar, multiplicar y dividir. Se encajan unos dentro de otros, como las muñecas rusas.",
            },
            {
                "plano": "Una variable «total» a la que se le suma la presión cada vez que se pulsa.",
                "locucion": "Con eso puedes acumular: cada pesada se suma al total. Y dividiendo el total entre el número de pesadas sale la media.",
            },
        ],
    },
    "explicaciones": {
        "Presión (sensor de fuerza)": "Un número de 0 a 100: cuánto está apretado el sensor de fuerza. No es sí o no, es cuánto.",
        "Operadores aritméticos (+, −, ×, ÷)": "Suma, resta, multiplica o divide dos números. Se encajan unos dentro de otros para hacer cuentas más largas.",
    },
    "programa": {
        "titulo": "La báscula",
        "explicacion": "Cada vez que se aprieta, se lee la presión, se guarda, se suma al total y se sube la cuenta de pesadas. Con el total y la cuenta se puede sacar la media.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("Fijar variable a", 0, "total · 0"),
            b("Fijar variable a", 0, "pesadas · 0"),
            b("Bucle infinito"),
            b("Esperar hasta que", 1, "Presión F > 20"),
            b("Fijar variable a", 1, "ultima · Presión F"),
            b("Fijar variable a", 1, "total · total + ultima"),
            b("Cambiar variable por", 1, "pesadas · 1"),
            b("escribir Hello", 1, "ultima"),
            b("Esperar hasta que", 1, "Presión F < 5"),
        ],
    },
    "construccion": {
        "piezas": "El Hub, un motor mediano, el sensor de fuerza, el sensor de color, el sensor de distancia, dos marcos Technic, dos vigas de 11, dos vigas de 7, un eje de 3 y ocho pasadores.",
        "pasos": [
            {
                "titulo": "El cuerpo",
                "texto": "Monta los dos marcos Technic de pie y en paralelo, unidos por las dos vigas de 11. Es la columna de la báscula.",
            },
            {
                "titulo": "El plato",
                "texto": "Pon las dos vigas de 7 cruzadas arriba, formando una plataforma pequeña donde dejar lo que se va a pesar.",
            },
            {
                "titulo": "El sensor de fuerza",
                "texto": "Coloca el sensor de fuerza justo debajo del plato, en el puerto F, de forma que todo el peso caiga sobre su botón.",
            },
            {
                "titulo": "La aguja",
                "texto": "Monta el motor en un lateral con el eje de 3 hacia fuera. La aguja girará más o menos según lo que marque la báscula.",
            },
            {
                "titulo": "Los otros sensores",
                "texto": "Deja el de color y el de distancia montados en la base, en los puertos D y E: se usan en las prácticas para comparar los tres números.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Cuánto aprietas",
            "enunciado": "Pon un bucle infinito que escriba en la pantalla la presión del sensor de fuerza.",
            "pista": "La presión es un número redondeado: se mete en el hueco del bloque de escribir.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Bucle infinito"),
                b("escribir Hello", 1, "Presión F"),
            ],
            "notas": "Apretando más y menos se ve el número cambiar. Es la forma más rápida de entender que no es sí o no.",
        },
        {
            "titulo": "El umbral",
            "enunciado": "En un bucle infinito, mira la presión: si pasa de 50, pon el botón central en rojo; si no, ponlo en verde.",
            "pista": "La presión se compara con 50 dentro de la pregunta del «Si... entonces... Si no...».",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Bucle infinito"),
                b("Si... entonces... Si no...", 1, "Presión F > 50"),
                b("poner luz del botón central en rojo", 2, "rojo"),
                b("poner luz del botón central en rojo", 2, "verde"),
            ],
            "notas": "Un umbral es una raya que tú eliges. Cincuenta no tiene nada de especial: se puede probar con otros.",
        },
        {
            "titulo": "El total de las pesadas",
            "enunciado": "Pon el total a 0 y, dentro de un bucle infinito, haz esto: espera a que la presión pase de 20; súmala al total; escribe el total; espera a que la presión baje de 5.",
            "pista": "Para sumar se usa el bloque de sumar dentro del bloque de fijar: total pasa a ser total más la presión.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar variable a", 0, "total · 0"),
                b("Bucle infinito"),
                b("Esperar hasta que", 1, "Presión F > 20"),
                b("Fijar variable a", 1, "total · total + Presión F"),
                b("escribir Hello", 1, "total"),
                b("Esperar hasta que", 1, "Presión F < 5"),
            ],
            "notas": "Las dos esperas con umbrales distintos evitan que una sola pesada cuente varias veces mientras sueltas.",
        },
        {
            "titulo": "La media",
            "enunciado": "Repite la báscula anterior con dos añadidos: lleva también la cuenta de las pesadas; escribe al final de cada vuelta el total dividido entre las pesadas.",
            "pista": "La división se encaja dentro del bloque de escribir, con el total arriba y las pesadas abajo.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar variable a", 0, "total · 0"),
                b("Fijar variable a", 0, "pesadas · 0"),
                b("Bucle infinito"),
                b("Esperar hasta que", 1, "Presión F > 20"),
                b("Fijar variable a", 1, "total · total + Presión F"),
                b("Cambiar variable por", 1, "pesadas · 1"),
                b("escribir Hello", 1, "total ÷ pesadas"),
                b("Esperar hasta que", 1, "Presión F < 5"),
            ],
            "notas": "La media necesita dos variables: lo acumulado y cuántas veces. Es el primer cálculo de verdad del curso.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Entre qué valores va la presión del sensor de fuerza?",
            "opciones": ["0 y 10", "0 y 100", "0 y 360", "−100 y 100"],
            "correcta": 1,
            "explicacion": "Es un porcentaje, como el brillo o la velocidad: 0 sin tocar y 100 apretado a tope.",
        },
        {
            "pregunta": "Diferencia entre «¿Está presionado?» y «Presión»:",
            "opciones": [
                "Ninguna",
                "La primera da sí o no; la segunda da cuánto, de 0 a 100",
                "La segunda solo funciona con el motor conectado",
                "La primera es más exacta",
            ],
            "correcta": 1,
            "explicacion": "Una es un interruptor y la otra una medida. Con la medida puedes poner el umbral donde quieras.",
        },
        {
            "pregunta": "¿Qué es un umbral?",
            "opciones": [
                "Un bloque de SPIKE",
                "El número que tú eliges como raya para decidir",
                "El máximo que aguanta el sensor",
                "La velocidad mínima del motor",
            ],
            "correcta": 1,
            "explicacion": "Lo eliges tú según lo que quieras detectar, y conviene probarlo: no hay un valor bueno universal.",
        },
        {
            "pregunta": "¿Cómo se suma la presión a una variable total?",
            "opciones": [
                "Con «cambiar total por Presión»",
                "Fijando total a total más Presión",
                "Las dos cosas valen",
                "No se puede sumar un sensor a una variable",
            ],
            "correcta": 2,
            "explicacion": "«Cambiar por» suma, y «fijar a total + presión» también. Las dos llegan al mismo sitio.",
        },
        {
            "pregunta": "¿Qué hace falta para calcular una media?",
            "opciones": [
                "Solo el total",
                "El total y cuántas veces has sumado",
                "El máximo y el mínimo",
                "El cronómetro",
            ],
            "correcta": 1,
            "explicacion": "Media es total dividido entre el número de datos: hacen falta las dos variables.",
        },
        {
            "pregunta": "En el bucle de pesadas se espera a que la presión pase de 20 y luego a que baje de 5. ¿Por qué dos números distintos?",
            "opciones": [
                "Por error: deberían ser iguales",
                "Para que una pesada no cuente varias veces mientras sueltas poco a poco",
                "Porque el sensor no llega a 0",
                "Para que el programa vaya más rápido",
            ],
            "correcta": 1,
            "explicacion": "Con el mismo número, al rondar el umbral el programa cuenta muchas veces. Separarlos da margen.",
        },
        {
            "pregunta": "Los bloques de cuentas (+, −, ×, ÷), ¿se pueden meter uno dentro de otro?",
            "opciones": ["No", "Sí, y así se hacen cuentas más largas", "Solo dos como máximo", "Solo los de sumar"],
            "correcta": 1,
            "explicacion": "Son bloques redondeados y encajan en los huecos de número de otros bloques redondeados.",
        },
        {
            "pregunta": "¿Cuál de estos NO da un número?",
            "opciones": ["Distancia", "Luz reflejada", "Presión", "¿Es de color rojo?"],
            "correcta": 3,
            "explicacion": "Esa es una pregunta de rombo: vale verdad o mentira. Las otras tres son medidas.",
        },
    ],
    "practicas": [
        {
            "titulo": "La báscula con media",
            "enunciado": "Pon el total y las pesadas a 0 y, dentro de un bucle infinito, haz esto: espera a que la presión pase de 20; guárdala en una variable; súmala al total; sube las pesadas; escribe la media; espera a que la presión baje de 5.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar variable a", 0, "total · 0"),
                b("Fijar variable a", 0, "pesadas · 0"),
                b("Bucle infinito"),
                b("Esperar hasta que", 1, "Presión F > 20"),
                b("Fijar variable a", 1, "ultima · Presión F"),
                b("Fijar variable a", 1, "total · total + ultima"),
                b("Cambiar variable por", 1, "pesadas · 1"),
                b("escribir Hello", 1, "total ÷ pesadas"),
                b("Esperar hasta que", 1, "Presión F < 5"),
            ],
            "notas": "Tres variables trabajando juntas. Lo que se corrige es que los «fijar a 0» estén fuera del bucle.",
        },
        {
            "titulo": "El control de calidad",
            "enunciado": "En un bucle infinito, espera a que la presión pase de 20, guárdala y después decide: si pasa de 70, escribe FUERTE y mueve el motor A 90 grados a un lado; si no, escribe FLOJA y muévelo 90 grados al otro.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Bucle infinito"),
                b("Esperar hasta que", 1, "Presión F > 20"),
                b("Fijar variable a", 1, "ultima · Presión F"),
                b("Si... entonces... Si no...", 1, "ultima > 70"),
                b("escribir Hello", 2, "FUERTE"),
                b("A ir durante 1 rotaciones", 2, "A", "↻", "90", "grados"),
                b("escribir Hello", 2, "FLOJA"),
                b("A ir durante 1 rotaciones", 2, "A", "↺", "90", "grados"),
                b("Esperar hasta que", 1, "Presión F < 5"),
            ],
            "notas": "Guardar la lectura antes de decidir es importante: si comparas el sensor directamente, el valor puede haber cambiado entre una línea y la siguiente.",
        },
    ],
})


# ───────────────────────────────────────────────────────────────────────────
# 2ª EVALUACIÓN · Posiciones, condiciones compuestas y ritmo
# ───────────────────────────────────────────────────────────────────────────

UNIDADES.append({
    "numero": 4,
    "enlace": "https://education.lego.com/en-us/lessons/get-moving-with-motors/new-moves-with-motors/",
    "evaluacion": 2,
    "nivel": 2,
    "titulo": "La posición del motor: brazos que vuelven a su sitio",
    "hardware": "Hub (Matriz de luces 5x5 y altavoz) + 2 Motor mediano + Sensor de distancia",
    "modelo": "Torreta orientable: un motor gira la base y otro sube el brazo, con el sensor de distancia en la punta",
    "bloques": [
        "A posición",
        "Fijar la posición relativa en…",
        "Ir a la posición relativa del motor a velocidad",
    ],
    "reto": "Monta una torreta que apunte a un objeto, guarde el ángulo y sepa volver sola a su posición de reposo.",
    "video": {
        "titulo": "Dónde está el eje",
        "duracion": "5 min",
        "escenas": [
            {
                "plano": "Un brazo que sube 90 grados y baja 90 grados, y después de diez repeticiones ha quedado torcido.",
                "locucion": "Mover un motor 90 grados y luego otros 90 hacia atrás parece que lo deja donde estaba. Pero cada movimiento se queda un poco corto, y a las diez repeticiones el brazo está torcido.",
            },
            {
                "plano": "El eje del motor con una escala de grados alrededor, como un transportador.",
                "locucion": "El motor no solo gira: sabe en qué posición está su eje, como la aguja de un reloj. Eso es la posición, y no se pierde aunque muevas el brazo con la mano.",
            },
            {
                "plano": "El bloque redondeado de la posición con un número que cambia al girar el eje a mano.",
                "locucion": "Es un número que puedes leer, guardar en una variable o comparar. Gira el eje con la mano y el número cambia solo.",
            },
            {
                "plano": "El bloque de fijar la posición relativa, poniendo el contador a cero con el brazo abajo.",
                "locucion": "Y puedes decidir dónde está el cero. Pones el brazo en reposo, fijas la posición relativa a cero, y a partir de ahí los grados cuentan desde ahí.",
            },
            {
                "plano": "El brazo volviendo solo a la posición 0 después de varios movimientos sueltos.",
                "locucion": "Con eso, «vuelve a tu sitio» deja de ser contar hacia atrás y pasa a ser una orden: vete a la posición cero. Dé las vueltas que haya dado.",
            },
        ],
    },
    "explicaciones": {
        "A posición": "Un número: en qué posición está el eje de ese motor, en grados. Se lee, se guarda y se compara como cualquier otro número.",
        "Fijar la posición relativa en…": "Decide dónde está el cero de ese motor. Con el brazo en reposo, fijarlo a 0 es decir «esta es tu posición de partida».",
        "Ir a la posición relativa del motor a velocidad": "Lleva el eje a una posición concreta, vaya donde vaya y venga de donde venga. Es lo que hace que un brazo vuelva siempre al mismo sitio.",
    },
    "programa": {
        "titulo": "La torreta que apunta y vuelve",
        "explicacion": "Primero se marca el cero con la torreta en reposo. Después gira buscando, guarda la posición donde encontró algo y al final vuelve al cero de una orden.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("Fijar la posición relativa en…", 0, "A · 0"),
            b("A fijar velocidad al 75 %", 0, "A", "25"),
            b("A arrancar motor", 0, "A", "↻"),
            b("Repetir bucle hasta", 0, "¿Está más próximo a? E 30 cm"),
            b("Esperar X segundos", 1, "0.05"),
            b("A parar motor", 0, "A"),
            b("Fijar variable a", 0, "angulo · A posición"),
            b("escribir Hello", 0, "angulo"),
            b("Esperar X segundos", 0, "2"),
            b("Ir a la posición relativa del motor a velocidad", 0, "A · 0 · 25"),
        ],
    },
    "construccion": {
        "piezas": "El Hub, dos motores medianos, el sensor de distancia, dos marcos Technic, cuatro vigas de 11, dos vigas de 7, dos ejes de 5, un eje de 7, dos bujes y doce pasadores.",
        "pasos": [
            {
                "titulo": "La peana",
                "texto": "Une los dos marcos Technic en cruz sobre la mesa y fija el Hub encima. Tiene que quedar bien apoyado: la torreta va a girar sobre él.",
            },
            {
                "titulo": "El motor de giro",
                "texto": "Pon el primer motor en el centro de la peana con el eje de 7 hacia arriba. Este es el que gira toda la torreta.",
            },
            {
                "titulo": "El brazo",
                "texto": "Cruza dos vigas de 11 sobre el eje vertical y monta el segundo motor en la punta, con el eje horizontal. Ese sube y baja el brazo.",
            },
            {
                "titulo": "El sensor",
                "texto": "Fija el sensor de distancia al extremo del brazo con las dos vigas de 7, mirando hacia fuera.",
            },
            {
                "titulo": "El tope de reposo",
                "texto": "Pega una marca en la peana y deja la torreta apuntando a ella. Esa es la posición cero, y es donde tiene que volver siempre.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Dónde está el eje",
            "enunciado": "Pon un bucle infinito que escriba en la pantalla la posición del motor A. Gíralo con la mano para ver cómo cambia el número.",
            "pista": "La posición es un número redondeado, igual que la presión o el cronómetro.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Bucle infinito"),
                b("escribir Hello", 1, "A posición"),
            ],
            "notas": "Girar el eje con la mano y ver el número es lo que hace entender que la posición no depende del programa.",
        },
        {
            "titulo": "Marcar el cero",
            "enunciado": "Fija la posición relativa del motor A a 0, espera tres segundos para moverlo con la mano y escribe entonces su posición.",
            "pista": "El bloque de fijar la posición no mueve nada: solo decide desde dónde se cuenta.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar la posición relativa en…", 0, "A · 0"),
                b("Esperar X segundos", 0, "3"),
                b("escribir Hello", 0, "A posición"),
            ],
            "notas": "Mismo truco que el giroscopio y el cronómetro: marcar el punto de partida antes de medir.",
        },
        {
            "titulo": "Vuelve a tu sitio",
            "enunciado": "Fija la posición relativa a 0, mueve el motor A 120 grados, espera un segundo y mándalo de vuelta a la posición 0.",
            "pista": "Para volver no hay que contar hacia atrás: se le dice la posición a la que tiene que ir.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar la posición relativa en…", 0, "A · 0"),
                b("A ir durante 1 rotaciones", 0, "A", "↻", "120", "grados"),
                b("Esperar X segundos", 0, "1"),
                b("Ir a la posición relativa del motor a velocidad", 0, "A · 0 · 30"),
            ],
            "notas": "Lo interesante es moverlo también con la mano entre medias: vuelve igual, porque la posición no se pierde.",
        },
        {
            "titulo": "El barrido",
            "enunciado": "Fija la posición a 0 y haz el barrido: arranca el motor A despacio; repite hasta que haya algo a menos de 30 centímetros; para el motor; guarda la posición en una variable; escríbela.",
            "pista": "El bucle no lleva trabajo dentro: solo vigila el sensor mientras la torreta gira.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar la posición relativa en…", 0, "A · 0"),
                b("A fijar velocidad al 75 %", 0, "A", "25"),
                b("A arrancar motor", 0, "A", "↻"),
                b("Repetir bucle hasta", 0, "¿Está más próximo a? E 30 cm"),
                b("Esperar X segundos", 1, "0.05"),
                b("A parar motor", 0, "A"),
                b("Fijar variable a", 0, "angulo · A posición"),
                b("escribir Hello", 0, "angulo"),
            ],
            "notas": "El robot acaba sabiendo en qué dirección está el objeto. Eso es un radar, aunque sea de juguete.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Qué es la posición de un motor?",
            "opciones": [
                "La velocidad a la que gira",
                "En qué punto está su eje, en grados",
                "Cuántas vueltas ha dado en total",
                "El puerto al que está conectado",
            ],
            "correcta": 1,
            "explicacion": "Es como la aguja de un reloj: dice dónde está, no cuánto ha girado ni a qué velocidad.",
        },
        {
            "pregunta": "Si mueves el eje con la mano, ¿cambia la posición?",
            "opciones": ["No", "Sí: el motor sabe dónde está su eje aunque no lo muevas tú", "Solo si el Hub está apagado", "Solo con el motor grande"],
            "correcta": 1,
            "explicacion": "El sensor de posición está dentro del motor y no depende de quién lo mueva.",
        },
        {
            "pregunta": "¿Qué hace «Fijar la posición relativa en 0»?",
            "opciones": [
                "Mueve el motor hasta la posición 0",
                "Decide que el punto donde está ahora se llame 0",
                "Para el motor",
                "Pone la velocidad a 0",
            ],
            "correcta": 1,
            "explicacion": "No mueve nada: marca el origen, igual que poner el giroscopio o el cronómetro a cero.",
        },
        {
            "pregunta": "Un brazo sube 90 y baja 90 muchas veces y acaba torcido. ¿Cómo se arregla?",
            "opciones": [
                "Subiendo la velocidad",
                "Mandándolo a una posición concreta en vez de contar hacia atrás",
                "Poniendo esperas entre los movimientos",
                "Cambiando de motor",
            ],
            "correcta": 1,
            "explicacion": "Cada movimiento arrastra un error pequeño que se acumula. Ir a una posición absoluta no acumula nada.",
        },
        {
            "pregunta": "¿Se puede guardar la posición en una variable?",
            "opciones": ["No", "Sí: es un número", "Solo si el motor está parado", "Solo dentro de un bucle"],
            "correcta": 1,
            "explicacion": "Como la presión o el cronómetro, es un bloque redondeado que vale un número.",
        },
        {
            "pregunta": "¿Para qué sirve guardar la posición donde el sensor detectó algo?",
            "opciones": [
                "Para no perder la batería",
                "Para saber en qué dirección estaba y poder volver a apuntar ahí",
                "Para que el motor vaya más rápido",
                "Para reiniciar el cronómetro",
            ],
            "correcta": 1,
            "explicacion": "El ángulo guardado es la dirección del objeto. Con eso el robot puede volver a apuntar cuando quiera.",
        },
        {
            "pregunta": "En el barrido, ¿por qué el motor va al 25 % y no al 100 %?",
            "opciones": [
                "Para que el sensor tenga tiempo de ver el objeto antes de pasarlo",
                "Porque el motor no puede ir más rápido",
                "Para gastar menos batería",
                "Da igual la velocidad",
            ],
            "correcta": 0,
            "explicacion": "El bucle comprueba el sensor cada poco. Si la torreta gira muy deprisa, pasa de largo entre dos comprobaciones.",
        },
        {
            "pregunta": "¿Qué diferencia hay entre «ir durante 90 grados» e «ir a la posición 90»?",
            "opciones": [
                "Ninguna",
                "El primero gira 90 desde donde esté; el segundo va al punto 90, esté donde esté",
                "El segundo es más rápido",
                "El primero solo vale para el motor A",
            ],
            "correcta": 1,
            "explicacion": "Uno es relativo a donde estás y el otro es un destino fijo. De ahí que el segundo no acumule error.",
        },
    ],
    "practicas": [
        {
            "titulo": "La torreta que apunta y vuelve",
            "enunciado": "Fija la posición del motor A a 0 y haz que apunte y vuelva: arráncalo al 25 %; repite hasta que haya algo a menos de 30 centímetros; para el motor; guarda la posición en la variable angulo; escríbela; espera dos segundos; vuelve a la posición 0.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar la posición relativa en…", 0, "A · 0"),
                b("A fijar velocidad al 75 %", 0, "A", "25"),
                b("A arrancar motor", 0, "A", "↻"),
                b("Repetir bucle hasta", 0, "¿Está más próximo a? E 30 cm"),
                b("Esperar X segundos", 1, "0.05"),
                b("A parar motor", 0, "A"),
                b("Fijar variable a", 0, "angulo · A posición"),
                b("escribir Hello", 0, "angulo"),
                b("Esperar X segundos", 0, "2"),
                b("Ir a la posición relativa del motor a velocidad", 0, "A · 0 · 25"),
            ],
            "notas": "La vuelta al cero es lo que se corrige: tiene que ser el bloque de ir a la posición, no un giro hacia atrás.",
        },
        {
            "titulo": "El brazo de dos ejes",
            "enunciado": "Fija a 0 la posición de los dos motores, sube el brazo con el motor B a la posición 45, gira la base con el motor A a la posición 90, espera un segundo y devuelve los dos a la posición 0.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar la posición relativa en…", 0, "A · 0"),
                b("Fijar la posición relativa en…", 0, "B · 0"),
                b("Ir a la posición relativa del motor a velocidad", 0, "B · 45 · 30"),
                b("Ir a la posición relativa del motor a velocidad", 0, "A · 90 · 30"),
                b("Esperar X segundos", 0, "1"),
                b("Ir a la posición relativa del motor a velocidad", 0, "B · 0 · 30"),
                b("Ir a la posición relativa del motor a velocidad", 0, "A · 0 · 30"),
            ],
            "notas": "Dos motores con su propio cero cada uno. Repetido diez veces seguidas, el brazo acaba exactamente donde empezó.",
        },
    ],
})


UNIDADES.append({
    "numero": 5,
    "enlace": "https://education.lego.com/en-us/lessons/spike-python-u4-doing-reps-with-loops/spike-python-u4l4-setting-conditions-for-yoga/",
    "video_de": 2,
    "evaluacion": 2,
    "nivel": 2,
    "titulo": "Dos condiciones a la vez: y, o, no",
    "hardware": "Hub (Matriz de luces 5x5 y altavoz) + 2 Motor mediano + Sensor de color + Sensor de distancia + Sensor de fuerza",
    "modelo": "Vehículo seguidor de línea con parachoques y sensor de distancia delante",
    "bloques": ["Operadores lógicos (y, o, no)", "A velocidad"],
    "reto": "Haz un robot que siga una línea pero que solo lo haga si tiene el camino libre y nadie ha pulsado el parachoques.",
    "video": {
        "titulo": "Y, o, no",
        "duracion": "5 min",
        "escenas": [
            {
                "plano": "Dos «Si... entonces» metidos uno dentro de otro, con mucha sangría.",
                "locucion": "Cuando hacen falta dos condiciones a la vez, lo primero que sale es meter un «Si» dentro de otro. Funciona, pero cada condición más es un escalón más de sangría y el programa se va a la derecha.",
            },
            {
                "plano": "El bloque «y» con dos huecos de rombo, uno a cada lado.",
                "locucion": "El bloque «y» junta dos preguntas en una sola. Solo vale verdad cuando las dos lo son. Camino libre Y parachoques suelto: avanza.",
            },
            {
                "plano": "El bloque «o», con una de las dos preguntas en verdad y el resultado en verde.",
                "locucion": "El «o» vale verdad con que una cualquiera lo sea. Pared delante O parachoques pulsado: para. Con una basta.",
            },
            {
                "plano": "El bloque «no» dándole la vuelta a una pregunta.",
                "locucion": "Y el «no» le da la vuelta a una pregunta: convierte el sí en no. «No está presionado» es exactamente «está suelto».",
            },
            {
                "plano": "Un seguidor de línea avanzando y corrigiendo, con la luz reflejada en la pantalla.",
                "locucion": "Y la aplicación de siempre: seguir una línea. El robot mira la luz reflejada en el borde entre el negro y el blanco y corrige hacia un lado o hacia el otro.",
            },
            {
                "plano": "El robot parándose en seco cuando aparece una pared en mitad de la línea.",
                "locucion": "Con los operadores, además, el seguidor puede tener cabeza: sigue la línea solo mientras el camino esté libre.",
            },
        ],
    },
    "explicaciones": {
        "Operadores lógicos (y, o, no)": "Juntan preguntas. «Y» pide que las dos sean verdad; «o» se conforma con una; «no» le da la vuelta a la que lleva dentro.",
        "A velocidad": "Un número: a qué velocidad va girando ese motor ahora mismo. Sirve para comprobar si el robot se ha quedado atascado.",
    },
    "programa": {
        "titulo": "El seguidor con cabeza",
        "explicacion": "Dentro del bucle hay una sola pregunta, pero compuesta: avanza siguiendo la línea solo mientras el camino esté libre y nadie haya tocado el parachoques.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("fijar A+B como motores en movimiento", 0, "A+B"),
            b("fijar velocidad de movimiento al 50 %", 0, "30"),
            b("Bucle infinito"),
            b("Si... entonces... Si no...", 1, "no ¿Está más próximo a? E 15 cm y no ¿Está presionado? F"),
            b("Si... entonces... Si no...", 2, "Luz reflejada D < 40"),
            b("empezar a mover derecha: 30", 3, "derecha: 30"),
            b("empezar a mover derecha: 30", 3, "derecha: -30"),
            b("parar movimiento", 2),
        ],
    },
    "construccion": {
        "piezas": "La base de conducción, el sensor de color, el sensor de distancia, el sensor de fuerza, una viga angular, dos vigas de 7, una viga de 11 y ocho pasadores.",
        "pasos": [
            {
                "titulo": "El sensor de color abajo",
                "texto": "Monta la viga angular bajo el chasis, por delante de las ruedas, y fija el sensor de color mirando al suelo a un dedo de altura. Más alto no distingue el negro del blanco.",
            },
            {
                "titulo": "El sensor de distancia delante",
                "texto": "Con las dos vigas de 7, sujeta el sensor de distancia al frente, a la altura de un obstáculo normal.",
            },
            {
                "titulo": "El parachoques",
                "texto": "Pon la viga de 11 cruzada delante del todo, suelta por un extremo, apoyada contra el sensor de fuerza. Al chocar, lo aprieta.",
            },
            {
                "titulo": "La pista",
                "texto": "Pega una línea de cinta aislante negra sobre una cartulina blanca. Ancha, de dos dedos: las líneas finas se pierden.",
            },
            {
                "titulo": "Calibrar a ojo",
                "texto": "Con el robot parado, pon el sensor sobre el negro y luego sobre el blanco, y apunta los dos números de luz reflejada. El umbral va a medio camino.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Las dos a la vez",
            "enunciado": "En un bucle infinito, comprueba las dos cosas a la vez: si no hay nada a menos de 15 centímetros y el sensor de fuerza está suelto, pon el botón en verde; si no, ponlo en rojo.",
            "pista": "Las dos preguntas se juntan con el bloque «y», y cada una va con un «no» delante.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Bucle infinito"),
                b("Si... entonces... Si no...", 1, "no ¿Está más próximo a? E 15 cm y no ¿Está presionado? F"),
                b("poner luz del botón central en rojo", 2, "verde"),
                b("poner luz del botón central en rojo", 2, "rojo"),
            ],
            "notas": "Tapando el sensor o apretando el parachoques se ve que basta cualquiera de los dos para que se ponga rojo.",
        },
        {
            "titulo": "Con una basta",
            "enunciado": "En un bucle infinito, comprueba dos cosas a la vez: si hay algo a menos de 15 centímetros o el sensor de fuerza está pulsado, toca una nota.",
            "pista": "Aquí el bloque es «o»: con que una de las dos sea verdad, suena.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Bucle infinito"),
                b("Si... entonces...", 1, "¿Está más próximo a? E 15 cm o ¿Está presionado? F"),
                b("Tocar nota X segundos", 2, "72 · 0.3"),
            ],
            "notas": "Comparado con el ejercicio anterior se ve la diferencia entre «y» y «o» sin explicarla.",
        },
        {
            "titulo": "Leer la línea",
            "enunciado": "Pon un bucle infinito que escriba en la pantalla la luz reflejada del sensor de color. Pasa el robot del negro al blanco y apunta los dos números.",
            "pista": "Hay que apuntar los dos valores: el umbral de los ejercicios siguientes sale de ahí.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Bucle infinito"),
                b("escribir Hello", 1, "Luz reflejada D"),
            ],
            "notas": "Calibrar antes de programar. Los valores cambian con la luz del aula, así que conviene repetirlo cada día.",
        },
        {
            "titulo": "El seguidor sencillo",
            "enunciado": "En un bucle infinito, decide hacia dónde torcer: si la luz reflejada es menor que 40, tuerce hacia un lado; si no, tuerce hacia el otro.",
            "pista": "El robot no va recto nunca: va haciendo eses sobre el borde de la línea. Eso es normal.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar velocidad de movimiento al 50 %", 0, "30"),
                b("Bucle infinito"),
                b("Si... entonces... Si no...", 1, "Luz reflejada D < 40"),
                b("empezar a mover derecha: 30", 2, "derecha: 30"),
                b("empezar a mover derecha: 30", 2, "derecha: -30"),
            ],
            "notas": "El seguidor de dos estados es feo y funciona. Conviene decir que hay formas mejores y que se ven en 3º.",
        },
    ],
    "test": [
        {
            "pregunta": "El bloque «y», ¿cuándo vale verdad?",
            "opciones": [
                "Cuando una de las dos preguntas es verdad",
                "Cuando las dos preguntas son verdad",
                "Cuando ninguna es verdad",
                "Siempre",
            ],
            "correcta": 1,
            "explicacion": "Las dos. Si falla una, el conjunto es mentira.",
        },
        {
            "pregunta": "¿Y el bloque «o»?",
            "opciones": [
                "Cuando las dos son verdad",
                "Cuando al menos una es verdad",
                "Cuando las dos son mentira",
                "Nunca",
            ],
            "correcta": 1,
            "explicacion": "Con una basta. También vale si las dos lo son.",
        },
        {
            "pregunta": "«no ¿Está presionado?» significa:",
            "opciones": ["Que el sensor está roto", "Que el sensor está suelto", "Que el sensor no está conectado", "Que hay que apretar más"],
            "correcta": 1,
            "explicacion": "El «no» da la vuelta a la respuesta: donde había sí, pone no.",
        },
        {
            "pregunta": "¿Qué ventaja tiene «y» frente a meter un «Si» dentro de otro?",
            "opciones": [
                "Va más rápido",
                "Se lee mejor y no añade escalones de sangría",
                "Permite usar más sensores",
                "Ninguna, es solo otra forma",
            ],
            "correcta": 1,
            "explicacion": "Hacen lo mismo, pero con tres o cuatro condiciones anidadas el programa se vuelve ilegible.",
        },
        {
            "pregunta": "¿Por qué hay que calibrar el sensor de color antes de seguir una línea?",
            "opciones": [
                "Porque los valores de negro y blanco cambian con la luz del aula",
                "Porque el sensor se estropea si no",
                "Porque si no, no detecta colores",
                "No hace falta calibrar",
            ],
            "correcta": 0,
            "explicacion": "Un umbral que funciona por la mañana junto a la ventana puede fallar por la tarde.",
        },
        {
            "pregunta": "Un seguidor de línea de dos estados, ¿va recto?",
            "opciones": [
                "Sí, perfectamente recto",
                "No: va haciendo eses sobre el borde de la línea",
                "Solo si la línea es ancha",
                "Solo con el giroscopio",
            ],
            "correcta": 1,
            "explicacion": "Solo puede torcer a un lado o al otro, así que corrige de más y zigzaguea. Es normal y se ve en 3º cómo suavizarlo.",
        },
        {
            "pregunta": "¿Dónde pondrías el umbral si el negro da 12 y el blanco 78?",
            "opciones": ["En 12", "En 78", "Más o menos a medio camino, cerca de 45", "En 100"],
            "correcta": 2,
            "explicacion": "A medio camino es donde mejor separa los dos, y deja margen para las sombras.",
        },
        {
            "pregunta": "¿Para qué sirve el bloque «A velocidad»?",
            "opciones": [
                "Para fijar la velocidad del motor",
                "Para leer a qué velocidad va girando ahora mismo",
                "Para acelerar el robot",
                "Para medir la velocidad del robot en centímetros por segundo",
            ],
            "correcta": 1,
            "explicacion": "Es una lectura, no una orden. Si vale casi cero con el motor encendido, el robot está atascado.",
        },
    ],
    "practicas": [
        {
            "titulo": "El seguidor con cabeza",
            "enunciado": "En un bucle infinito, comprueba si el camino está libre y el parachoques suelto: si es así, sigue la línea torciendo a un lado o a otro según la luz reflejada; si no, para el movimiento.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar velocidad de movimiento al 50 %", 0, "30"),
                b("Bucle infinito"),
                b("Si... entonces... Si no...", 1, "no ¿Está más próximo a? E 15 cm y no ¿Está presionado? F"),
                b("Si... entonces... Si no...", 2, "Luz reflejada D < 40"),
                b("empezar a mover derecha: 30", 3, "derecha: 30"),
                b("empezar a mover derecha: 30", 3, "derecha: -30"),
                b("parar movimiento", 2),
            ],
            "notas": "Un «Si» dentro de otro, pero cada uno con su motivo: el de fuera decide si moverse y el de dentro hacia dónde.",
        },
        {
            "titulo": "La alarma doble",
            "enunciado": "Pon los avisos a 0 y, dentro de un bucle infinito, haz esto: espera a que haya algo a menos de 15 centímetros o el parachoques esté pulsado; sube los avisos uno; escríbelos; toca una nota; espera a que el camino vuelva a estar libre y el parachoques suelto.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar variable a", 0, "avisos · 0"),
                b("Bucle infinito"),
                b("Si... entonces...", 1, "¿Está más próximo a? E 15 cm o ¿Está presionado? F"),
                b("Cambiar variable por", 2, "avisos · 1"),
                b("escribir Hello", 2, "avisos"),
                b("Tocar nota X segundos", 2, "72 · 0.3"),
                b("Esperar hasta que", 2, "no ¿Está más próximo a? E 15 cm y no ¿Está presionado? F"),
            ],
            "notas": "Junta las dos cosas del curso: un contador en una variable y una condición compuesta. La espera del final evita contar en ráfaga.",
        },
    ],
})


UNIDADES.append({
    "numero": 6,
    "enlace": "https://education.lego.com/en-us/lessons/get-moving-with-motors/making-moves-with-motors/",
    "video_de": 1,
    "evaluacion": 2,
    "nivel": 2,
    "titulo": "Arrancar suave: aceleración, velocidad y azar",
    "hardware": "Hub (Giroscopio, matriz de luces 5x5 y altavoz) + 2 Motor mediano + Sensor de color + Sensor de fuerza",
    "modelo": "Robot repartidor: base de conducción con una caja de carga y el sensor de color mirando al suelo",
    "bloques": [
        "Fijar aceleración del motor",
        "Empezar a mover a velocidad...",
        "Elegir un número aleatorio",
    ],
    "reto": "Haz un repartidor que salga y frene sin tirar la carga, y que decida al azar a qué destino va.",
    "video": {
        "titulo": "Lo que pasa al arrancar",
        "duracion": "4 min",
        "escenas": [
            {
                "plano": "Un robot con una torre de piezas encima arranca de golpe y la torre se cae hacia atrás.",
                "locucion": "Un robot que arranca de golpe tira lo que lleva encima. No es un fallo del programa: es que pasa de 0 a 50 en un instante.",
            },
            {
                "plano": "El bloque de fijar la aceleración, con el mismo robot arrancando poco a poco sin tirar nada.",
                "locucion": "La aceleración es cuánto tarda en coger la velocidad que le pides. Subida, arranca despacio y frena despacio, y la carga no se mueve.",
            },
            {
                "plano": "Dos ruedas girando a velocidades distintas; el robot describe una curva suave.",
                "locucion": "Y hay otra forma de mover la base: darle una velocidad a cada rueda. Si las dos van igual, va recto; si una va más deprisa, describe una curva.",
            },
            {
                "plano": "El bloque de número aleatorio sacando 1, 3, 2, 1...",
                "locucion": "Por último, el azar. El bloque de número aleatorio saca un número cualquiera entre dos que tú le digas. Sirve para que el robot no haga siempre lo mismo.",
            },
            {
                "plano": "El repartidor eligiendo destino al azar y saliendo suave hacia él.",
                "locucion": "Un reparto distinto en cada tirada, y una salida que no tira la carga. Eso es esta unidad.",
            },
        ],
    },
    "explicaciones": {
        "Fijar aceleración del motor": "Cuánto tarda el motor en coger la velocidad que le pides. Más alta, arranque y frenada suaves; más baja, de golpe.",
        "Empezar a mover a velocidad...": "Arranca la base dándole una velocidad a cada rueda. Iguales va recto; distintas, en curva. Y deja seguir el programa.",
        "Elegir un número aleatorio": "Saca un número al azar entre los dos que le digas, los dos incluidos. Cada vez sale uno distinto.",
    },
    "programa": {
        "titulo": "El repartidor",
        "explicacion": "Se elige el destino al azar, se arranca suave para no tirar la carga y se avanza una distancia distinta según el número que haya salido.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("fijar A+B como motores en movimiento", 0, "A+B"),
            b("fijar 1 rotación del motor en 17.5 cm recorridos", 0, "17.5", "cm"),
            b("Fijar aceleración del motor", 0, "A+B · suave"),
            b("Fijar variable a", 0, "destino · Elegir un número aleatorio 1 a 3"),
            b("escribir Hello", 0, "destino"),
            b("Fijar variable a", 0, "camino · destino × 20"),
            b("mover ↑ durante 10 rotaciones", 0, "↑", "camino", "cm"),
            b("Tocar nota X segundos", 0, "67 · 0.4"),
        ],
    },
    "construccion": {
        "piezas": "La base de conducción, el sensor de color, el sensor de fuerza, dos marcos Technic, cuatro vigas de 11, dos vigas de 15, un panel y catorce pasadores.",
        "pasos": [
            {
                "titulo": "La caja de carga",
                "texto": "Monta un rectángulo con las dos vigas de 15 y dos de 11, y ponlo encima del chasis por detrás del Hub.",
            },
            {
                "titulo": "El suelo de la caja",
                "texto": "Fija el panel dentro del rectángulo. Ahí es donde va la carga que no se tiene que caer.",
            },
            {
                "titulo": "El refuerzo",
                "texto": "Une la caja al chasis con los dos marcos Technic y cuatro pasadores por cada lado. Si la caja baila, la carga se cae aunque arranque suave.",
            },
            {
                "titulo": "El sensor de color",
                "texto": "Deja el sensor de color mirando al suelo por delante, en el puerto D, para reconocer las marcas de los destinos.",
            },
            {
                "titulo": "El botón de tirar el dado",
                "texto": "Pon el sensor de fuerza en el puerto F, al alcance de la mano y bien sujeto. Es el botón con el que se tira el dado, y si se mueve al apretarlo, cuenta pulsaciones de más.",
            },
            {
                "titulo": "La carga de prueba",
                "texto": "Haz una torre de cuatro o cinco piezas sueltas dentro de la caja. Si aguanta de pie el arranque y la frenada, la aceleración está bien puesta.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Arranque de golpe",
            "enunciado": "Pon la aceleración en el valor más bajo. Avanza 40 centímetros y para, con la torre de piezas puesta en la caja.",
            "pista": "Este ejercicio está hecho para que la carga se caiga: es la comparación del siguiente.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar 1 rotación del motor en 17.5 cm recorridos", 0, "17.5", "cm"),
                b("Fijar aceleración del motor", 0, "A+B · de golpe"),
                b("fijar velocidad de movimiento al 50 %", 0, "70"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "40", "cm"),
            ],
            "notas": "Que se caiga es el resultado esperado. Conviene avisar o lo vivirán como un fallo suyo.",
        },
        {
            "titulo": "Arranque suave",
            "enunciado": "Repite el recorrido de 40 centímetros con la aceleración suave. Compara si la carga aguanta mejor que antes.",
            "pista": "Solo cambia un bloque respecto al ejercicio anterior.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar 1 rotación del motor en 17.5 cm recorridos", 0, "17.5", "cm"),
                b("Fijar aceleración del motor", 0, "A+B · suave"),
                b("fijar velocidad de movimiento al 50 %", 0, "70"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "40", "cm"),
            ],
            "notas": "Un bloque de diferencia y un resultado distinto. Es el mejor ejercicio de la unidad para enseñar que programar es decidir detalles.",
        },
        {
            "titulo": "La curva",
            "enunciado": "Arranca la base dando 40 a una rueda y 20 a la otra. Déjalo tres segundos y para.",
            "pista": "Con velocidades distintas en cada rueda el robot describe una curva en lugar de girar sobre el sitio.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("Empezar a mover a velocidad...", 0, "A 40 · B 20"),
                b("Esperar X segundos", 0, "3"),
                b("parar movimiento", 0),
            ],
            "notas": "Cambiando los dos números sale una curva más o menos cerrada. Vale la pena dejarles probar.",
        },
        {
            "titulo": "El dado",
            "enunciado": "En un bucle infinito, haz un dado: espera a que se apriete el sensor de fuerza; saca un número al azar del 1 al 6; escríbelo; espera a que se suelte.",
            "pista": "El bloque de azar se guarda en una variable para poder escribirlo y usarlo después.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Bucle infinito"),
                b("Esperar hasta que", 1, "¿Está presionado? F"),
                b("Fijar variable a", 1, "dado · Elegir un número aleatorio 1 a 6"),
                b("escribir Hello", 1, "dado"),
                b("Esperar hasta que", 1, "no ¿Está presionado? F"),
            ],
            "notas": "Si no se guarda en una variable y se pide el azar dos veces, salen dos números distintos. Es un fallo muy típico.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Qué es la aceleración de un motor?",
            "opciones": [
                "La velocidad máxima que alcanza",
                "Cuánto tarda en coger la velocidad que le pides",
                "Las vueltas que da por segundo",
                "La fuerza que hace",
            ],
            "correcta": 1,
            "explicacion": "No cambia a dónde llega, cambia cómo llega: de golpe o poco a poco.",
        },
        {
            "pregunta": "La carga se cae al arrancar. ¿Qué cambias?",
            "opciones": [
                "La velocidad a 100",
                "La aceleración, para que arranque más suave",
                "El sensor de color",
                "La vuelta de rueda",
            ],
            "correcta": 1,
            "explicacion": "El problema no es ir rápido, es llegar a rápido de golpe.",
        },
        {
            "pregunta": "Con «Empezar a mover a velocidad», ¿qué hace el robot si le das 40 y 20?",
            "opciones": ["Va recto a 30", "Gira sobre sí mismo", "Describe una curva", "Se para"],
            "correcta": 2,
            "explicacion": "Una rueda corre más que la otra, así que traza una curva hacia el lado lento.",
        },
        {
            "pregunta": "¿Y si le das 40 y −40?",
            "opciones": ["Va recto", "Gira sobre el sitio", "Describe una curva muy abierta", "Va hacia atrás"],
            "correcta": 1,
            "explicacion": "Una rueda hacia delante y la otra hacia atrás: el robot pivota sin desplazarse.",
        },
        {
            "pregunta": "«Elegir un número aleatorio entre 1 y 6», ¿puede dar 6?",
            "opciones": ["No, llega hasta 5", "Sí: los dos extremos entran", "Solo si lo pides dos veces", "Solo da números pares"],
            "correcta": 1,
            "explicacion": "Los dos números que le das están incluidos.",
        },
        {
            "pregunta": "Pides el número aleatorio dos veces en el mismo programa. ¿Sale el mismo?",
            "opciones": [
                "Sí, el azar se queda fijo",
                "No: cada vez que lo pides saca uno nuevo",
                "Solo si está dentro de un bucle",
                "Depende del sensor",
            ],
            "correcta": 1,
            "explicacion": "Por eso se guarda en una variable: para usar el mismo número varias veces.",
        },
        {
            "pregunta": "¿Para qué sirve guardar el azar en una variable?",
            "opciones": [
                "Para que el programa vaya más rápido",
                "Para usar el mismo número en varios sitios sin que cambie",
                "Para que el Hub lo recuerde al apagarse",
                "No sirve de nada",
            ],
            "correcta": 1,
            "explicacion": "Escribirlo en pantalla y luego decidir con él solo funciona si es el mismo número en los dos sitios.",
        },
        {
            "pregunta": "Quieres que el robot avance 20, 40 o 60 centímetros según un número del 1 al 3. ¿Cómo lo haces sin tres «Si»?",
            "opciones": [
                "Multiplicando el número por 20 y usando el resultado como distancia",
                "No se puede sin tres «Si»",
                "Con tres bucles",
                "Con el cronómetro",
            ],
            "correcta": 0,
            "explicacion": "Una cuenta en lugar de tres ramas. Es más corto y más fácil de cambiar.",
        },
    ],
    "practicas": [
        {
            "titulo": "El repartidor al azar",
            "enunciado": "Prepara la base con la vuelta de rueda y la aceleración suave. Después reparte al azar: saca un destino al azar del 1 al 3; escríbelo; calcula el camino multiplicando el destino por 20; avanza esos centímetros; toca una nota al llegar.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar 1 rotación del motor en 17.5 cm recorridos", 0, "17.5", "cm"),
                b("Fijar aceleración del motor", 0, "A+B · suave"),
                b("Fijar variable a", 0, "destino · Elegir un número aleatorio 1 a 3"),
                b("escribir Hello", 0, "destino"),
                b("Fijar variable a", 0, "camino · destino × 20"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "camino", "cm"),
                b("Tocar nota X segundos", 0, "67 · 0.4"),
            ],
            "notas": "Lo que se corrige es que el azar se guarde una sola vez y que la distancia salga de la cuenta, no de tres ramas.",
        },
        {
            "titulo": "La ruta de tres paradas",
            "enunciado": "Con la aceleración suave, repite tres veces: avanza 25 centímetros; espera un segundo; toca una nota; sube en uno la variable paradas. Escribe al final las paradas hechas.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar 1 rotación del motor en 17.5 cm recorridos", 0, "17.5", "cm"),
                b("Fijar aceleración del motor", 0, "A+B · suave"),
                b("Fijar variable a", 0, "paradas · 0"),
                b("Repetir bucle", 0, "3"),
                b("mover ↑ durante 10 rotaciones", 1, "↑", "25", "cm"),
                b("Esperar X segundos", 1, "1"),
                b("Tocar nota X segundos", 1, "60 · 0.3"),
                b("Cambiar variable por", 1, "paradas · 1"),
                b("escribir Hello", 0, "paradas"),
            ],
            "notas": "El contador dentro del bucle y la escritura fuera. Si la escritura entra en el bucle, no está mal, pero cuenta en voz alta tres veces.",
        },
    ],
})


# ───────────────────────────────────────────────────────────────────────────
# 3ª EVALUACIÓN · Listas, bloques propios y un proyecto con datos
# ───────────────────────────────────────────────────────────────────────────

UNIDADES.append({
    "numero": 7,
    "enlace": "https://education.lego.com/en-us/lessons/spike-python-u10-lists/spike-u10l1-listing-letters/",
    "video_de": 9,
    "evaluacion": 3,
    "nivel": 3,
    "titulo": "Listas: guardar una serie entera",
    "hardware": "Hub (Matriz de luces 5x5 y altavoz) + 2 Motor mediano + Sensor de color + Sensor de distancia",
    "modelo": "Lector de secuencias: una rampa con el sensor de color y una compuerta con el motor",
    "bloques": [
        "Lista",
        "Añadir elemento a lista",
        "Elemento de lista",
        "Longitud de lista",
        "¿La lista contiene...?",
    ],
    "reto": "Monta un lector que se aprenda una secuencia de tarjetas de colores y después la repita.",
    "video": {
        "titulo": "Cuando una caja no basta",
        "duracion": "5 min",
        "escenas": [
            {
                "plano": "Tres variables sueltas: color1, color2, color3, cada una con su valor.",
                "locucion": "Para guardar tres colores puedes hacer tres variables. Para guardar diez, diez. Y para guardar los que vengan, no puedes: no sabes cuántos van a ser.",
            },
            {
                "plano": "Una fila de casillas numeradas, con un color escrito en cada una.",
                "locucion": "Una lista es una fila de casillas con un solo nombre. Las casillas se numeran desde el 1, y en cada una cabe un valor.",
            },
            {
                "plano": "El bloque de añadir, metiendo un color al final de la fila, que se alarga sola.",
                "locucion": "«Añadir» mete un valor al final y la lista crece. No hay que decir cuántas casillas quieres: se alarga según hace falta.",
            },
            {
                "plano": "El bloque «elemento 2 de la lista» sacando el valor de la segunda casilla.",
                "locucion": "Para sacar uno, le pides el número de casilla. El elemento 1 es el primero que metiste, no el último.",
            },
            {
                "plano": "El bloque de longitud, marcando 4 sobre una lista de cuatro casillas.",
                "locucion": "Y la longitud te dice cuántas hay. Con eso puedes recorrerla entera con un bucle sin saber de antemano cuántas tiene.",
            },
            {
                "plano": "El robot leyendo cuatro tarjetas y luego repitiendo la secuencia con sonidos.",
                "locucion": "Guardar primero y actuar después. Eso es lo que una variable sola no puede hacer.",
            },
        ],
    },
    "explicaciones": {
        "Lista": "Una fila de casillas con un solo nombre. Cada casilla guarda un valor y se numeran desde el 1.",
        "Añadir elemento a lista": "Mete un valor al final de la lista, que crece sola. No hay que decir cuántas casillas hacen falta.",
        "Elemento de lista": "Saca el valor de la casilla que le pidas. El 1 es el primero que se metió.",
        "Longitud de lista": "Cuántas casillas tiene ahora mismo. Sirve para recorrer la lista entera sin saber su tamaño.",
        "¿La lista contiene...?": "Pregunta de rombo: vale verdad si el valor que buscas está en alguna casilla.",
    },
    "programa": {
        "titulo": "El lector de secuencias",
        "explicacion": "Primero se guardan cuatro colores en una lista, uno por tarjeta. Después se recorre la lista con un bucle y se repite la secuencia.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("Repetir bucle", 0, "4"),
            b("Esperar hasta que", 1, "¿Está más próximo a? E 5 cm"),
            b("Añadir elemento a lista", 1, "colores · Luz reflejada D"),
            b("Tocar nota X segundos", 1, "60 · 0.2"),
            b("Esperar hasta que", 1, "no ¿Está más próximo a? E 5 cm"),
            b("Fijar variable a", 0, "paso · 1"),
            b("Repetir bucle hasta", 0, "paso > Longitud de lista colores"),
            b("escribir Hello", 1, "Elemento paso de colores"),
            b("Cambiar variable por", 1, "paso · 1"),
        ],
    },
    "construccion": {
        "piezas": "El Hub, dos motores medianos, el sensor de color, el sensor de distancia, dos vigas de 15, cuatro vigas de 11, dos vigas angulares, un eje de 5, un panel y doce pasadores.",
        "pasos": [
            {
                "titulo": "La rampa",
                "texto": "Monta las dos vigas de 15 en paralelo e inclinadas, apoyadas en dos vigas de 11. Las tarjetas se deslizan por ahí.",
            },
            {
                "titulo": "El punto de lectura",
                "texto": "A mitad de la rampa, coloca el sensor de color mirando a la superficie y el de distancia apuntando al carril, para saber cuándo pasa una tarjeta.",
            },
            {
                "titulo": "La compuerta",
                "texto": "Al final de la rampa, pon el primer motor con el eje de 5 y el panel: retiene las tarjetas entre lectura y lectura.",
            },
            {
                "titulo": "El bandejín",
                "texto": "Con las vigas angulares y las dos vigas de 11 que quedan, haz una bandeja debajo de la compuerta para que las tarjetas leídas no se caigan al suelo.",
            },
            {
                "titulo": "Las tarjetas",
                "texto": "Prepara cuatro tarjetas de colores distintos. Pásalas una a una por el punto de lectura y apunta qué número de luz reflejada da cada una.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Tres en la lista",
            "enunciado": "Añade tres números a una lista llamada datos y escribe cuántos hay.",
            "pista": "La longitud es un número redondeado y se mete en el hueco del bloque de escribir.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Añadir elemento a lista", 0, "datos · 10"),
                b("Añadir elemento a lista", 0, "datos · 20"),
                b("Añadir elemento a lista", 0, "datos · 30"),
                b("escribir Hello", 0, "Longitud de lista datos"),
            ],
            "notas": "Tres añadidos y una longitud: lo mínimo para ver que la lista crece sola.",
        },
        {
            "titulo": "Sacar uno",
            "enunciado": "Escribe en la pantalla el elemento 2 de la lista anterior. Escribe después el elemento 3.",
            "pista": "Las casillas se cuentan desde el 1, no desde el 0.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Añadir elemento a lista", 0, "datos · 10"),
                b("Añadir elemento a lista", 0, "datos · 20"),
                b("Añadir elemento a lista", 0, "datos · 30"),
                b("escribir Hello", 0, "Elemento 2 de datos"),
                b("escribir Hello", 0, "Elemento 3 de datos"),
            ],
            "notas": "Empezar en 1 y no en 0 hay que decirlo: en otros lenguajes es al revés y lo van a ver más adelante.",
        },
        {
            "titulo": "Recorrer la lista",
            "enunciado": "Con la lista de tres números, recórrela con una variable: pon la variable paso a 1; repite hasta que paso pase de la longitud de la lista; escribe en cada vuelta el elemento que toca; sube paso en uno.",
            "pista": "La variable paso es el número de casilla que se está leyendo.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Añadir elemento a lista", 0, "datos · 10"),
                b("Añadir elemento a lista", 0, "datos · 20"),
                b("Añadir elemento a lista", 0, "datos · 30"),
                b("Fijar variable a", 0, "paso · 1"),
                b("Repetir bucle hasta", 0, "paso > Longitud de lista datos"),
                b("escribir Hello", 1, "Elemento paso de datos"),
                b("Cambiar variable por", 1, "paso · 1"),
                b("Esperar X segundos", 1, "0.5"),
            ],
            "notas": "El recorrido con variable contador es el patrón que se repite en todas las listas. Si olvidan subir paso, el bucle no acaba.",
        },
        {
            "titulo": "¿Está en la lista?",
            "enunciado": "Con la lista de tres números, comprueba si contiene el 20: si lo contiene, pon el botón en verde; si no, ponlo en rojo.",
            "pista": "El bloque de contiene es una pregunta de rombo y va en el hueco del «Si».",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Añadir elemento a lista", 0, "datos · 10"),
                b("Añadir elemento a lista", 0, "datos · 20"),
                b("Añadir elemento a lista", 0, "datos · 30"),
                b("Si... entonces... Si no...", 0, "¿datos contiene 20?"),
                b("poner luz del botón central en rojo", 1, "verde"),
                b("poner luz del botón central en rojo", 1, "rojo"),
            ],
            "notas": "Buscar sin recorrer a mano. Cambiando el 20 por un 25 se ve que la respuesta cambia.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Qué es una lista?",
            "opciones": [
                "Una variable que guarda texto",
                "Una fila de casillas con un solo nombre, numeradas desde el 1",
                "Un bucle especial",
                "Un sensor del Hub",
            ],
            "correcta": 1,
            "explicacion": "Una sola etiqueta y muchas casillas. Por eso sirve para guardar series.",
        },
        {
            "pregunta": "¿Desde qué número se cuentan las casillas de una lista en SPIKE?",
            "opciones": ["Desde el 0", "Desde el 1", "Desde el −1", "Desde el número que tú elijas"],
            "correcta": 1,
            "explicacion": "El elemento 1 es el primero que metiste. En otros lenguajes se empieza en 0, pero aquí no.",
        },
        {
            "pregunta": "¿Qué hace «Añadir elemento a lista»?",
            "opciones": [
                "Sustituye la casilla 1",
                "Mete el valor al final y la lista crece",
                "Borra la lista y mete ese valor",
                "Suma el valor a todas las casillas",
            ],
            "correcta": 1,
            "explicacion": "Se pone detrás del último. No hay que reservar sitio de antemano.",
        },
        {
            "pregunta": "¿Para qué sirve «Longitud de lista»?",
            "opciones": [
                "Para saber cuántas casillas tiene",
                "Para medir cuánto ocupa en memoria",
                "Para borrar la lista",
                "Para ordenarla",
            ],
            "correcta": 0,
            "explicacion": "Con eso puedes recorrerla entera sin saber de antemano cuántos elementos tendrá.",
        },
        {
            "pregunta": "En un recorrido con la variable paso, ¿qué pasa si olvidas subirla?",
            "opciones": [
                "El bucle da una vuelta y sale",
                "El bucle no termina nunca y lee siempre la misma casilla",
                "Da error",
                "Salta a la última casilla",
            ],
            "correcta": 1,
            "explicacion": "La condición de salida nunca se cumple, porque paso se queda clavado.",
        },
        {
            "pregunta": "¿Por qué no basta con tres variables para guardar una secuencia de tarjetas?",
            "opciones": [
                "Porque las variables no guardan colores",
                "Porque no sabes cuántas tarjetas van a pasar",
                "Porque tres variables ocupan mucho",
                "Sí basta: es lo mismo",
            ],
            "correcta": 1,
            "explicacion": "Si pueden ser tres o quince, con variables sueltas tendrías que escribirlas todas por si acaso.",
        },
        {
            "pregunta": "«¿La lista contiene 20?», ¿qué tipo de bloque es?",
            "opciones": ["Un número redondeado", "Una pregunta de rombo", "Un bloque de pila", "Un sombrero"],
            "correcta": 1,
            "explicacion": "Vale verdad o mentira, así que es de rombo y va en los huecos de pregunta.",
        },
        {
            "pregunta": "Quieres leer cuatro tarjetas y luego repetir la secuencia. ¿Qué orden sigues?",
            "opciones": [
                "Leer y actuar a la vez, tarjeta a tarjeta",
                "Guardar las cuatro en una lista y después recorrerla",
                "Guardar solo la última",
                "No se puede hacer",
            ],
            "correcta": 1,
            "explicacion": "Guardar primero y actuar después es justo lo que permite una lista y no permite una variable sola.",
        },
    ],
    "practicas": [
        {
            "titulo": "El lector de secuencias",
            "enunciado": "Repite cuatro veces: espera a que pase una tarjeta a menos de 5 centímetros; añade su luz reflejada a la lista colores, toca una nota y espera a que la tarjeta salga. Después recorre la lista escribiendo cada elemento.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Repetir bucle", 0, "4"),
                b("Esperar hasta que", 1, "¿Está más próximo a? E 5 cm"),
                b("Añadir elemento a lista", 1, "colores · Luz reflejada D"),
                b("Tocar nota X segundos", 1, "60 · 0.2"),
                b("Esperar hasta que", 1, "no ¿Está más próximo a? E 5 cm"),
                b("Fijar variable a", 0, "paso · 1"),
                b("Repetir bucle hasta", 0, "paso > Longitud de lista colores"),
                b("escribir Hello", 1, "Elemento paso de colores"),
                b("Cambiar variable por", 1, "paso · 1"),
            ],
            "notas": "Dos bucles seguidos: uno que llena y otro que recorre. Es el programa más largo de la evaluación y el que mejor enseña para qué sirve una lista.",
        },
        {
            "titulo": "La clave de acceso",
            "enunciado": "Lee tres tarjetas guardando su luz reflejada en una lista y después comprueba si la lista contiene un valor oscuro, menor que 20: si lo contiene, escribe ERROR y pon el botón en rojo; si no, escribe PASA, ponlo en verde y abre la compuerta con el motor A 90 grados.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Repetir bucle", 0, "3"),
                b("Esperar hasta que", 1, "¿Está más próximo a? E 5 cm"),
                b("Añadir elemento a lista", 1, "clave · Luz reflejada D"),
                b("Esperar hasta que", 1, "no ¿Está más próximo a? E 5 cm"),
                b("Si... entonces... Si no...", 0, "¿clave contiene un valor < 20?"),
                b("escribir Hello", 1, "ERROR"),
                b("poner luz del botón central en rojo", 1, "rojo"),
                b("escribir Hello", 1, "PASA"),
                b("poner luz del botón central en rojo", 1, "verde"),
                b("A ir durante 1 rotaciones", 1, "A", "↻", "90", "grados"),
            ],
            "notas": "La rama del «si no» lleva tres bloques y la del «si», dos. Es donde más se equivocan al encajar.",
        },
    ],
})


UNIDADES.append({
    "numero": 8,
    "enlace": "https://education.lego.com/en-us/lessons/prime-competition-ready/my-code-our-program/",
    "evaluacion": 3,
    "nivel": 3,
    "titulo": "Mis bloques: ponerle nombre a una maniobra",
    "hardware": "Hub (Giroscopio, matriz de luces 5x5 y altavoz) + 2 Motor mediano + Sensor de distancia",
    "modelo": "Robot de maniobras: base de conducción bien centrada, con el sensor de distancia delante y una marca de salida",
    "bloques": [
        "Mis bloques: Crear un bloque con entradas",
        "Cuando el cronómetro",
        "Enviar mensaje y esperar",
    ],
    "reto": "Fabrica tu propio bloque «girar tantos grados» y úsalo para recorrer un circuito sin repetir una sola línea.",
    "video": {
        "titulo": "Un bloque hecho por ti",
        "duracion": "5 min",
        "escenas": [
            {
                "plano": "Un programa de un circuito con el mismo grupo de cinco bloques repetido cuatro veces.",
                "locucion": "Mira el programa del cuadrado del año pasado. Los cinco bloques del giro están repetidos en cada esquina. Si cambias uno, tienes que cambiarlo cuatro veces, y se te olvidará una.",
            },
            {
                "plano": "El menú de Mis bloques y un bloque nuevo, vacío, con su nombre.",
                "locucion": "SPIKE te deja fabricar bloques tuyos. Le pones nombre, metes dentro los cinco bloques del giro, y a partir de ahí tienes un bloque «girar» que puedes usar como cualquier otro.",
            },
            {
                "plano": "El bloque nuevo con un hueco de número: «girar ( ) grados».",
                "locucion": "Y puede llevar huecos. «Girar noventa grados» y «girar cuarenta y cinco» con el mismo bloque: el número se lo pasas al usarlo.",
            },
            {
                "plano": "El programa del circuito, ahora con cuatro bloques en total.",
                "locucion": "El programa queda en cuatro líneas y se lee de un vistazo. Y si quieres mejorar el giro, lo tocas en un sitio y mejora en los cuatro.",
            },
            {
                "plano": "Un sombrero «Cuando el cronómetro» arrancando su pila a los 30 segundos.",
                "locucion": "De paso, dos bloques más. Uno arranca un programa cuando el cronómetro llega a un tiempo: sirve para límites y para avisos.",
            },
            {
                "plano": "«Enviar mensaje y esperar» deteniendo un programa hasta que el otro acaba.",
                "locucion": "Y el otro manda un aviso y ESPERA a que el que lo recibe termine. El de 1º no esperaba. Este sí, y por eso sirve para encadenar maniobras.",
            },
        ],
    },
    "explicaciones": {
        "Mis bloques: Crear un bloque con entradas": "Fabrica un bloque tuyo con el nombre que le pongas y los huecos que quieras. Dentro va la maniobra; fuera, una sola línea.",
        "Cuando el cronómetro": "Un sombrero que arranca su pila cuando el cronómetro llega al tiempo que le digas. Sirve para límites de tiempo y avisos.",
        "Enviar mensaje y esperar": "Manda un aviso y se queda parado hasta que el programa que lo recibe termina. El de 1º mandaba y seguía; este espera.",
    },
    "programa": {
        "titulo": "El circuito con bloque propio",
        "explicacion": "El giro medido con giroscopio se guarda dentro de un bloque propio llamado «girar». El programa principal solo dice qué hacer, no cómo.",
        "bloques": [
            b("Mis bloques: Crear un bloque con entradas", 0, "girar (grados)"),
            b("Fijar el ángulo de guiñada del Hub a 0", 1),
            b("empezar a mover derecha: 30", 1, "derecha: 100"),
            b("Repetir bucle hasta", 1, "ángulo de guiñada > grados"),
            b("Esperar X segundos", 2, "0.01"),
            b("parar movimiento", 1),
            b("Cuando se inicia el programa"),
            b("fijar A+B como motores en movimiento", 0, "A+B"),
            b("Fijar motores de movimiento para que frenen al parar", 0, "frenar"),
            b("fijar velocidad de movimiento al 50 %", 0, "30"),
            b("Repetir bucle", 0, "4"),
            b("mover ↑ durante 10 rotaciones", 1, "↑", "30", "cm"),
            b("Mis bloques: Crear un bloque con entradas", 1, "girar (90)"),
        ],
    },
    "construccion": {
        "piezas": "La base de conducción, el sensor de distancia, dos vigas de 7, dos bujes y cuatro pasadores.",
        "pasos": [
            {
                "titulo": "Centrar el Hub",
                "texto": "Coloca el Hub justo en el centro del chasis, a la misma distancia de las dos ruedas. El giroscopio va dentro, y si el Hub va torcido, mide torcido.",
            },
            {
                "titulo": "Apretar los ejes",
                "texto": "Pon un buje pegado a cada rueda. Una rueda que baila estropea cualquier giro medido.",
            },
            {
                "titulo": "El sensor",
                "texto": "Monta las dos vigas de 7 delante y encaja el sensor de distancia entre ellas, recto y mirando al frente.",
            },
            {
                "titulo": "El circuito",
                "texto": "Marca con cinta un cuadrado de 30 centímetros de lado en el suelo y señala la esquina de salida.",
            },
            {
                "titulo": "La comprobación",
                "texto": "Empuja el robot a mano por el circuito. Si alguna rueda roza o salta, arréglalo antes de programar: no hay bloque que corrija eso.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Tu primer bloque",
            "enunciado": "Crea un bloque propio llamado avisar que toque una nota y encienda un dibujo un segundo. Úsalo dos veces seguidas.",
            "pista": "Lo que va dentro del bloque propio se escribe una vez; luego se llama por su nombre.",
            "solucion": [
                b("Mis bloques: Crear un bloque con entradas", 0, "avisar"),
                b("Tocar nota X segundos", 1, "72 · 0.3"),
                b("encender dibujo durante 2 segundos", 1, "cara contenta", "1"),
                b("Cuando se inicia el programa"),
                b("Mis bloques: Crear un bloque con entradas", 0, "avisar"),
                b("Esperar X segundos", 0, "1"),
                b("Mis bloques: Crear un bloque con entradas", 0, "avisar"),
            ],
            "notas": "La definición es una pila aparte, igual que los sombreros. Verlo así les cuesta al principio.",
        },
        {
            "titulo": "Un bloque con hueco",
            "enunciado": "Crea un bloque llamado pitar con un hueco de número que toque esa nota medio segundo. Úsalo con tres notas distintas.",
            "pista": "El hueco se rellena al usar el bloque, no al crearlo.",
            "solucion": [
                b("Mis bloques: Crear un bloque con entradas", 0, "pitar (nota)"),
                b("Tocar nota X segundos", 1, "nota · 0.5"),
                b("Cuando se inicia el programa"),
                b("Mis bloques: Crear un bloque con entradas", 0, "pitar (60)"),
                b("Mis bloques: Crear un bloque con entradas", 0, "pitar (64)"),
                b("Mis bloques: Crear un bloque con entradas", 0, "pitar (67)"),
            ],
            "notas": "Tres usos y una sola definición. Si quieren cambiar la duración, la cambian en un sitio.",
        },
        {
            "titulo": "El giro con nombre",
            "enunciado": "Crea un bloque llamado girar con un hueco de grados que haga esto: pon el ángulo a cero; empieza a girar; repite hasta pasar de esos grados; para el movimiento. Úsalo para girar 90.",
            "pista": "Dentro del bloque, el hueco se usa como si fuera una variable.",
            "solucion": [
                b("Mis bloques: Crear un bloque con entradas", 0, "girar (grados)"),
                b("Fijar el ángulo de guiñada del Hub a 0", 1),
                b("empezar a mover derecha: 30", 1, "derecha: 100"),
                b("Repetir bucle hasta", 1, "ángulo de guiñada > grados"),
                b("Esperar X segundos", 2, "0.01"),
                b("parar movimiento", 1),
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar velocidad de movimiento al 50 %", 0, "30"),
                b("Mis bloques: Crear un bloque con entradas", 0, "girar (90)"),
            ],
            "notas": "Es el giro de 1º metido en una caja con nombre. A partir de aquí, girar es una línea.",
        },
        {
            "titulo": "El límite de tiempo",
            "enunciado": "Con el sombrero del cronómetro, haz esto a los 20 segundos: para el movimiento; escribe FIN; pon el botón en rojo.",
            "pista": "Este programa va en su propia pila, con su sombrero, y vigila por su cuenta.",
            "solucion": [
                b("Cuando el cronómetro", 0, "> 20"),
                b("parar movimiento", 0),
                b("escribir Hello", 0, "FIN"),
                b("poner luz del botón central en rojo", 0, "rojo"),
            ],
            "notas": "Un cronómetro que corta la prueba. Combinado con cualquier programa de los anteriores, le pone límite sin tocarlo.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Para qué sirve crear un bloque propio?",
            "opciones": [
                "Para que el programa vaya más rápido",
                "Para escribir una vez una maniobra que se repite y usarla por su nombre",
                "Para usar más sensores",
                "Para guardar números",
            ],
            "correcta": 1,
            "explicacion": "Se escribe una vez y se usa muchas. Y si hay que mejorarla, se mejora en un sitio.",
        },
        {
            "pregunta": "¿Qué es un hueco en un bloque propio?",
            "opciones": [
                "Un error de montaje",
                "Un valor que le pasas cada vez que lo usas",
                "Una variable global",
                "Un sensor",
            ],
            "correcta": 1,
            "explicacion": "Como los grados en «girar (90)»: el mismo bloque sirve para 90, para 45 o para 180.",
        },
        {
            "pregunta": "Mejoras el giro dentro del bloque propio. ¿Qué pasa en las cuatro esquinas del circuito?",
            "opciones": [
                "Solo mejora la primera",
                "Mejoran las cuatro",
                "Hay que copiar el cambio cuatro veces",
                "El programa deja de funcionar",
            ],
            "correcta": 1,
            "explicacion": "Todas usan el mismo bloque, así que el cambio llega a todas. Ese es el motivo de hacerlo.",
        },
        {
            "pregunta": "¿Dónde va la definición de un bloque propio?",
            "opciones": [
                "Dentro del programa principal",
                "En su propia pila, aparte, como los sombreros",
                "Al final del programa",
                "En otro archivo",
            ],
            "correcta": 1,
            "explicacion": "Es una pila suelta en el lienzo. El programa principal solo lo llama.",
        },
        {
            "pregunta": "«Cuando el cronómetro > 20», ¿qué hace?",
            "opciones": [
                "Espera 20 segundos y sigue",
                "Arranca su propia pila cuando el cronómetro pasa de 20",
                "Pone el cronómetro a 20",
                "Repite cada 20 segundos",
            ],
            "correcta": 1,
            "explicacion": "Es un sombrero: arranca su programa solo, sin que nadie lo llame.",
        },
        {
            "pregunta": "Diferencia entre «enviar mensaje» y «enviar mensaje y esperar»:",
            "opciones": [
                "Ninguna",
                "El segundo se queda parado hasta que el que recibe termina",
                "El segundo manda el mensaje dos veces",
                "El primero no funciona en 2º",
            ],
            "correcta": 1,
            "explicacion": "Esperar es lo que permite encadenar: haz esto, y cuando acabes, sigo yo.",
        },
        {
            "pregunta": "¿Cuántas veces hay que escribir los bloques de una maniobra que se usa cuatro veces?",
            "opciones": ["Cuatro", "Una, dentro del bloque propio", "Dos", "Depende del sensor"],
            "correcta": 1,
            "explicacion": "Esa es toda la idea: una definición, muchos usos.",
        },
        {
            "pregunta": "El programa del circuito pasa de veinte bloques a cuatro. ¿Hace algo distinto?",
            "opciones": [
                "Sí, hace menos cosas",
                "No: hace lo mismo, pero se lee mucho mejor",
                "Sí, va más rápido",
                "Sí, gasta menos batería",
            ],
            "correcta": 1,
            "explicacion": "Mismo comportamiento, mejor organización. Programar bien es sobre todo eso.",
        },
    ],
    "practicas": [
        {
            "titulo": "El circuito con bloque propio",
            "enunciado": "Crea un bloque girar con un hueco de grados que haga el giro medido con giroscopio. En el programa principal, prepara la base y repite cuatro veces avanzar 30 centímetros y llamar a girar con 90.",
            "solucion": [
                b("Mis bloques: Crear un bloque con entradas", 0, "girar (grados)"),
                b("Fijar el ángulo de guiñada del Hub a 0", 1),
                b("empezar a mover derecha: 30", 1, "derecha: 100"),
                b("Repetir bucle hasta", 1, "ángulo de guiñada > grados"),
                b("Esperar X segundos", 2, "0.01"),
                b("parar movimiento", 1),
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("Fijar motores de movimiento para que frenen al parar", 0, "frenar"),
                b("fijar 1 rotación del motor en 17.5 cm recorridos", 0, "17.5", "cm"),
                b("fijar velocidad de movimiento al 50 %", 0, "30"),
                b("Repetir bucle", 0, "4"),
                b("mover ↑ durante 10 rotaciones", 1, "↑", "30", "cm"),
                b("Mis bloques: Crear un bloque con entradas", 1, "girar (90)"),
            ],
            "notas": "Dos pilas: la definición y el programa. El cuadrado tiene que cerrar, y si no cierra, se toca el bloque girar una sola vez.",
        },
        {
            "titulo": "El recorrido con límite",
            "enunciado": "Haz con el mismo bloque girar un recorrido de tres tramos de 25 centímetros con giros de 120 grados. Añade un programa aparte que a los 20 segundos pare el movimiento y escriba FIN.",
            "solucion": [
                b("Mis bloques: Crear un bloque con entradas", 0, "girar (grados)"),
                b("Fijar el ángulo de guiñada del Hub a 0", 1),
                b("empezar a mover derecha: 30", 1, "derecha: 100"),
                b("Repetir bucle hasta", 1, "ángulo de guiñada > grados"),
                b("Esperar X segundos", 2, "0.01"),
                b("parar movimiento", 1),
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar 1 rotación del motor en 17.5 cm recorridos", 0, "17.5", "cm"),
                b("Reiniciar cronómetro"),
                b("Repetir bucle", 0, "3"),
                b("mover ↑ durante 10 rotaciones", 1, "↑", "25", "cm"),
                b("Mis bloques: Crear un bloque con entradas", 1, "girar (120)"),
                b("Cuando el cronómetro", 0, "> 20"),
                b("parar movimiento", 0),
                b("escribir Hello", 0, "FIN"),
            ],
            "notas": "Tres pilas en el lienzo: la definición, el recorrido y el vigilante del tiempo. Un triángulo, que con 120 grados cierra.",
        },
    ],
})


UNIDADES.append({
    "numero": 9,
    "enlace": "https://education.lego.com/en-us/lessons/spike-python-u9-data-and-math-functions/spike-python-u9l1-get-moving-to-get-data",
    "evaluacion": 3,
    "nivel": 3,
    "titulo": "Proyecto final: la estación que toma datos",
    "hardware": "Hub (Giroscopio, matriz de luces 5x5 y altavoz) + 1 Motor grande + 1 Motor mediano + Sensor de color + Sensor de distancia + Sensor de fuerza",
    "modelo": "Estación de medida: una torreta que barre con el sensor de distancia y una cinta movida por el motor grande",
    "bloques": [
        "Extensión Gráfico de líneas",
        "girar ↻",
        "establecer orientación como erguida",
        "A encender ojos",
    ],
    "reto": "Monta una estación que recorra su entorno, guarde las medidas y las pinte en un gráfico.",
    "video": {
        "titulo": "Del número al gráfico",
        "duracion": "6 min",
        "escenas": [
            {
                "plano": "Una pantalla del Hub escribiendo números de uno en uno, muy despacio.",
                "locucion": "La pantalla del Hub sirve para un número. Para veinte, no: cuando sale el último ya no te acuerdas del primero, y comparar es imposible.",
            },
            {
                "plano": "La extensión del gráfico de líneas, con puntos que se van dibujando en el iPad.",
                "locucion": "La app trae una extensión de gráficos. El robot le manda valores y la app los dibuja en el iPad, uno detrás de otro. Ahí sí se ve la forma de lo que estás midiendo.",
            },
            {
                "plano": "Una torreta barriendo y el gráfico dibujando una curva con un valle donde hay un objeto.",
                "locucion": "Un barrido de distancias no es una lista de números: es un perfil. Donde hay un objeto, el gráfico baja. Se ve a simple vista.",
            },
            {
                "plano": "La pantalla del Hub girando su contenido 90 grados al poner el Hub de lado.",
                "locucion": "Y dos detalles de pantalla, para cuando el Hub no va plano: se puede girar lo que se dibuja y decirle cuál es el lado de arriba.",
            },
            {
                "plano": "Los ojos del motor encendiéndose en azul y en rojo.",
                "locucion": "Los motores grandes también llevan luces. Sirven para avisar sin ocupar la pantalla, que en el proyecto está ocupada.",
            },
            {
                "plano": "La estación completa: barre, guarda en una lista, dibuja el gráfico y mueve la cinta.",
                "locucion": "Todo lo del curso junto: variables para contar, listas para guardar, sensores para medir, motores para moverse y un gráfico para enseñarlo.",
            },
        ],
    },
    "explicaciones": {
        "Extensión Gráfico de líneas": "Manda un valor a la app, que lo dibuja en un gráfico de líneas. Es la forma de ver una serie de medidas de un vistazo.",
        "girar ↻": "Gira lo que se dibuja en la pantalla del Hub. Útil cuando el Hub va montado de lado.",
        "establecer orientación como erguida": "Le dice al Hub cuál es su lado de arriba, para que los dibujos y las letras salgan derechos.",
        "A encender ojos": "Enciende las luces del motor del puerto que elijas. Avisa sin gastar la pantalla.",
    },
    "programa": {
        "titulo": "La estación de medida",
        "explicacion": "La torreta barre guardando distancias en una lista y mandándolas al gráfico. Al acabar recorre la lista buscando la medida más pequeña, que es donde estaba el objeto más cercano.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("establecer orientación como erguida", 0, "erguida"),
            b("Fijar la posición relativa en…", 0, "B · 0"),
            b("Fijar variable a", 0, "paso · 0"),
            b("Repetir bucle", 0, "18"),
            b("Ir a la posición relativa del motor a velocidad", 1, "B · paso × 10 · 30"),
            b("Añadir elemento a lista", 1, "medidas · Distancia E"),
            b("Extensión Gráfico de líneas", 1, "Distancia E"),
            b("Cambiar variable por", 1, "paso · 1"),
            b("Fijar variable a", 0, "minimo · Elemento 1 de medidas"),
            b("Fijar variable a", 0, "paso · 1"),
            b("Repetir bucle hasta", 0, "paso > Longitud de lista medidas"),
            b("Si... entonces...", 1, "Elemento paso de medidas < minimo"),
            b("Fijar variable a", 2, "minimo · Elemento paso de medidas"),
            b("Cambiar variable por", 1, "paso · 1"),
            b("escribir Hello", 0, "minimo"),
        ],
    },
    "construccion": {
        "piezas": "El Hub, el motor grande, un motor mediano, los tres sensores, dos marcos Technic, cuatro vigas de 15, cuatro vigas de 11, dos ejes de 7, un eje de 5, dos ruedas, un panel y dieciséis pasadores.",
        "pasos": [
            {
                "titulo": "La base de la estación",
                "texto": "Monta un rectángulo con las cuatro vigas de 15 y refuérzalo por debajo con los dos marcos Technic cruzados. Tiene que quedar firme: encima va todo.",
            },
            {
                "titulo": "La cinta transportadora",
                "texto": "Pon el motor grande en un extremo con el eje de 7 y las dos ruedas, y tiende el panel entre ellas haciendo de cinta.",
            },
            {
                "titulo": "La torreta",
                "texto": "En el otro extremo, monta el motor mediano en vertical con el eje de 5 y, encima, dos vigas de 11 cruzadas con el sensor de distancia en la punta.",
            },
            {
                "titulo": "Los otros sensores",
                "texto": "Coloca el sensor de color mirando a la cinta, para reconocer lo que pasa, y el de fuerza al alcance de la mano como botón de arranque.",
            },
            {
                "titulo": "Los cables",
                "texto": "Motor grande al A, motor mediano al B, color al D, distancia al E y fuerza al F. Pasa todos los cables por debajo de la base para que la torreta pueda dar la vuelta entera.",
            },
            {
                "titulo": "El barrido limpio",
                "texto": "Gira la torreta con la mano una vuelta completa. Si tropieza con un cable o con la cinta, súbela un agujero antes de programar.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "El primer gráfico",
            "enunciado": "Pon un bucle de veinte vueltas que mande la distancia al gráfico de líneas y espere dos décimas. Mueve la mano delante del sensor para ver la curva.",
            "pista": "El gráfico se ve en el iPad, no en la pantalla del Hub.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Repetir bucle", 0, "20"),
                b("Extensión Gráfico de líneas", 1, "Distancia E"),
                b("Esperar X segundos", 1, "0.2"),
            ],
            "notas": "Moviendo la mano sale una curva. Es lo que convierte una medida en algo que se puede mirar.",
        },
        {
            "titulo": "El barrido",
            "enunciado": "Fija a 0 la posición del motor B. En un bucle de dieciocho vueltas, llévalo a la posición que toca de diez en diez grados y manda la distancia al gráfico.",
            "pista": "La posición sale de multiplicar el número de paso por 10.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar la posición relativa en…", 0, "B · 0"),
                b("Fijar variable a", 0, "paso · 0"),
                b("Repetir bucle", 0, "18"),
                b("Ir a la posición relativa del motor a velocidad", 1, "B · paso × 10 · 30"),
                b("Extensión Gráfico de líneas", 1, "Distancia E"),
                b("Cambiar variable por", 1, "paso · 1"),
            ],
            "notas": "Dieciocho pasos de diez grados son 180: media vuelta. El gráfico sale con un valle donde haya algo.",
        },
        {
            "titulo": "Guardar el barrido",
            "enunciado": "Repite el barrido guardando además cada distancia en una lista llamada medidas. Escribe al final cuántas medidas has tomado.",
            "pista": "Se añade a la lista en la misma vuelta en la que se manda al gráfico.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar la posición relativa en…", 0, "B · 0"),
                b("Fijar variable a", 0, "paso · 0"),
                b("Repetir bucle", 0, "18"),
                b("Ir a la posición relativa del motor a velocidad", 1, "B · paso × 10 · 30"),
                b("Añadir elemento a lista", 1, "medidas · Distancia E"),
                b("Extensión Gráfico de líneas", 1, "Distancia E"),
                b("Cambiar variable por", 1, "paso · 1"),
                b("escribir Hello", 0, "Longitud de lista medidas"),
            ],
            "notas": "El gráfico se ve y se va; la lista se queda. Por eso hacen falta las dos cosas.",
        },
        {
            "titulo": "Buscar el mínimo",
            "enunciado": "Con una lista de medidas ya guardada, busca el valor más pequeño: pon la variable minimo al primer elemento; recorre la lista; cambia minimo cada vez que encuentres un elemento más pequeño; escríbelo al final.",
            "pista": "El mínimo empieza siendo el primer elemento, no cero: si empieza en cero, no lo supera ninguno.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar variable a", 0, "minimo · Elemento 1 de medidas"),
                b("Fijar variable a", 0, "paso · 1"),
                b("Repetir bucle hasta", 0, "paso > Longitud de lista medidas"),
                b("Si... entonces...", 1, "Elemento paso de medidas < minimo"),
                b("Fijar variable a", 2, "minimo · Elemento paso de medidas"),
                b("Cambiar variable por", 1, "paso · 1"),
                b("escribir Hello", 0, "minimo"),
            ],
            "notas": "Buscar el mínimo es el algoritmo más clásico que hay. Empezar en cero es el error de siempre y conviene dejar que lo descubran.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Para qué sirve el gráfico de líneas?",
            "opciones": [
                "Para dibujar en la pantalla del Hub",
                "Para ver una serie de medidas en el iPad y comparar su forma",
                "Para guardar los datos al apagar",
                "Para medir distancias",
            ],
            "correcta": 1,
            "explicacion": "Veinte números escritos uno a uno no se pueden comparar. Dibujados, la forma se ve de golpe.",
        },
        {
            "pregunta": "En un barrido de distancias, ¿qué significa un valle en el gráfico?",
            "opciones": [
                "Que el sensor falla",
                "Que en esa dirección hay algo cerca",
                "Que el motor va despacio",
                "Que se ha acabado el barrido",
            ],
            "correcta": 1,
            "explicacion": "Menos distancia es más cerca. El valle marca la dirección del objeto.",
        },
        {
            "pregunta": "¿Por qué guardar las medidas en una lista si ya salen en el gráfico?",
            "opciones": [
                "Para que el gráfico se vea mejor",
                "Porque el gráfico se ve y se va; la lista se queda y el programa puede usarla",
                "Porque la extensión lo exige",
                "No hace falta guardarlas",
            ],
            "correcta": 1,
            "explicacion": "El gráfico es para ti. La lista es para el robot, que es quien tiene que buscar el mínimo.",
        },
        {
            "pregunta": "Para buscar el mínimo de una lista, ¿a qué se iguala la variable al empezar?",
            "opciones": ["A 0", "Al primer elemento de la lista", "A 100", "A la longitud de la lista"],
            "correcta": 1,
            "explicacion": "Si empieza en 0, ningún elemento es menor y el mínimo se queda en 0. El primer elemento es un valor real.",
        },
        {
            "pregunta": "En el barrido, ¿cómo se calcula la posición de cada paso?",
            "opciones": [
                "Multiplicando el número de paso por los grados que avanza cada vez",
                "Sumando 1 a la posición",
                "Con el cronómetro",
                "Con un número aleatorio",
            ],
            "correcta": 0,
            "explicacion": "Paso por 10 da 0, 10, 20, 30… Una cuenta en lugar de dieciocho bloques.",
        },
        {
            "pregunta": "¿Para qué sirve «establecer orientación como erguida»?",
            "opciones": [
                "Para enderezar el robot",
                "Para decirle al Hub cuál es su lado de arriba y que los dibujos salgan derechos",
                "Para poner el giroscopio a cero",
                "Para subir el brillo",
            ],
            "correcta": 1,
            "explicacion": "Solo afecta a la pantalla. Es útil cuando el Hub va montado de lado o boca abajo.",
        },
        {
            "pregunta": "¿Qué herramientas del curso aparecen todas juntas en este proyecto?",
            "opciones": [
                "Solo variables y sensores",
                "Variables, listas, sensores, posiciones de motor y gráficos",
                "Solo motores",
                "Solo el gráfico",
            ],
            "correcta": 1,
            "explicacion": "Es un proyecto de integración: cada pieza del curso hace falta para que la estación funcione.",
        },
        {
            "pregunta": "¿Por qué pasar los cables por debajo de la base?",
            "opciones": [
                "Para que no se vean",
                "Para que la torreta pueda girar sin engancharse",
                "Para que el Hub no se caliente",
                "Para gastar menos batería",
            ],
            "correcta": 1,
            "explicacion": "Un cable enganchado para el barrido a mitad y falsea todas las medidas que quedan.",
        },
    ],
    "practicas": [
        {
            "titulo": "La estación de medida",
            "enunciado": "Fija a 0 la posición del motor B y haz un barrido de dieciocho pasos de diez grados, guardando cada distancia en la lista medidas y mandándola al gráfico. Después recorre la lista buscando el valor más pequeño y escríbelo.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("establecer orientación como erguida", 0, "erguida"),
                b("Fijar la posición relativa en…", 0, "B · 0"),
                b("Fijar variable a", 0, "paso · 0"),
                b("Repetir bucle", 0, "18"),
                b("Ir a la posición relativa del motor a velocidad", 1, "B · paso × 10 · 30"),
                b("Añadir elemento a lista", 1, "medidas · Distancia E"),
                b("Extensión Gráfico de líneas", 1, "Distancia E"),
                b("Cambiar variable por", 1, "paso · 1"),
                b("Fijar variable a", 0, "minimo · Elemento 1 de medidas"),
                b("Fijar variable a", 0, "paso · 1"),
                b("Repetir bucle hasta", 0, "paso > Longitud de lista medidas"),
                b("Si... entonces...", 1, "Elemento paso de medidas < minimo"),
                b("Fijar variable a", 2, "minimo · Elemento paso de medidas"),
                b("Cambiar variable por", 1, "paso · 1"),
                b("escribir Hello", 0, "minimo"),
            ],
            "notas": "El programa más largo del curso: dos bucles, una lista, cuatro variables y tres niveles de sangría. Se corrige por partes.",
        },
        {
            "titulo": "La cinta que clasifica",
            "enunciado": "Pon los contados a 0 y, dentro de un bucle infinito, haz esto: arranca el motor grande; espera a que el sensor de color vea algo claro con la luz reflejada por encima de 60; para la cinta; sube los contados uno; enciende los ojos del motor A; escribe los contados; espera a que la pieza salga.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar variable a", 0, "contados · 0"),
                b("A fijar velocidad al 75 %", 0, "A", "30"),
                b("Bucle infinito"),
                b("A arrancar motor", 1, "A", "↻"),
                b("Esperar hasta que", 1, "Luz reflejada D > 60"),
                b("A parar motor", 1, "A"),
                b("Cambiar variable por", 1, "contados · 1"),
                b("A encender ojos", 1, "A", "azul"),
                b("escribir Hello", 1, "contados"),
                b("Esperar hasta que", 1, "Luz reflejada D < 40"),
            ],
            "notas": "Junta el motor grande, el sensor de color con umbral y un contador. Los dos umbrales distintos evitan contar en ráfaga, como en la báscula.",
        },
    ],
})


if __name__ == "__main__":
    # Se regenera el curso entero, así que se puede repartir la respuesta
    # correcta entre las cuatro letras (ver reparte_respuestas).
    reparte_respuestas(UNIDADES)
    main("2ESO", UNIDADES, VIDEOS)
