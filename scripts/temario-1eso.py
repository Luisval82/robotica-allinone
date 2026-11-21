#!/usr/bin/env python3
"""El temario de 1º de ESO: 9 unidades en 3 evaluaciones.

Por qué un script y no 9 JSON escritos a mano: porque el contenido tiene que
cumplir reglas que a mano se incumplen sin enterarse. La más importante es que
NINGUNA solución puede usar un bloque que el alumno todavía no tiene en la
paleta —la paleta de la unidad N son sus bloques más los de todas las
anteriores—, y eso solo se comprueba de verdad contándolo. Aquí se comprueba
al generar, y si falla, no se escribe nada.

El reparto que pidió el profesor: cada evaluación toca TODOS los ámbitos
—pantalla, botones, sonido, motores y giros, y los tres sensores— y sube el
nivel respecto a la anterior.

  1ª evaluación · UD 1-3 · Nivel 1  programas cortos y seguidos, sin anidar
  2ª evaluación · UD 4-6 · Nivel 2  bucles, giros controlados, condiciones
  3ª evaluación · UD 7-9 · Nivel 3  dos caminos, giros medidos, proyectos

Los `pasos` de los enunciados y la lista de `materiales` NO se escriben aquí:
los generan scripts/enunciados.py y scripts/materiales.py, que ya existen y
están probados. Este script escribe el contenido; aquellos lo desglosan.

    python3 scripts/temario-1eso.py && python3 scripts/materiales.py \\
      && python3 scripts/enunciados.py
"""

import json
import pathlib

from temario_comun import b, main

# Los enlaces oficiales de LEGO que ya teníamos, para no inventar ninguno.
_VIDEOS = pathlib.Path("/tmp/videos1eso.json")
VIDEOS = json.loads(_VIDEOS.read_text()) if _VIDEOS.exists() else {}




# ═══════════════════════════════════════════════════════════════════════════
#  EL TEMARIO
# ═══════════════════════════════════════════════════════════════════════════
#
# Cada unidad: la ficha para unidades.json (titulo, hardware, bloques, modelo)
# y el contenido para contenido/1ESO-N.json.
#
# `hardware` tiene formato fijo, porque de ahí se deduce el esquema de puertos:
#   Hub (lo de dentro, separado por comas y «y») + N Motor mediano + Sensor de…
# Los puertos salen solos: motores A, B, C; color D, distancia E, fuerza F.

UNIDADES = []


# ───────────────────────────────────────────────────────────────────────────
# 1ª EVALUACIÓN · NIVEL 1 · Programas cortos, seguidos y muy guiados
# ───────────────────────────────────────────────────────────────────────────

UNIDADES.append({
    "numero": 1,
    "evaluacion": 1,
    "nivel": 1,
    "titulo": "El Hub se enciende: pantalla, botón y sonido",
    "hardware": "Hub (Matriz de luces 5x5, altavoz y botón central)",
    "modelo": "Atril de sobremesa: un soporte inclinado que deja la pantalla del Hub a la altura de los ojos",
    "bloques": [
        "Cuando se inicia el programa",
        "encender dibujo durante 2 segundos",
        "escribir Hello",
        "apagar píxeles",
        "poner luz del botón central en rojo",
        "Tocar nota X segundos",
        "Esperar X segundos",
    ],
    "reto": "Convierte el Hub en un cartel de bienvenida que escribe tu nombre, dibuja algo en la pantalla y suena.",
    "video": {
        "titulo": "El Hub por fuera y por dentro",
        "duracion": "3 min",
        "escenas": [
            {
                "plano": "El Hub apagado sobre la mesa. Una mano pulsa el botón grande del centro y la pantalla se enciende.",
                "locucion": "Esto es el Hub. Es el cerebro de todos los robots que vas a montar este curso. Por fuera no tiene nada raro: una pantalla de 25 luces, un botón grande en el centro y seis puertos alrededor.",
            },
            {
                "plano": "Primer plano de la pantalla: se encienden 25 cuadraditos uno a uno formando una cuadrícula.",
                "locucion": "La pantalla son 25 luces en cinco filas y cinco columnas. No es una pantalla de móvil: no puede enseñar fotos. Puede encender cada luz más o menos fuerte, y con eso se dibuja.",
            },
            {
                "plano": "La pantalla muestra letras que van pasando de derecha a izquierda.",
                "locucion": "Para escribir, las letras pasan de una en una, como los carteles luminosos de las carreteras. Si el texto es largo, tarda. Eso luego hay que tenerlo en cuenta.",
            },
            {
                "plano": "El botón central cambia de color: blanco, rojo, verde, azul.",
                "locucion": "El botón del centro también es una luz, y de colores. Sirve para avisar sin gastar la pantalla: verde para «listo», rojo para «cuidado».",
            },
            {
                "plano": "Se oye un pitido y en la pantalla aparece el icono del altavoz.",
                "locucion": "Y suena. El Hub lleva un altavoz pequeño que toca notas, como un piano de juguete.",
            },
            {
                "plano": "Vista general del Hub con los seis puertos señalados con las letras A a F.",
                "locucion": "De los seis puertos todavía no vas a usar ninguno. Hoy el Hub trabaja solo: pantalla, botón y altavoz. En la unidad 2 le enchufas el primer motor.",
            },
        ],
    },
    "explicaciones": {
        "Cuando se inicia el programa": "Es el sombrero amarillo con el que empieza todo. Lo que encajes debajo se ejecuta de arriba abajo cuando pulsas el botón de reproducir.",
        "encender dibujo durante 2 segundos": "Enciende un dibujo en la pantalla y lo deja puesto los segundos que le digas. Al acabar lo apaga él solo.",
        "escribir Hello": "Escribe un texto que va pasando de derecha a izquierda. Cámbiale el «Hello» por lo que quieras. Ojo: hasta que no termina de pasar, el programa no sigue.",
        "apagar píxeles": "Apaga las 25 luces de golpe. Se usa al final, para dejar la pantalla limpia.",
        "poner luz del botón central en rojo": "Cambia el color del botón grande. El desplegable trae los colores que puede hacer.",
        "Tocar nota X segundos": "Toca una nota por el altavoz durante los segundos que le pongas. El número de la nota es la tecla del piano: cuanto más alto, más agudo.",
        "Esperar X segundos": "Para el programa el tiempo que le digas y luego sigue. Sin él, los bloques van tan seguidos que no da tiempo a ver nada.",
    },
    "programa": {
        "titulo": "El cartel de bienvenida",
        "explicacion": "Los bloques se encajan de arriba abajo y se ejecutan en ese orden, uno detrás de otro. Este programa escribe un saludo, enseña un dibujo, pita y deja la pantalla apagada.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("poner luz del botón central en rojo", 0, "verde"),
            b("escribir Hello", 0, "Hola"),
            b("encender dibujo durante 2 segundos", 0, "corazón", "2"),
            b("Tocar nota X segundos", 0, "60 · 0.5"),
            b("apagar píxeles"),
        ],
    },
    "construccion": {
        "piezas": "El Hub, dos vigas de 11, dos vigas de 7, dos vigas angulares y ocho pasadores. No hace falta ningún motor.",
        "pasos": [
            {
                "titulo": "La base",
                "texto": "Pon las dos vigas de 11 en paralelo sobre la mesa, separadas el ancho del Hub, y únelas por los extremos con las dos vigas de 7 usando cuatro pasadores.",
            },
            {
                "titulo": "El respaldo",
                "texto": "Encaja las dos vigas angulares en los agujeros traseros de las vigas largas, con la parte doblada hacia arriba y hacia atrás.",
            },
            {
                "titulo": "La inclinación",
                "texto": "Apoya el Hub contra las vigas angulares. La pantalla tiene que quedar mirando hacia arriba, inclinada como un atril de lectura.",
            },
            {
                "titulo": "La sujeción",
                "texto": "Pasa los cuatro pasadores que quedan por los agujeros del Hub y fíjalos a las vigas largas. Empuja hasta oír el clic.",
            },
            {
                "titulo": "La prueba",
                "texto": "Levanta el atril por la base y agítalo un poco. Si el Hub se mueve, aprieta más los pasadores de la sujeción.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Enciende un dibujo",
            "enunciado": "Haz que la pantalla muestre un corazón durante 3 segundos y después se quede apagada.",
            "pista": "Acuérdate de apagar los píxeles al final: si no, el último dibujo se queda puesto.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("encender dibujo durante 2 segundos", 0, "corazón", "3"),
                b("apagar píxeles"),
            ],
            "notas": "Con «durante» el dibujo se apaga solo al acabar, pero el bloque de apagar deja la pantalla segura por si el alumno cambia luego el dibujo por uno sin tiempo.",
        },
        {
            "titulo": "Tu nombre en la pantalla",
            "enunciado": "Escribe tu nombre en la pantalla y, cuando termine de pasar, pon el botón central en verde.",
            "pista": "El bloque de escribir no deja seguir hasta que la última letra sale por la izquierda, así que el verde se enciende justo al final.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("escribir Hello", 0, "Luis"),
                b("poner luz del botón central en rojo", 0, "verde"),
            ],
            "notas": "Vale cualquier nombre. Lo que se comprueba es el orden: primero escribir y después el color.",
        },
        {
            "titulo": "El semáforo",
            "enunciado": "Pon la luz del botón central en verde, espera 2 segundos, cámbiala a amarillo, espera 1 segundo y acaba en rojo.",
            "pista": "Entre color y color tiene que haber una espera; si no, los tres cambios pasan tan rápido que solo ves el último.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("poner luz del botón central en rojo", 0, "verde"),
                b("Esperar X segundos", 0, "2"),
                b("poner luz del botón central en rojo", 0, "amarillo"),
                b("Esperar X segundos", 0, "1"),
                b("poner luz del botón central en rojo", 0, "rojo"),
            ],
            "notas": "Es el primer programa en el que el tiempo importa. Sin las esperas el programa hace lo mismo, pero no se ve.",
        },
        {
            "titulo": "Tres notas seguidas",
            "enunciado": "Toca tres notas distintas de medio segundo cada una y enciende un dibujo de una cara contenta al terminar.",
            "pista": "Las notas van por número: 60 es un do, y cuanto más alto el número, más agudo suena.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Tocar nota X segundos", 0, "60 · 0.5"),
                b("Tocar nota X segundos", 0, "64 · 0.5"),
                b("Tocar nota X segundos", 0, "67 · 0.5"),
                b("encender dibujo durante 2 segundos", 0, "cara contenta", "2"),
            ],
            "notas": "Valen otras tres notas. 60, 64 y 67 forman un acorde que suena bien.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Con qué bloque empieza cualquier programa?",
            "opciones": ["Esperar 1 segundos", "Cuando se inicia el programa", "encender dibujo", "apagar píxeles"],
            "correcta": 1,
            "explicacion": "El sombrero amarillo «Cuando se inicia el programa» es el único que puede ir arriba del todo: marca por dónde empieza.",
        },
        {
            "pregunta": "¿Cuántas luces tiene la pantalla del Hub?",
            "opciones": ["9, en tres filas de tres", "25, en cinco filas de cinco", "100, en diez filas de diez", "Una sola, muy grande"],
            "correcta": 1,
            "explicacion": "Son 5 filas por 5 columnas: 25 luces. Por eso los dibujos tienen que ser muy sencillos.",
        },
        {
            "pregunta": "Pones «escribir Hola» y justo debajo «apagar píxeles». ¿Qué pasa?",
            "opciones": [
                "No se ve nada, porque se apaga antes de escribir",
                "Se escribe «Hola» entero y después se apaga la pantalla",
                "Se escribe solo la H",
                "El programa da error",
            ],
            "correcta": 1,
            "explicacion": "El bloque de escribir no deja pasar al siguiente hasta que la última letra sale por la izquierda. El apagado llega después.",
        },
        {
            "pregunta": "¿Para qué sirve el bloque «Esperar 2 segundos»?",
            "opciones": [
                "Para que el robot descanse y no se caliente",
                "Para parar el programa 2 segundos y que dé tiempo a ver lo anterior",
                "Para que el programa vaya más rápido",
                "Para repetir el bloque anterior dos veces",
            ],
            "correcta": 1,
            "explicacion": "Sin esperas los bloques se ejecutan tan seguidos que el ojo no los distingue. La espera es lo que hace visible un cambio.",
        },
        {
            "pregunta": "El botón central del Hub, además de pulsarse, ¿qué más hace?",
            "opciones": ["Se ilumina de colores", "Suena", "Mide la distancia", "Gira"],
            "correcta": 0,
            "explicacion": "Es también una luz de colores, y sirve para avisar sin ocupar la pantalla.",
        },
        {
            "pregunta": "¿Qué hace «encender dibujo durante 2 segundos»?",
            "opciones": [
                "Enciende el dibujo y lo deja puesto para siempre",
                "Enciende el dibujo, espera 2 segundos y lo apaga solo",
                "Enciende el dibujo solo si antes has apagado los píxeles",
                "Enciende el botón central durante 2 segundos",
            ],
            "correcta": 1,
            "explicacion": "El «durante» incluye el apagado: cuando pasa el tiempo, la pantalla se queda limpia sin tener que apagarla.",
        },
        {
            "pregunta": "En «Tocar nota 72 durante 0.5 segundos», ¿qué es el 72?",
            "opciones": ["Los segundos", "El volumen", "Qué nota suena: cuanto más alto, más aguda", "El número de veces que suena"],
            "correcta": 2,
            "explicacion": "El primer número es la nota, como la tecla de un piano. El segundo son los segundos que dura.",
        },
        {
            "pregunta": "Quieres que el cartel acabe con la pantalla limpia. ¿Qué bloque pones el último?",
            "opciones": ["Esperar 1 segundos", "poner luz del botón central en apagado", "apagar píxeles", "Cuando se inicia el programa"],
            "correcta": 2,
            "explicacion": "«apagar píxeles» apaga las 25 luces. El color del botón es otra cosa y no toca la pantalla.",
        },
    ],
    "practicas": [
        {
            "titulo": "El cartel de la clase",
            "enunciado": "Programa el Hub para que escriba «ROBOTICA», enseñe un dibujo 2 segundos, toque una nota de medio segundo y acabe con la pantalla apagada y el botón en verde.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("escribir Hello", 0, "ROBOTICA"),
                b("encender dibujo durante 2 segundos", 0, "corazón", "2"),
                b("Tocar nota X segundos", 0, "60 · 0.5"),
                b("apagar píxeles"),
                b("poner luz del botón central en rojo", 0, "verde"),
            ],
            "notas": "El orden es lo que se corrige. El dibujo y la nota pueden ser otros.",
        },
        {
            "titulo": "Cuenta atrás",
            "enunciado": "Haz una cuenta atrás de tres: el botón en rojo un segundo, en amarillo otro segundo, en verde otro, y al acabar una nota larga de un segundo.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("poner luz del botón central en rojo", 0, "rojo"),
                b("Esperar X segundos", 0, "1"),
                b("poner luz del botón central en rojo", 0, "amarillo"),
                b("Esperar X segundos", 0, "1"),
                b("poner luz del botón central en rojo", 0, "verde"),
                b("Esperar X segundos", 0, "1"),
                b("Tocar nota X segundos", 0, "72 · 1"),
            ],
            "notas": "Lo que se mira es que haya una espera entre cada color: son tres colores y tres esperas.",
        },
    ],
})


UNIDADES.append({
    "numero": 2,
    "evaluacion": 1,
    "nivel": 1,
    "titulo": "El primer motor: segundos, grados y rotaciones",
    "hardware": "Hub (Matriz de luces 5x5 y altavoz) + 1 Motor mediano",
    "modelo": "Ventilador de sobremesa con tres velocidades programadas",
    "bloques": [
        "A ir durante 1 rotaciones",
        "A fijar velocidad al 75 %",
        "A arrancar motor",
        "A parar motor",
        "A ir por la ruta más corta a la posición 0",
    ],
    "reto": "Monta un ventilador y prográmale tres velocidades seguidas: suave, media y fuerte.",
    "video": {
        "titulo": "El motor mediano, por dentro",
        "duracion": "4 min",
        "escenas": [
            {
                "plano": "Un motor mediano en la mano, con el cable colgando. Se enchufa al puerto A del Hub.",
                "locucion": "Este es el motor mediano. La caja trae dos. Se enchufa a cualquier puerto, pero en esta plataforma el primer motor va siempre al A: así todos los programas de clase se parecen.",
            },
            {
                "plano": "Primer plano del eje del motor girando despacio. Una pegatina en el eje da una vuelta entera.",
                "locucion": "Una rotación es una vuelta entera del eje. Si le pides dos rotaciones, da dos vueltas y para. No importa lo deprisa que vaya: dos vueltas son dos vueltas.",
            },
            {
                "plano": "El mismo eje girando un cuarto de vuelta. Un transportador marca 90 grados.",
                "locucion": "También se le pueden pedir grados. Una vuelta entera son 360 grados, media vuelta 180 y un cuarto 90. Los grados sirven cuando quieres precisión.",
            },
            {
                "plano": "Dos programas uno al lado del otro: «ir durante 2 rotaciones» y «arrancar motor».",
                "locucion": "Hay dos maneras de mover un motor. «Ir durante» le da una tarea con final: gira y para. «Arrancar» lo pone en marcha y lo deja girando hasta que tú lo pares.",
            },
            {
                "plano": "El motor gira al 20 % y después al 100 %. El ventilador acelera.",
                "locucion": "La velocidad va de 0 a 100 y se fija antes de arrancar. Si no dices nada, va al 75 %.",
            },
        ],
    },
    "explicaciones": {
        "A ir durante 1 rotaciones": "Mueve el motor del puerto que elijas una cantidad concreta y para solo. El desplegable cambia entre rotaciones, grados y segundos.",
        "A fijar velocidad al 75 %": "Decide a qué velocidad irá el motor a partir de ese momento. Va de 0 a 100 y hay que ponerlo ANTES de mover.",
        "A arrancar motor": "Pone el motor en marcha y el programa sigue. El motor se queda girando hasta que otro bloque lo pare.",
        "A parar motor": "Para el motor que esté girando. Es la pareja de «arrancar»: si arrancas y no paras, no para nunca.",
        "A ir por la ruta más corta a la posición 0": "Lleva el eje a una posición concreta, como la aguja de un reloj. La posición 0 es la marca de fábrica del motor.",
    },
    "programa": {
        "titulo": "Ventilador de tres velocidades",
        "explicacion": "La velocidad se fija antes de arrancar, nunca después. Este programa arranca suave, sube a media, sube a fuerte y acaba parando el motor.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("A fijar velocidad al 75 %", 0, "A", "30"),
            b("A arrancar motor", 0, "A", "↻"),
            b("Esperar X segundos", 0, "3"),
            b("A fijar velocidad al 75 %", 0, "A", "60"),
            b("Esperar X segundos", 0, "3"),
            b("A fijar velocidad al 75 %", 0, "A", "100"),
            b("Esperar X segundos", 0, "3"),
            b("A parar motor", 0, "A"),
        ],
    },
    "construccion": {
        "piezas": "El Hub, un motor mediano con su cable, dos vigas de 11, una viga de 7, cuatro pasadores, un eje de 5 y una rueda con neumático.",
        "pasos": [
            {
                "titulo": "El pie",
                "texto": "Une las dos vigas de 11 en cruz con dos pasadores. Esta cruz es la base y es la que evita que el ventilador se caiga cuando vibre.",
            },
            {
                "titulo": "La torre",
                "texto": "Levanta la viga de 7 en vertical sobre el centro de la cruz y fíjala con dos pasadores.",
            },
            {
                "titulo": "El motor",
                "texto": "Encaja el motor mediano arriba de la torre, con el eje mirando hacia delante.",
            },
            {
                "titulo": "Las aspas",
                "texto": "Mete el eje de 5 en el motor y pon la rueda en la punta. La rueda hace de aspa: al girar mueve aire.",
            },
            {
                "titulo": "El cable",
                "texto": "Conecta el motor al puerto A del Hub y recoge el cable sobrante alrededor de la torre para que no toque las aspas.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Una vuelta y para",
            "enunciado": "Haz que el motor A dé exactamente dos rotaciones y se pare.",
            "pista": "Con «ir durante» el motor para solo al terminar: no hace falta un bloque de parar.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("A ir durante 1 rotaciones", 0, "A", "↻", "2", "rotaciones"),
            ],
            "notas": "La trampa es añadir «parar motor» al final. No hace falta y no estorba, pero conviene que entiendan la diferencia.",
        },
        {
            "titulo": "Despacio y deprisa",
            "enunciado": "Pon el motor al 20 %, hazlo girar una rotación, súbelo al 100 % y hazlo girar otra rotación.",
            "pista": "La velocidad se fija antes de cada movimiento, no después.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("A fijar velocidad al 75 %", 0, "A", "20"),
                b("A ir durante 1 rotaciones", 0, "A", "↻", "1", "rotaciones"),
                b("A fijar velocidad al 75 %", 0, "A", "100"),
                b("A ir durante 1 rotaciones", 0, "A", "↻", "1", "rotaciones"),
            ],
            "notas": "Se ve muy bien la diferencia de velocidad porque las dos vueltas son iguales.",
        },
        {
            "titulo": "Arranca y para tú",
            "enunciado": "Arranca el motor A, déjalo girando 4 segundos y páralo.",
            "pista": "«Arrancar» no para solo. Necesita una espera y después el bloque de parar.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("A arrancar motor", 0, "A", "↻"),
                b("Esperar X segundos", 0, "4"),
                b("A parar motor", 0, "A"),
            ],
            "notas": "Es el programa que más se olvida terminar. Sin el bloque de parar, el motor sigue hasta que se apaga el Hub.",
        },
        {
            "titulo": "Media vuelta exacta",
            "enunciado": "Lleva el motor A a la posición 0, espera un segundo y hazlo girar 180 grados.",
            "pista": "Los grados se eligen en el mismo desplegable que las rotaciones.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("A ir por la ruta más corta a la posición 0", 0, "A", "por la ruta más corta", "0"),
                b("Esperar X segundos", 0, "1"),
                b("A ir durante 1 rotaciones", 0, "A", "↻", "180", "grados"),
            ],
            "notas": "Ir primero a la posición 0 hace que el giro salga siempre igual, empiece el eje donde empiece.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Cuántos grados tiene una rotación entera?",
            "opciones": ["90", "180", "360", "100"],
            "correcta": 2,
            "explicacion": "Una vuelta entera son 360 grados. Media vuelta, 180, y un cuarto, 90.",
        },
        {
            "pregunta": "¿Qué diferencia hay entre «ir durante 2 rotaciones» y «arrancar motor»?",
            "opciones": [
                "Ninguna, hacen lo mismo",
                "«Ir durante» para solo al acabar; «arrancar» sigue hasta que lo pares",
                "«Arrancar» es más rápido",
                "«Ir durante» solo funciona con el motor grande",
            ],
            "correcta": 1,
            "explicacion": "Uno tiene final y el otro no. Por eso «arrancar» necesita siempre un «parar» más abajo.",
        },
        {
            "pregunta": "¿Dónde hay que poner el bloque de fijar velocidad?",
            "opciones": ["Antes de mover el motor", "Después de mover el motor", "Da igual", "Solo al final del programa"],
            "correcta": 0,
            "explicacion": "La velocidad se fija para lo que venga después. Puesta detrás, el movimiento ya ha pasado.",
        },
        {
            "pregunta": "Tu programa arranca el motor y acaba sin pararlo. ¿Qué pasa?",
            "opciones": [
                "El motor se para solo al terminar el programa",
                "El motor sigue girando",
                "El Hub da error",
                "El motor da una vuelta y para",
            ],
            "correcta": 1,
            "explicacion": "El motor se queda girando. Hay que pararlo a mano o apagar el Hub.",
        },
        {
            "pregunta": "¿A qué puerto se enchufa el primer motor en esta plataforma?",
            "opciones": ["Al A", "Al D", "Al F", "A cualquiera, pero hay que decírselo al programa"],
            "correcta": 0,
            "explicacion": "Por convenio de clase, los motores van al A, B y C por orden, y los sensores al D, E y F.",
        },
        {
            "pregunta": "¿Entre qué números va la velocidad de un motor?",
            "opciones": ["0 y 10", "0 y 100", "1 y 360", "−100 y 100, pero solo en el motor grande"],
            "correcta": 1,
            "explicacion": "Es un porcentaje: 0 es parado y 100 es todo lo que da.",
        },
        {
            "pregunta": "Quieres que el eje acabe siempre mirando al mismo sitio. ¿Qué bloque usas?",
            "opciones": [
                "«ir durante 1 rotaciones»",
                "«ir a la posición 0»",
                "«arrancar motor»",
                "«fijar velocidad al 100 %»",
            ],
            "correcta": 1,
            "explicacion": "La posición es absoluta: la 0 es siempre el mismo punto del eje, da igual dónde estuviera antes.",
        },
        {
            "pregunta": "Si pones el motor al 20 % y le pides dos rotaciones, ¿cuántas vueltas da?",
            "opciones": ["Media vuelta", "Dos vueltas, pero más despacio", "Veinte vueltas", "Depende del peso que mueva"],
            "correcta": 1,
            "explicacion": "La velocidad cambia lo que tarda, no lo que recorre. Dos rotaciones son dos vueltas siempre.",
        },
    ],
    "practicas": [
        {
            "titulo": "El ventilador de la mesa",
            "enunciado": "Programa el ventilador para que arranque al 30 %, suba al 70 % a los 3 segundos, suba al 100 % a los 3 segundos siguientes y pare.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("A fijar velocidad al 75 %", 0, "A", "30"),
                b("A arrancar motor", 0, "A", "↻"),
                b("Esperar X segundos", 0, "3"),
                b("A fijar velocidad al 75 %", 0, "A", "70"),
                b("Esperar X segundos", 0, "3"),
                b("A fijar velocidad al 75 %", 0, "A", "100"),
                b("Esperar X segundos", 0, "3"),
                b("A parar motor", 0, "A"),
            ],
            "notas": "Lo que se corrige: que la velocidad cambie mientras el motor sigue girando, sin pararlo entre tramo y tramo.",
        },
        {
            "titulo": "El cuentavueltas",
            "enunciado": "Haz que el motor A dé una rotación, toque una nota, dé otra rotación, toque la nota otra vez y acabe volviendo a la posición 0.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("A ir durante 1 rotaciones", 0, "A", "↻", "1", "rotaciones"),
                b("Tocar nota X segundos", 0, "60 · 0.3"),
                b("A ir durante 1 rotaciones", 0, "A", "↻", "1", "rotaciones"),
                b("Tocar nota X segundos", 0, "60 · 0.3"),
                b("A ir por la ruta más corta a la posición 0", 0, "A", "por la ruta más corta", "0"),
            ],
            "notas": "Mezcla motor y sonido. La vuelta a la posición 0 al final es lo que más se olvida.",
        },
    ],
})


UNIDADES.append({
    "numero": 3,
    "video_de": 5,
    "evaluacion": 1,
    "nivel": 1,
    "titulo": "Los tres sentidos: fuerza, distancia y color",
    "hardware": "Hub (Matriz de luces 5x5 y altavoz) + 1 Motor mediano + Sensor de color + Sensor de distancia + Sensor de fuerza",
    "modelo": "Mesa de pruebas: una viga con los tres sensores montados y un motor que levanta una banderita",
    "bloques": [
        "Esperar hasta que",
        "¿Está presionado?",
        "¿Está más próximo a?",
        "¿Es de color...?",
    ],
    "reto": "Monta los tres sensores en una misma mesa y haz que cada uno dispare una señal distinta.",
    "video": {
        "titulo": "Los tres sensores de la caja",
        "duracion": "4 min",
        "escenas": [
            {
                "plano": "Los tres sensores alineados sobre la mesa: color, distancia y fuerza, con sus cables.",
                "locucion": "La caja trae tres sensores. Cada uno mira una cosa distinta, y cada uno va a su puerto: el de color al D, el de distancia al E y el de fuerza al F.",
            },
            {
                "plano": "Un dedo aprieta el sensor de fuerza. En la pantalla del Hub aparece un tic.",
                "locucion": "El de fuerza es el más fácil de entender: es un botón. Sabe si lo estás apretando y además con cuánta fuerza, aunque eso lo dejamos para más adelante.",
            },
            {
                "plano": "Una mano se acerca y se aleja del sensor de distancia. Se ve un número que baja y sube.",
                "locucion": "El de distancia manda un sonido que no oyes, espera a que rebote y cuenta lo que ha tardado. Con eso sabe a cuántos centímetros está lo que tiene delante.",
            },
            {
                "plano": "Tarjetas de colores pasando por debajo del sensor de color.",
                "locucion": "El de color mira lo que tiene justo debajo y dice de qué color es. Tiene que estar cerca, a un centímetro o dos, y no le gusta la luz del sol dándole de lado.",
            },
            {
                "plano": "El bloque «Esperar hasta que» con una pregunta encajada dentro.",
                "locucion": "Para usarlos hoy solo necesitas un bloque: «Esperar hasta que». El programa se queda quieto en esa línea hasta que la pregunta que le metas dentro sea verdad. Y entonces sigue.",
            },
        ],
    },
    "explicaciones": {
        "Esperar hasta que": "Detiene el programa en esa línea hasta que la pregunta de dentro sea verdad. Es la forma más sencilla de usar un sensor: esperar a que pase algo.",
        "¿Está presionado?": "Pregunta de sensor: vale verdad cuando el sensor de fuerza está apretado. Se mete dentro del hueco con forma de rombo.",
        "¿Está más próximo a?": "Pregunta de sensor: vale verdad cuando lo que hay delante está más cerca de los centímetros que le digas.",
        "¿Es de color...?": "Pregunta de sensor: vale verdad cuando el sensor de color ve justo el color que le has elegido.",
    },
    "programa": {
        "titulo": "La mesa de pruebas",
        "explicacion": "Tres esperas seguidas, una por sensor. El programa no avanza hasta que cada sensor nota lo suyo, y después de cada una hay una señal distinta para saber cuál ha sido.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("escribir Hello", 0, "APRIETA"),
            b("Esperar hasta que", 0, "¿Está presionado? F"),
            b("Tocar nota X segundos", 0, "60 · 0.5"),
            b("escribir Hello", 0, "ACERCA"),
            b("Esperar hasta que", 0, "¿Está más próximo a? E 15 cm"),
            b("encender dibujo durante 2 segundos", 0, "cara contenta", "2"),
            b("apagar píxeles"),
        ],
    },
    "construccion": {
        "piezas": "El Hub, un motor mediano, los tres sensores con sus cables, una viga de 15, dos vigas de 7, ocho pasadores y un eje de 3.",
        "pasos": [
            {
                "titulo": "La barra",
                "texto": "Coge la viga de 15 y ponla en horizontal delante del Hub. Es la barra donde van a ir los tres sensores.",
            },
            {
                "titulo": "Los pies",
                "texto": "Fija las dos vigas de 7 en los extremos de la barra, hacia abajo, con dos pasadores cada una. Son las patas.",
            },
            {
                "titulo": "Los sensores",
                "texto": "Monta el sensor de fuerza en el agujero de la izquierda, el de distancia en el centro mirando hacia fuera y el de color en la derecha mirando hacia abajo.",
            },
            {
                "titulo": "La banderita",
                "texto": "Coloca el motor detrás de la barra con el eje de 3 hacia arriba. Esa es la banderita que se levantará cuando un sensor note algo.",
            },
            {
                "titulo": "Los cables",
                "texto": "Conecta el color al D, el de distancia al E, el de fuerza al F y el motor al A. Repasa que cada cable esté en su letra antes de programar.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Espera a que te aprieten",
            "enunciado": "Espera a que se apriete el sensor de fuerza y entonces enciende un dibujo 2 segundos.",
            "pista": "La pregunta del sensor se mete dentro del hueco en forma de rombo del bloque de esperar.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Esperar hasta que", 0, "¿Está presionado? F"),
                b("encender dibujo durante 2 segundos", 0, "cara contenta", "2"),
            ],
            "notas": "El programa se queda parado en la espera. Eso al principio parece que se ha colgado: conviene decirlo.",
        },
        {
            "titulo": "Que no se acerque nadie",
            "enunciado": "Espera a que algo se ponga a menos de 15 centímetros del sensor de distancia y toca una nota.",
            "pista": "El número de centímetros se escribe dentro de la pregunta del sensor.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Esperar hasta que", 0, "¿Está más próximo a? E 15 cm"),
                b("Tocar nota X segundos", 0, "72 · 0.5"),
            ],
            "notas": "Con la mano se prueba en un segundo. Si no salta, casi siempre es que el sensor está mirando al techo.",
        },
        {
            "titulo": "La tarjeta verde",
            "enunciado": "Espera a que el sensor de color vea el color verde y pon el botón central en verde.",
            "pista": "La tarjeta tiene que estar muy cerca del sensor, a un dedo de distancia.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Esperar hasta que", 0, "¿Es de color verde? D"),
                b("poner luz del botón central en rojo", 0, "verde"),
            ],
            "notas": "Que el botón se ponga del mismo color que la tarjeta ayuda a ver que el sensor ha acertado.",
        },
        {
            "titulo": "La banderita",
            "enunciado": "Espera a que se apriete el sensor de fuerza y haz que el motor A suba la banderita 90 grados.",
            "pista": "Noventa grados es un cuarto de vuelta: se elige «grados» en el desplegable del bloque de mover.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Esperar hasta que", 0, "¿Está presionado? F"),
                b("A ir durante 1 rotaciones", 0, "A", "↻", "90", "grados"),
            ],
            "notas": "Primera vez que un sensor manda sobre un motor. Es la idea que sostiene todo el resto del curso.",
        },
    ],
    "test": [
        {
            "pregunta": "¿A qué puerto va el sensor de color en esta plataforma?",
            "opciones": ["Al A", "Al D", "Al E", "Al F"],
            "correcta": 1,
            "explicacion": "Color al D, distancia al E y fuerza al F. Los motores se quedan con el A, el B y el C.",
        },
        {
            "pregunta": "¿Qué hace el bloque «Esperar hasta que»?",
            "opciones": [
                "Espera los segundos que le digas",
                "Se queda parado hasta que la pregunta de dentro es verdad",
                "Repite lo de dentro hasta que sea verdad",
                "Pregunta al alumno y espera su respuesta",
            ],
            "correcta": 1,
            "explicacion": "No cuenta tiempo: vigila una pregunta. Puede estar un segundo o diez minutos.",
        },
        {
            "pregunta": "¿Cómo mide la distancia el sensor de distancia?",
            "opciones": [
                "Con una cinta métrica muy pequeña",
                "Mandando un sonido que no oímos y contando lo que tarda en volver",
                "Con una cámara",
                "Pesando el aire que tiene delante",
            ],
            "correcta": 1,
            "explicacion": "Es un eco: manda un ultrasonido, rebota y vuelve. El tiempo del viaje dice la distancia.",
        },
        {
            "pregunta": "El sensor de color no acierta con una tarjeta. ¿Qué es lo primero que hay que mirar?",
            "opciones": [
                "Que la tarjeta esté muy cerca del sensor",
                "Que el Hub tenga batería",
                "Que el motor esté parado",
                "Que el programa empiece por el sombrero amarillo",
            ],
            "correcta": 0,
            "explicacion": "Tiene que estar a un centímetro o dos. De lejos se confunde, y con sol de lado, también.",
        },
        {
            "pregunta": "Pones «Esperar hasta que ¿Está presionado?» y nunca aprietas el sensor. ¿Qué pasa?",
            "opciones": [
                "El programa salta ese bloque a los 5 segundos",
                "El programa se queda ahí parado para siempre",
                "El Hub da error",
                "El programa vuelve al principio",
            ],
            "correcta": 1,
            "explicacion": "Espera lo que haga falta. Si parece colgado, casi siempre es una espera que no se cumple.",
        },
        {
            "pregunta": "¿Qué forma tiene el hueco donde se mete una pregunta de sensor?",
            "opciones": ["Redonda", "Cuadrada", "De rombo, con las puntas en pico", "No tiene hueco: va encima"],
            "correcta": 2,
            "explicacion": "Las preguntas son bloques de rombo y solo encajan en huecos de rombo. La forma te dice dónde va cada cosa.",
        },
        {
            "pregunta": "¿Qué sensor usarías para una puerta que se abre cuando alguien llega?",
            "opciones": ["El de color", "El de fuerza", "El de distancia", "Ninguno, haría falta una cámara"],
            "correcta": 2,
            "explicacion": "El de distancia nota que alguien se acerca sin tener que tocarlo.",
        },
        {
            "pregunta": "¿Y para un timbre?",
            "opciones": ["El de fuerza", "El de distancia", "El de color", "El giroscopio del Hub"],
            "correcta": 0,
            "explicacion": "Un timbre se aprieta. El sensor de fuerza es exactamente eso: un botón que el programa puede leer.",
        },
    ],
    "practicas": [
        {
            "titulo": "El timbre de la puerta",
            "enunciado": "Espera a que se apriete el sensor de fuerza, toca una nota, escribe «PASA» en la pantalla y sube la banderita 90 grados con el motor A.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Esperar hasta que", 0, "¿Está presionado? F"),
                b("Tocar nota X segundos", 0, "67 · 0.5"),
                b("escribir Hello", 0, "PASA"),
                b("A ir durante 1 rotaciones", 0, "A", "↻", "90", "grados"),
            ],
            "notas": "Cuatro cosas seguidas después de una espera. El orden es lo que se corrige.",
        },
        {
            "titulo": "El control de acceso",
            "enunciado": "Espera a que el sensor de color vea la tarjeta roja, pon el botón central en rojo y después espera a que algo se acerque a menos de 10 centímetros para encender un dibujo 2 segundos.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Esperar hasta que", 0, "¿Es de color rojo? D"),
                b("poner luz del botón central en rojo", 0, "rojo"),
                b("Esperar hasta que", 0, "¿Está más próximo a? E 10 cm"),
                b("encender dibujo durante 2 segundos", 0, "corazón", "2"),
            ],
            "notas": "Dos esperas encadenadas con dos sensores distintos. Hasta que no se cumple la primera, la segunda ni se mira.",
        },
    ],
})


# ───────────────────────────────────────────────────────────────────────────
# 2ª EVALUACIÓN · NIVEL 2 · Bucles, giros controlados y condiciones sencillas
# ───────────────────────────────────────────────────────────────────────────

UNIDADES.append({
    "numero": 4,
    "evaluacion": 2,
    "nivel": 2,
    "titulo": "Repetir sin copiar: bucles de luz y sonido",
    "hardware": "Hub (Matriz de luces 5x5, altavoz y botón central) + 1 Motor mediano",
    "modelo": "Faro giratorio: el motor da vueltas a una pantalla delante del Hub mientras la luz parpadea",
    "bloques": [
        "Repetir bucle",
        "Bucle infinito",
        "encender dibujo",
        "fijar brillo de píxeles al 75 %",
        "Tocar sonido hasta acabar",
    ],
    "reto": "Monta un faro y prográmalo para que gire sin parar, parpadee y avise con un sonido cada vuelta.",
    "video": {
        "titulo": "Bucles: decirlo una vez",
        "duracion": "4 min",
        "escenas": [
            {
                "plano": "Un programa larguísimo en pantalla con el mismo bloque repetido diez veces.",
                "locucion": "Mira este programa. Hace diez veces lo mismo, y para escribirlo has tenido que copiar el mismo bloque diez veces. Si ahora quieres cambiar el tiempo, tienes que cambiarlo diez veces.",
            },
            {
                "plano": "El mismo programa se encoge: los diez bloques se meten dentro de un bloque naranja que pone «repetir 10».",
                "locucion": "Un bucle es decirlo una sola vez. Metes dentro lo que se repite, pones cuántas veces, y ya está. Si cambias algo, lo cambias una vez.",
            },
            {
                "plano": "Dos bucles uno al lado del otro: uno con un número y otro con el símbolo del infinito.",
                "locucion": "Hay dos clases. El de número repite las veces que digas y después el programa sigue hacia abajo. El infinito no termina nunca: lo que haya debajo del bucle no se ejecuta jamás.",
            },
            {
                "plano": "La pantalla del Hub parpadea: dibujo, apagado, dibujo, apagado.",
                "locucion": "Un parpadeo es un bucle con cuatro bloques dentro: encender, esperar, apagar y esperar. Sin las dos esperas no se ve parpadear, se ve encendido a medias.",
            },
            {
                "plano": "El brillo de la pantalla sube y baja.",
                "locucion": "Y hay un bloque para el brillo. Puesto dentro de un bucle, la pantalla respira: sube, baja, sube.",
            },
            {
                "plano": "El faro montado girando sobre la mesa, con el Hub parpadeando dentro.",
                "locucion": "Con eso ya tienes el faro: el motor girando sin parar en un bucle y la luz parpadeando en otro.",
            },
        ],
    },
    "explicaciones": {
        "Repetir bucle": "Repite lo que metas dentro el número de veces que le digas. Cuando termina, el programa sigue por debajo del bucle.",
        "Bucle infinito": "Repite lo de dentro para siempre. Lo que pongas debajo de este bloque no se ejecuta nunca, porque nunca le llega el turno.",
        "encender dibujo": "Enciende un dibujo y lo deja puesto. A diferencia del de «durante», este no lo apaga: lo apagas tú cuando quieras.",
        "fijar brillo de píxeles al 75 %": "Cambia lo fuerte que alumbran las luces, de 0 a 100. Sirve para que la pantalla no deslumbre o para hacer que respire.",
        "Tocar sonido hasta acabar": "Toca uno de los sonidos grabados del Hub y no deja seguir hasta que termina. Es distinto de las notas: aquí eliges un sonido de la lista.",
    },
    "programa": {
        "titulo": "El faro",
        "explicacion": "Dos ideas a la vez: el motor girando y la luz parpadeando. El bucle de dentro hace parpadear cuatro veces; el de fuera lo repite sin parar.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("A fijar velocidad al 75 %", 0, "A", "40"),
            b("A arrancar motor", 0, "A", "↻"),
            b("Bucle infinito"),
            b("encender dibujo", 1, "corazón"),
            b("Esperar X segundos", 1, "0.3"),
            b("apagar píxeles", 1),
            b("Esperar X segundos", 1, "0.3"),
        ],
    },
    "construccion": {
        "piezas": "El Hub, un motor mediano, una viga de 15, dos vigas de 11, cuatro vigas de 7, un eje de 7, doce pasadores y un panel.",
        "pasos": [
            {
                "titulo": "La torre",
                "texto": "Monta un cuadrado con las dos vigas de 11 y dos de las de 7, unido por pasadores en las cuatro esquinas. Déjalo de pie.",
            },
            {
                "titulo": "El Hub dentro",
                "texto": "Encaja el Hub dentro del cuadrado con la pantalla mirando hacia fuera. Es la lámpara del faro.",
            },
            {
                "titulo": "El eje de giro",
                "texto": "Pon el motor encima de la torre, con el eje de 7 hacia abajo pasando por delante de la pantalla.",
            },
            {
                "titulo": "La pantalla giratoria",
                "texto": "Fija el panel al eje con dos pasadores. Al girar, tapa y destapa la pantalla del Hub, que es lo que hace el efecto de faro.",
            },
            {
                "titulo": "Comprobar el giro",
                "texto": "Gira el panel con la mano una vuelta entera. Si roza con la torre, sepáralo un agujero más del Hub.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Cuatro pitidos",
            "enunciado": "Usa un bucle para tocar cuatro veces la misma nota con medio segundo de silencio entre una y otra.",
            "pista": "Dentro del bucle van dos bloques: la nota y la espera. Fuera, nada más.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Repetir bucle", 0, "4"),
                b("Tocar nota X segundos", 1, "60 · 0.3"),
                b("Esperar X segundos", 1, "0.5"),
            ],
            "notas": "Si meten la espera fuera del bucle, suenan las cuatro notas de golpe y luego esperan. Es el error típico y se oye.",
        },
        {
            "titulo": "La pantalla que parpadea",
            "enunciado": "Haz que un dibujo parpadee seis veces: medio segundo encendido y medio segundo apagado.",
            "pista": "Son cuatro bloques dentro del bucle: encender, esperar, apagar y esperar.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Repetir bucle", 0, "6"),
                b("encender dibujo", 1, "corazón"),
                b("Esperar X segundos", 1, "0.5"),
                b("apagar píxeles", 1),
                b("Esperar X segundos", 1, "0.5"),
            ],
            "notas": "Con el bloque de «encender dibujo» sin tiempo hace falta apagarlo a mano. Esa es la gracia del ejercicio.",
        },
        {
            "titulo": "La luz que respira",
            "enunciado": "Enciende un dibujo y, dentro de un bucle de tres vueltas, baja el brillo al 20 %, espera un segundo, súbelo al 100 % y espera otro segundo.",
            "pista": "El dibujo se enciende una sola vez, antes del bucle. Lo que se repite es el cambio de brillo.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("encender dibujo", 0, "corazón"),
                b("Repetir bucle", 0, "3"),
                b("fijar brillo de píxeles al 75 %", 1, "20"),
                b("Esperar X segundos", 1, "1"),
                b("fijar brillo de píxeles al 75 %", 1, "100"),
                b("Esperar X segundos", 1, "1"),
            ],
            "notas": "Lo importante es qué va dentro y qué va fuera: encender el dibujo dentro del bucle no cambia nada, pero sobra.",
        },
        {
            "titulo": "El motor que no para",
            "enunciado": "Mete en un bucle infinito un giro de media vuelta del motor A seguido de una espera de un segundo.",
            "pista": "Con el bucle infinito el programa no termina nunca: para pararlo hay que pulsar el cuadrado de la app.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Bucle infinito"),
                b("A ir durante 1 rotaciones", 1, "A", "↻", "180", "grados"),
                b("Esperar X segundos", 1, "1"),
            ],
            "notas": "Primera vez que ven un programa que no acaba. Conviene enseñarles a pararlo antes de que se agobien.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Para qué sirve un bucle?",
            "opciones": [
                "Para que el programa vaya más rápido",
                "Para repetir unos bloques sin tener que copiarlos",
                "Para que el programa empiece",
                "Para parar el motor",
            ],
            "correcta": 1,
            "explicacion": "Dices una vez lo que se repite y cuántas veces. Si luego cambias algo, lo cambias en un sitio.",
        },
        {
            "pregunta": "¿Qué pasa con los bloques que pones DEBAJO de un bucle infinito?",
            "opciones": [
                "Se ejecutan al final",
                "Se ejecutan a la vez que el bucle",
                "No se ejecutan nunca",
                "Se ejecutan una sola vez, al principio",
            ],
            "correcta": 2,
            "explicacion": "El bucle infinito no termina, así que nunca le llega el turno a lo de abajo.",
        },
        {
            "pregunta": "Quieres cuatro pitidos separados. Pones la nota dentro del bucle y la espera fuera. ¿Qué se oye?",
            "opciones": [
                "Cuatro pitidos separados, como querías",
                "Las cuatro notas casi seguidas y después una espera",
                "Un solo pitido",
                "Nada",
            ],
            "correcta": 1,
            "explicacion": "La espera fuera solo ocurre una vez, al acabar. Lo que separa los pitidos tiene que estar dentro.",
        },
        {
            "pregunta": "Diferencia entre «encender dibujo» y «encender dibujo durante 2 segundos»:",
            "opciones": [
                "Ninguna",
                "El primero se queda puesto hasta que lo apagues; el segundo se apaga solo",
                "El primero es más brillante",
                "El segundo solo vale dentro de un bucle",
            ],
            "correcta": 1,
            "explicacion": "El de «durante» lleva el apagado incluido. El otro no, y por eso sirve para parpadear.",
        },
        {
            "pregunta": "¿Entre qué valores va el brillo de los píxeles?",
            "opciones": ["0 y 10", "0 y 100", "1 y 25", "0 y 360"],
            "correcta": 1,
            "explicacion": "Es un porcentaje, como la velocidad del motor: 0 apagado y 100 a tope.",
        },
        {
            "pregunta": "Un bucle de 3 vueltas con 2 bloques dentro. ¿Cuántos bloques se ejecutan en total?",
            "opciones": ["2", "3", "5", "6"],
            "correcta": 3,
            "explicacion": "Tres vueltas por dos bloques: seis ejecuciones, aunque en pantalla solo veas dos bloques.",
        },
        {
            "pregunta": "¿Qué bloque usarías para un faro que no deja de girar?",
            "opciones": ["Repetir 10", "Bucle infinito", "Esperar hasta que", "Esperar 10 segundos"],
            "correcta": 1,
            "explicacion": "Un faro no tiene número de vueltas: gira hasta que lo apagan. Eso es un bucle infinito.",
        },
        {
            "pregunta": "¿En qué se diferencia «Tocar sonido hasta acabar» de «Tocar nota»?",
            "opciones": [
                "En nada",
                "El sonido es uno grabado de una lista; la nota la eliges por número",
                "El sonido solo funciona con el motor conectado",
                "La nota no se oye",
            ],
            "correcta": 1,
            "explicacion": "Las notas son como las teclas de un piano. Los sonidos son grabaciones que trae el Hub.",
        },
    ],
    "practicas": [
        {
            "titulo": "El faro completo",
            "enunciado": "Arranca el motor A al 40 % y después, en un bucle infinito, enciende un dibujo, espera medio segundo, apágalo y espera otro medio segundo.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("A fijar velocidad al 75 %", 0, "A", "40"),
                b("A arrancar motor", 0, "A", "↻"),
                b("Bucle infinito"),
                b("encender dibujo", 1, "corazón"),
                b("Esperar X segundos", 1, "0.5"),
                b("apagar píxeles", 1),
                b("Esperar X segundos", 1, "0.5"),
            ],
            "notas": "El motor se arranca antes del bucle, no dentro. Dentro se reiniciaría en cada vuelta.",
        },
        {
            "titulo": "La alarma",
            "enunciado": "Repite cinco veces: pon el botón central en rojo, toca una nota, espera medio segundo, pon el botón en apagado y espera otro medio segundo.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Repetir bucle", 0, "5"),
                b("poner luz del botón central en rojo", 1, "rojo"),
                b("Tocar nota X segundos", 1, "72 · 0.2"),
                b("Esperar X segundos", 1, "0.5"),
                b("poner luz del botón central en rojo", 1, "apagado"),
                b("Esperar X segundos", 1, "0.5"),
            ],
            "notas": "Cinco bloques dentro del bucle. Si alguno se queda fuera, la alarma pierde el ritmo y se nota.",
        },
    ],
})


UNIDADES.append({
    "numero": 5,
    "video_de": 6,
    "evaluacion": 2,
    "nivel": 2,
    "titulo": "Conducir: dos motores y el girosensor",
    "hardware": "Hub (Giroscopio, matriz de luces 5x5 y altavoz) + 2 Motor mediano",
    "modelo": "Base de conducción de dos ruedas con rueda loca detrás",
    "bloques": [
        "fijar A+B como motores en movimiento",
        "fijar velocidad de movimiento al 50 %",
        "mover ↑ durante 10 rotaciones",
        "mover derecha: 30 durante 10 rotaciones",
        "Fijar el ángulo de guiñada del Hub a 0",
    ],
    "reto": "Monta una base de conducción y hazle recorrer un cuadrado volviendo al punto de partida.",
    "video": {
        "titulo": "Dos motores que trabajan juntos",
        "duracion": "5 min",
        "escenas": [
            {
                "plano": "La base de conducción montada, vista desde arriba: dos ruedas grandes delante y una pequeña detrás.",
                "locucion": "Esta es la base de conducción: dos motores, uno por rueda, y una rueda loca detrás que solo sirve para que no se caiga.",
            },
            {
                "plano": "Las dos ruedas giran hacia delante a la vez. El robot avanza recto.",
                "locucion": "Si los dos motores giran igual, el robot va recto. Pero manejarlos por separado es un lío, así que SPIKE tiene bloques que mandan sobre los dos a la vez.",
            },
            {
                "plano": "El bloque «fijar A+B como motores en movimiento» resaltado al principio del programa.",
                "locucion": "Lo primero del programa, siempre, es decirle qué dos motores forman la base. Si se te olvida, los bloques de mover no saben a quién mandar.",
            },
            {
                "plano": "Una rueda gira y la otra está parada. El robot gira sobre sí mismo.",
                "locucion": "Para girar, los motores hacen cosas distintas. El bloque de giro lleva un número de dirección: 0 es recto, 100 es girar del todo a la derecha y −100, a la izquierda.",
            },
            {
                "plano": "El Hub se inclina y gira en la mano. Un número en la pantalla cambia con el giro.",
                "locucion": "Y dentro del Hub hay un giroscopio, que sabe cuánto has girado desde que empezaste. El ángulo de guiñada es el del giro en plano, como el de una veleta.",
            },
            {
                "plano": "El bloque de poner el ángulo a cero, y después el robot girando 90 grados exactos.",
                "locucion": "Antes de usarlo se pone a cero, que es como decir «desde aquí empiezo a contar». A partir de ahí el robot sabe hacia dónde mira. En la unidad 8 lo usarás para girar exacto.",
            },
        ],
    },
    "explicaciones": {
        "fijar A+B como motores en movimiento": "Dice qué dos motores forman la base de conducción. Va al principio del programa: sin él, los demás bloques de movimiento no saben a qué motores mandar.",
        "fijar velocidad de movimiento al 50 %": "La velocidad de la base entera, de 0 a 100. Para girar con precisión conviene bajarla: cuanto más despacio, menos se pasa.",
        "mover ↑ durante 10 rotaciones": "Mueve la base hacia delante o hacia atrás la cantidad que le digas, y para sola. El desplegable cambia entre rotaciones, grados, segundos y centímetros.",
        "mover derecha: 30 durante 10 rotaciones": "Lo mismo, pero torciendo. El número de dirección va de −100 a 100: 0 es recto, 100 gira del todo a la derecha y −100 a la izquierda.",
        "Fijar el ángulo de guiñada del Hub a 0": "Pone a cero el contador de giro del giroscopio. Es decirle al robot «desde aquí, estás mirando al frente».",
    },
    "programa": {
        "titulo": "El cuadrado",
        "explicacion": "Un cuadrado son cuatro veces lo mismo: avanzar un tramo y girar un cuarto de vuelta. Con un bucle se escribe una sola vez.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("fijar A+B como motores en movimiento", 0, "A+B"),
            b("fijar velocidad de movimiento al 50 %", 0, "40"),
            b("Fijar el ángulo de guiñada del Hub a 0"),
            b("Repetir bucle", 0, "4"),
            b("mover ↑ durante 10 rotaciones", 1, "↑", "2.3", "rotaciones"),
            b("mover derecha: 30 durante 10 rotaciones", 1, "derecha: 100", "0.5", "rotaciones"),
        ],
    },
    "construccion": {
        "piezas": "El Hub, dos motores medianos con sus cables, dos ruedas con neumático, dos ejes de 5, dos marcos Technic, cuatro vigas de 11, una rueda pequeña para detrás y doce pasadores.",
        "pasos": [
            {
                "titulo": "El chasis",
                "texto": "Une los dos marcos Technic en paralelo con dos vigas de 11 cruzadas. Esta es la plataforma donde va todo lo demás.",
            },
            {
                "titulo": "Los motores",
                "texto": "Encaja un motor a cada lado del chasis, con los ejes hacia fuera y los dos a la misma altura. Si uno queda más bajo, el robot irá torcido.",
            },
            {
                "titulo": "Las ruedas",
                "texto": "Mete un eje de 5 en cada motor y pon una rueda en cada punta. Empuja hasta el fondo para que no bailen.",
            },
            {
                "titulo": "El apoyo de atrás",
                "texto": "Monta la rueda pequeña en la parte de atrás del chasis con las dos vigas de 11 que quedan. Tiene que tocar el suelo sin levantar las ruedas grandes.",
            },
            {
                "titulo": "El Hub y los cables",
                "texto": "Pon el Hub encima del chasis, con el botón mirando hacia arriba. Conecta el motor izquierdo al A y el derecho al B, en ese orden.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Cruza una baldosa",
            "enunciado": "Pon el robot con las ruedas sobre una junta del suelo. Prepara la base con los motores A y B y hazla avanzar 2,3 rotaciones, que es lo que mide una baldosa.",
            "pista": "Una baldosa son 40 cm y una vuelta de rueda unos 17,5: de ahí salen las 2,3. Si se queda corto o se pasa, cambia ese número hasta que pare justo en la junta.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "2.3", "rotaciones"),
            ],
            "notas": "Tres bloques. Si se olvidan el de fijar motores, el robot no se mueve y no da ningún error: ese es el aprendizaje.",
        },
        {
            "titulo": "Ida y vuelta de dos baldosas",
            "enunciado": "Avanza dos baldosas, que son 4,6 rotaciones, espera un segundo y vuelve a la junta de salida con otras 4,6.",
            "pista": "Para ir hacia atrás se cambia la flecha del desplegable, no el número.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "4.6", "rotaciones"),
                b("Esperar X segundos", 0, "1"),
                b("mover ↑ durante 10 rotaciones", 0, "↓", "4.6", "rotaciones"),
            ],
            "notas": "Debería volver casi al mismo sitio. Si se desvía, es que una rueda patina o los motores están a distinta altura.",
        },
        {
            "titulo": "Media vuelta",
            "enunciado": "Pon el robot alineado con una junta del suelo. Baja la velocidad al 30 % y haz que gire sobre sí mismo hasta quedar mirando hacia atrás, otra vez alineado con esa misma junta.",
            "pista": "Para girar sobre el sitio, la dirección se pone al 100. Prueba cuántas rotaciones hacen falta.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar velocidad de movimiento al 50 %", 0, "30"),
                b("mover derecha: 30 durante 10 rotaciones", 0, "derecha: 100", "1", "rotaciones"),
            ],
            "notas": "El número de rotaciones depende de las ruedas, así que se ajusta probando. Eso también es programar.",
        },
        {
            "titulo": "El cuadrado de una baldosa",
            "enunciado": "Pon el robot en una cruceta del suelo. Con un bucle de cuatro vueltas, haz que avance una baldosa (2,3 rotaciones) y gire un cuarto de vuelta, y acaba poniendo el botón central en verde.",
            "pista": "Dentro del bucle van dos bloques: avanzar y girar. El color del botón va fuera, al final.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar velocidad de movimiento al 50 %", 0, "40"),
                b("Repetir bucle", 0, "4"),
                b("mover ↑ durante 10 rotaciones", 1, "↑", "2.3", "rotaciones"),
                b("mover derecha: 30 durante 10 rotaciones", 1, "derecha: 100", "0.5", "rotaciones"),
                b("poner luz del botón central en rojo", 0, "verde"),
            ],
            "notas": "El cuadrado nunca sale perfecto a la primera: se ajusta el giro hasta que cierra. Es el ejercicio clásico de conducción.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Qué bloque tiene que ir el primero en un programa de conducción?",
            "opciones": [
                "«fijar velocidad de movimiento»",
                "«fijar A+B como motores en movimiento»",
                "«mover hacia delante»",
                "«Fijar el ángulo de guiñada a 0»",
            ],
            "correcta": 1,
            "explicacion": "Hasta que no dices qué dos motores son la base, los bloques de mover no saben a quién mandar.",
        },
        {
            "pregunta": "En el bloque de girar, ¿qué significa la dirección 0?",
            "opciones": ["Parado", "Recto", "Giro a la izquierda del todo", "Media vuelta"],
            "correcta": 1,
            "explicacion": "La dirección va de −100 a 100: 0 es recto, los positivos tuercen a la derecha y los negativos a la izquierda.",
        },
        {
            "pregunta": "¿Para qué sirve el giroscopio del Hub?",
            "opciones": [
                "Para medir la distancia a los obstáculos",
                "Para saber cuánto ha girado el robot",
                "Para medir la velocidad de los motores",
                "Para ver de qué color es el suelo",
            ],
            "correcta": 1,
            "explicacion": "Es el sentido del equilibrio del Hub: sabe cómo está orientado y cuánto ha girado desde que lo pusiste a cero.",
        },
        {
            "pregunta": "¿Qué hace «Fijar el ángulo de guiñada del Hub a 0»?",
            "opciones": [
                "Gira el robot hasta que mire al norte",
                "Pone el contador de giro a cero donde esté el robot en ese momento",
                "Para los motores",
                "Endereza las ruedas",
            ],
            "correcta": 1,
            "explicacion": "No mueve nada: solo marca desde dónde empieza a contar. Es como poner a cero un cronómetro.",
        },
        {
            "pregunta": "El robot se va torciendo cuando debería ir recto. ¿Qué miras primero?",
            "opciones": [
                "Que los dos motores estén a la misma altura y las ruedas bien metidas",
                "Que la batería esté llena",
                "Que el programa empiece por el sombrero amarillo",
                "Que el sensor de color esté conectado",
            ],
            "correcta": 0,
            "explicacion": "Casi siempre es mecánica, no programación: un motor más bajo, una rueda suelta o un cable rozando.",
        },
        {
            "pregunta": "¿Por qué conviene bajar la velocidad para girar?",
            "opciones": [
                "Porque los motores se rompen a toda velocidad",
                "Porque deprisa el robot se pasa de giro y patina",
                "Porque el bloque de girar no funciona al 100 %",
                "No conviene: se gira mejor deprisa",
            ],
            "correcta": 1,
            "explicacion": "A tope las ruedas resbalan y el robot se pasa. Despacio el giro sale repetible, que es lo que se busca.",
        },
        {
            "pregunta": "¿Cuántas veces se repite el cuerpo de un cuadrado hecho con bucle?",
            "opciones": ["2", "3", "4", "8"],
            "correcta": 2,
            "explicacion": "Un cuadrado tiene cuatro lados y cuatro esquinas: cuatro veces avanzar y girar.",
        },
        {
            "pregunta": "¿A qué puertos van los dos motores de la base en esta plataforma?",
            "opciones": ["A y B", "D y E", "A y F", "B y C"],
            "correcta": 0,
            "explicacion": "Los motores ocupan A, B y C por orden. En una base de dos ruedas, el izquierdo al A y el derecho al B.",
        },
    ],
    "practicas": [
        {
            "titulo": "El circuito cuadrado",
            "enunciado": "Pon el robot en una cruceta del suelo y prepara la base con la velocidad al 40 %. Pon el ángulo de guiñada a cero y, con un bucle de cuatro vueltas, avanza dos baldosas (4,6 rotaciones) y gira un cuarto de vuelta. Comprueba al acabar si ha vuelto a la cruceta de salida.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar velocidad de movimiento al 50 %", 0, "40"),
                b("Fijar el ángulo de guiñada del Hub a 0"),
                b("Repetir bucle", 0, "4"),
                b("mover ↑ durante 10 rotaciones", 1, "↑", "4.6", "rotaciones"),
                b("mover derecha: 30 durante 10 rotaciones", 1, "derecha: 100", "0.5", "rotaciones"),
            ],
            "notas": "El bloque del giroscopio todavía no cambia nada aquí: se pone para coger la costumbre antes de la unidad 8.",
        },
        {
            "titulo": "La entrega a domicilio",
            "enunciado": "Haz un reparto por la cuadrícula del suelo: avanza dos baldosas (4,6 rotaciones); gira un cuarto de vuelta a la derecha; avanza una baldosa más (2,3); toca una nota al llegar; vuelve hacia atrás esa baldosa.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar velocidad de movimiento al 50 %", 0, "40"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "4.6", "rotaciones"),
                b("mover derecha: 30 durante 10 rotaciones", 0, "derecha: 100", "0.5", "rotaciones"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "2.3", "rotaciones"),
                b("Tocar nota X segundos", 0, "67 · 0.5"),
                b("mover ↑ durante 10 rotaciones", 0, "↓", "2.3", "rotaciones"),
            ],
            "notas": "Un recorrido con forma de L. Mezcla movimiento y sonido, y el orden es lo que se corrige.",
        },
    ],
})


UNIDADES.append({
    "numero": 6,
    "video_de": 7,
    "evaluacion": 2,
    "nivel": 2,
    "titulo": "Si... entonces: el sensor decide",
    "hardware": "Hub (Matriz de luces 5x5 y altavoz) + 2 Motor mediano + Sensor de color + Sensor de distancia + Sensor de fuerza",
    "modelo": "Vehículo vigilante: una base de conducción con el sensor de distancia delante y el de color mirando al suelo",
    "bloques": [
        "Si... entonces...",
        "empezar a mover a ↑",
        "parar movimiento",
        "Distancia",
        "Luz reflejada",
    ],
    "reto": "Haz un vehículo que patrulle y reaccione: que frene ante un obstáculo, avise al ver una línea y arranque cuando lo aprietes.",
    "video": {
        "titulo": "Preguntar en vez de esperar",
        "duracion": "5 min",
        "escenas": [
            {
                "plano": "Un programa con «Esperar hasta que» y el robot quieto mucho rato.",
                "locucion": "Hasta ahora, para usar un sensor esperabas. El programa se quedaba parado hasta que pasaba algo. Eso sirve para empezar, pero un robot que patrulla no puede estar parado esperando.",
            },
            {
                "plano": "El bloque «Si... entonces...» con la boca abierta y bloques cayendo dentro.",
                "locucion": "«Si... entonces» es distinto. Mira la pregunta una sola vez, al pasar por ahí. Si es verdad, hace lo de dentro; si no, se lo salta y sigue. No espera a nadie.",
            },
            {
                "plano": "Un «Si... entonces» dentro de un bucle infinito. El robot avanza y mira a cada vuelta.",
                "locucion": "Por eso casi siempre va dentro de un bucle: así la pregunta se repasa una y otra vez mientras el robot hace su trabajo.",
            },
            {
                "plano": "Los bloques «empezar a mover» y «parar movimiento», uno frente al otro.",
                "locucion": "Y para que el robot pueda vigilar mientras anda, los bloques de movimiento cambian: «empezar a mover» lo pone en marcha y deja seguir el programa. El robot anda y tú vigilas.",
            },
            {
                "plano": "El número de la distancia bajando mientras una mano se acerca.",
                "locucion": "También hay bloques que no preguntan: dan el número. «Distancia» vale los centímetros que hay delante, y «luz reflejada», lo clara que es la superficie, de 0 a 100.",
            },
            {
                "plano": "El robot avanzando; al llegar a 20 cm de una caja, se para y pita.",
                "locucion": "Con esas tres piezas ya tienes un robot que vigila: arranca, repite la comprobación y, si se cumple, actúa.",
            },
        ],
    },
    "explicaciones": {
        "Si... entonces...": "Mira la pregunta una vez. Si es verdad, ejecuta lo que lleva dentro; si no, se lo salta. No espera: comprueba y sigue.",
        "empezar a mover a ↑": "Pone la base en marcha y deja seguir el programa. El robot se queda andando mientras el programa hace otras cosas, como vigilar un sensor.",
        "parar movimiento": "Para la base de conducción. Es la pareja de «empezar a mover»: sin él, el robot no se detiene.",
        "Distancia": "No es una pregunta, es un número: los centímetros que el sensor tiene delante. Se mete en huecos redondos, por ejemplo dentro de una comparación.",
        "Luz reflejada": "Otro número, de 0 a 100: cuánta luz le devuelve la superficie. El negro refleja poco y el blanco mucho, así que sirve para ver líneas.",
    },
    "programa": {
        "titulo": "El vehículo que frena solo",
        "explicacion": "El robot arranca y se queda andando. Dentro del bucle, la pregunta se repasa continuamente: en cuanto hay algo a menos de 20 centímetros, para y avisa.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("fijar A+B como motores en movimiento", 0, "A+B"),
            b("fijar velocidad de movimiento al 50 %", 0, "35"),
            b("empezar a mover a ↑", 0, "↑"),
            b("Bucle infinito"),
            b("Si... entonces...", 1, "¿Está más próximo a? E 20 cm"),
            b("parar movimiento", 2),
            b("Tocar nota X segundos", 2, "60 · 0.5"),
        ],
    },
    "construccion": {
        "piezas": "La base de conducción de la unidad 5, el sensor de distancia, el sensor de color, el sensor de fuerza, dos vigas de 7, una viga angular y seis pasadores.",
        "pasos": [
            {
                "titulo": "El soporte de delante",
                "texto": "Monta las dos vigas de 7 en la parte delantera del chasis, hacia fuera, como dos brazos.",
            },
            {
                "titulo": "El sensor de distancia",
                "texto": "Encaja el sensor de distancia entre los dos brazos, mirando al frente y a la altura de una caja de zapatos.",
            },
            {
                "titulo": "El sensor de color",
                "texto": "Pon la viga angular bajo el chasis y fija en ella el sensor de color mirando al suelo, a un dedo de altura.",
            },
            {
                "titulo": "El sensor de fuerza",
                "texto": "Coloca el sensor de fuerza arriba del todo, donde se pueda apretar sin tocar las ruedas.",
            },
            {
                "titulo": "Los cables",
                "texto": "Color al D, distancia al E, fuerza al F y los motores al A y al B. Recoge el cable sobrante hacia arriba para que no roce las ruedas.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Frena ante el obstáculo",
            "enunciado": "Pon una caja sobre una junta, tres baldosas por delante. Arranca la base hacia delante y, dentro de un bucle infinito, comprueba si hay algo a menos de 20 centímetros: si lo hay, para el movimiento.",
            "pista": "El «Si... entonces» va dentro del bucle, y el «parar movimiento», dentro del «Si».",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("empezar a mover a ↑", 0, "↑"),
                b("Bucle infinito"),
                b("Si... entonces...", 1, "¿Está más próximo a? E 20 cm"),
                b("parar movimiento", 2),
            ],
            "notas": "Tres niveles de sangría. Es la primera vez que ven un bloque dentro de otro dentro de otro.",
        },
        {
            "titulo": "El arranque con botón",
            "enunciado": "Espera a que se apriete el sensor de fuerza y entonces arranca la base hacia delante una baldosa, que son 2,3 rotaciones.",
            "pista": "Aquí sí vale esperar: el robot no tiene nada que hacer hasta que lo aprieten.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("Esperar hasta que", 0, "¿Está presionado? F"),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "2.3", "rotaciones"),
            ],
            "notas": "Sirve para distinguir cuándo toca esperar y cuándo toca preguntar. Aquí no hay nada que vigilar mientras tanto.",
        },
        {
            "titulo": "La línea del suelo",
            "enunciado": "Dentro de un bucle infinito, comprueba si el sensor de color ve negro: si lo ve, toca una nota y enciende un dibujo 1 segundo.",
            "pista": "La pregunta del color va dentro del «Si... entonces», y los dos bloques de aviso, dentro también.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Bucle infinito"),
                b("Si... entonces...", 1, "¿Es de color negro? D"),
                b("Tocar nota X segundos", 2, "72 · 0.3"),
                b("encender dibujo durante 2 segundos", 2, "corazón", "1"),
            ],
            "notas": "Pasando una cinta aislante negra por debajo se ve al momento. Si no salta, el sensor está demasiado alto.",
        },
        {
            "titulo": "Las dos vigilancias",
            "enunciado": "En un mismo bucle infinito, pon dos comprobaciones seguidas: si algo está a menos de 15 centímetros, para el movimiento, y si se aprieta el sensor de fuerza, arranca hacia delante.",
            "pista": "Son dos «Si... entonces» seguidos, los dos dentro del mismo bucle y al mismo nivel.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("Bucle infinito"),
                b("Si... entonces...", 1, "¿Está más próximo a? E 15 cm"),
                b("parar movimiento", 2),
                b("Si... entonces...", 1, "¿Está presionado? F"),
                b("empezar a mover a ↑", 2, "↑"),
            ],
            "notas": "Dos preguntas en el mismo bucle: el robot vigila dos cosas a la vez. Es la idea que hace falta para el proyecto de la unidad 9.",
        },
    ],
    "test": [
        {
            "pregunta": "¿En qué se diferencian «Esperar hasta que» y «Si... entonces»?",
            "opciones": [
                "En nada",
                "«Esperar» para el programa hasta que se cumpla; «Si» mira una vez y sigue",
                "«Si» solo funciona con el sensor de color",
                "«Esperar» se puede meter dentro de un bucle y «Si» no",
            ],
            "correcta": 1,
            "explicacion": "Uno detiene el programa; el otro lo comprueba de pasada. Por eso «Si» suele ir dentro de un bucle.",
        },
        {
            "pregunta": "¿Por qué un «Si... entonces» suele ir dentro de un bucle?",
            "opciones": [
                "Porque si no, da error",
                "Porque solo se mira una vez y el robot necesita vigilar todo el rato",
                "Porque los bucles van más rápido",
                "Porque es la única forma de usar un sensor",
            ],
            "correcta": 1,
            "explicacion": "Fuera del bucle, la pregunta se mira una vez y ya está. Dentro, se repasa en cada vuelta.",
        },
        {
            "pregunta": "¿Qué diferencia hay entre «mover hacia delante 3 rotaciones» y «empezar a mover»?",
            "opciones": [
                "El primero recorre una cantidad y para; el segundo arranca y deja seguir el programa",
                "El segundo es más rápido",
                "El primero solo vale con un motor",
                "Ninguna",
            ],
            "correcta": 0,
            "explicacion": "Mientras «mover durante» está en marcha, el programa está parado ahí. Con «empezar a mover», el programa sigue y puede vigilar.",
        },
        {
            "pregunta": "¿Qué devuelve el bloque «Luz reflejada»?",
            "opciones": [
                "Verdad o mentira",
                "Un número de 0 a 100: cuánta luz devuelve la superficie",
                "El nombre del color",
                "Los centímetros hasta el suelo",
            ],
            "correcta": 1,
            "explicacion": "Es un número, no una pregunta. Por eso es redondo y va en huecos redondos.",
        },
        {
            "pregunta": "El negro y el blanco, en luz reflejada:",
            "opciones": [
                "El negro da un número alto y el blanco bajo",
                "El negro da un número bajo y el blanco alto",
                "Los dos dan lo mismo",
                "Depende del motor",
            ],
            "correcta": 1,
            "explicacion": "El negro absorbe la luz y devuelve poco; el blanco la devuelve casi toda.",
        },
        {
            "pregunta": "Arrancas la base con «empezar a mover» y el programa acaba. ¿Qué hace el robot?",
            "opciones": ["Se para solo", "Sigue andando", "Da marcha atrás", "Da error"],
            "correcta": 1,
            "explicacion": "Igual que el motor suelto: si no pones «parar movimiento», no para.",
        },
        {
            "pregunta": "Quieres que el robot vigile dos cosas distintas mientras anda. ¿Cómo lo haces?",
            "opciones": [
                "Con dos bucles, uno detrás del otro",
                "Con dos «Si... entonces» seguidos dentro del mismo bucle",
                "No se puede",
                "Con un «Esperar hasta que» para cada uno",
            ],
            "correcta": 1,
            "explicacion": "En cada vuelta del bucle se repasan las dos preguntas, una detrás de otra.",
        },
        {
            "pregunta": "¿Qué forma tiene el bloque «Distancia»?",
            "opciones": [
                "De rombo, como las preguntas",
                "Redondeado, como los números",
                "De sombrero",
                "Rectangular, como las acciones",
            ],
            "correcta": 1,
            "explicacion": "Devuelve un número, así que es redondeado y encaja en huecos redondos.",
        },
    ],
    "practicas": [
        {
            "titulo": "El vehículo vigilante",
            "enunciado": "Pon una caja tres baldosas por delante y prepara la base al 35 %. Arráncala hacia delante y, en un bucle infinito, comprueba si hay algo a menos de 20 centímetros: si lo hay, para el movimiento y toca una nota. Mira en qué baldosa se ha quedado y si para siempre en la misma.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar velocidad de movimiento al 50 %", 0, "35"),
                b("empezar a mover a ↑", 0, "↑"),
                b("Bucle infinito"),
                b("Si... entonces...", 1, "¿Está más próximo a? E 20 cm"),
                b("parar movimiento", 2),
                b("Tocar nota X segundos", 2, "60 · 0.5"),
            ],
            "notas": "Lo que se corrige es la sangría: el «Si» dentro del bucle y las dos acciones dentro del «Si».",
        },
        {
            "titulo": "El patrullero de tres sentidos",
            "enunciado": "En un bucle infinito pon tres comprobaciones: si se aprieta el sensor de fuerza, arranca hacia delante; si hay algo a menos de 15 centímetros, para el movimiento; y si el sensor de color ve rojo, pon el botón central en rojo.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("Bucle infinito"),
                b("Si... entonces...", 1, "¿Está presionado? F"),
                b("empezar a mover a ↑", 2, "↑"),
                b("Si... entonces...", 1, "¿Está más próximo a? E 15 cm"),
                b("parar movimiento", 2),
                b("Si... entonces...", 1, "¿Es de color rojo? D"),
                b("poner luz del botón central en rojo", 2, "rojo"),
            ],
            "notas": "Los tres sensores en un solo programa, cada uno con su respuesta. Las tres preguntas van al mismo nivel dentro del bucle.",
        },
    ],
})


# ───────────────────────────────────────────────────────────────────────────
# 3ª EVALUACIÓN · NIVEL 3 · Dos caminos, giros medidos y proyectos completos
# ───────────────────────────────────────────────────────────────────────────

UNIDADES.append({
    "numero": 7,
    "video_de": 8,
    "evaluacion": 3,
    "nivel": 3,
    "titulo": "Dos caminos: si no se cumple, haz otra cosa",
    "hardware": "Hub (Matriz de luces 5x5 y altavoz) + 2 Motor mediano + Sensor de color",
    "modelo": "Clasificador de tarjetas: una rampa con el sensor de color y una compuerta que las manda a un lado o a otro",
    "bloques": [
        "Si... entonces... Si no...",
        "Repetir bucle hasta",
        "fijar píxel en 1 , 1 al 100 %",
        "¿Es la luz reflejada...?",
    ],
    "reto": "Monta un clasificador que mande las tarjetas a un lado o a otro según su color, y que lo diga en la pantalla.",
    "video": {
        "titulo": "Cuando hay dos respuestas",
        "duracion": "5 min",
        "escenas": [
            {
                "plano": "Dos bloques «Si... entonces» seguidos, con preguntas contrarias.",
                "locucion": "Con lo que sabes, para hacer dos cosas distintas tienes que poner dos preguntas contrarias: si es verde, abre; si no es verde, cierra. Funciona, pero se repite y se puede equivocar.",
            },
            {
                "plano": "El bloque «Si... entonces... Si no...» con sus dos bocas.",
                "locucion": "Este bloque tiene dos bocas. La pregunta se mira una sola vez: si es verdad, pasa por la boca de arriba, y si no, por la de abajo. Nunca por las dos.",
            },
            {
                "plano": "Una tarjeta verde baja por la rampa y la compuerta se abre a la izquierda; una roja, a la derecha.",
                "locucion": "Esto es exactamente un clasificador. Una pregunta, dos caminos, y cada tarjeta se va por el suyo.",
            },
            {
                "plano": "El bloque «Repetir bucle hasta» con una pregunta dentro.",
                "locucion": "Y hay un bucle nuevo. El de antes repetía un número de veces. Este repite hasta que se cumpla una condición: no sabes cuántas vueltas va a dar, y da igual.",
            },
            {
                "plano": "La pantalla encendiendo un solo punto que se mueve por la cuadrícula.",
                "locucion": "Para la pantalla hay un bloque que enciende un píxel suelto. Le das la fila, la columna y el brillo. Con eso puedes hacer una barra que crece.",
            },
            {
                "plano": "El clasificador funcionando con cuatro tarjetas seguidas.",
                "locucion": "Junta las tres cosas y tienes una máquina que trabaja sola hasta que se acaban las tarjetas.",
            },
        ],
    },
    "explicaciones": {
        "Si... entonces... Si no...": "Dos caminos y una sola pregunta. Si es verdad, hace lo de la boca de arriba; si es mentira, lo de la boca de abajo. Siempre hace uno de los dos.",
        "Repetir bucle hasta": "Repite lo de dentro hasta que la pregunta sea verdad. No sabes cuántas vueltas dará: las que hagan falta.",
        "fijar píxel en 1 , 1 al 100 %": "Enciende una sola luz de la pantalla. Le dices la fila, la columna y el brillo. Las filas y columnas van del 1 al 5.",
        "¿Es la luz reflejada...?": "Pregunta sobre el número de luz reflejada: sirve para distinguir claro de oscuro cuando el color exacto no importa.",
    },
    "programa": {
        "titulo": "El clasificador",
        "explicacion": "Una pregunta, dos respuestas. La compuerta se mueve a un lado o al otro según el color, y la pantalla dice lo que ha hecho.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("Bucle infinito"),
            b("Esperar hasta que", 1, "¿Está más próximo a? E 5 cm"),
            b("Si... entonces... Si no...", 1, "¿Es de color verde? D"),
            b("escribir Hello", 2, "SI"),
            b("A ir durante 1 rotaciones", 2, "A", "↻", "90", "grados"),
            b("escribir Hello", 2, "NO"),
            b("A ir durante 1 rotaciones", 2, "A", "↺", "90", "grados"),
        ],
    },
    "construccion": {
        "piezas": "El Hub, dos motores medianos, el sensor de color, dos vigas de 15, cuatro vigas de 11, dos vigas angulares, un panel, un eje de 5 y doce pasadores.",
        "pasos": [
            {
                "titulo": "La rampa",
                "texto": "Pon las dos vigas de 15 en paralelo e inclinadas, apoyadas en dos vigas de 11 por un extremo. Las tarjetas bajarán por ahí.",
            },
            {
                "titulo": "El sensor",
                "texto": "Coloca el sensor de color a mitad de la rampa, mirando hacia la superficie por la que pasan las tarjetas, a un dedo de distancia.",
            },
            {
                "titulo": "La compuerta",
                "texto": "Monta el primer motor al final de la rampa, con el eje de 5 cruzado, y fija el panel al eje. Al girar, el panel desvía la tarjeta a un lado o a otro.",
            },
            {
                "titulo": "Los cajetines",
                "texto": "Con las vigas angulares y las vigas de 11 que quedan, haz dos paredes bajo la compuerta: una a cada lado. Son los dos montones.",
            },
            {
                "titulo": "Ajuste",
                "texto": "Deja caer una tarjeta con el motor parado. Si no llega al sensor, sube un poco más la rampa por el extremo alto.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Verde o no verde",
            "enunciado": "Usa un «Si... entonces... Si no...» con el sensor de color: si ve verde, escribe SI en la pantalla, y en caso contrario escribe NO.",
            "pista": "Una sola pregunta y dos bocas: no hagas dos bloques separados.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Si... entonces... Si no...", 0, "¿Es de color verde? D"),
                b("escribir Hello", 1, "SI"),
                b("escribir Hello", 1, "NO"),
            ],
            "notas": "Los dos bloques de escribir van al mismo nivel: el primero en la boca de arriba y el segundo en la de abajo.",
        },
        {
            "titulo": "Claro u oscuro",
            "enunciado": "Dentro de un bucle infinito, comprueba la luz reflejada: si es oscuro, pon el botón central en rojo, y si no, ponlo en blanco.",
            "pista": "Aquí no importa el color exacto, solo si refleja mucha o poca luz.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Bucle infinito"),
                b("Si... entonces... Si no...", 1, "¿Es la luz reflejada < 30? D"),
                b("poner luz del botón central en rojo", 2, "rojo"),
                b("poner luz del botón central en rojo", 2, "blanco"),
            ],
            "notas": "Pasando la mano por debajo se ve cambiar el botón al momento. El umbral de 30 se ajusta según la mesa.",
        },
        {
            "titulo": "Hasta que se acerque",
            "enunciado": "Usa un «Repetir bucle hasta» para avanzar media rotación una y otra vez hasta que haya algo a menos de 10 centímetros, y después para el movimiento.",
            "pista": "La pregunta del bucle es la condición de parada: cuando se cumple, el bucle termina.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("Repetir bucle hasta", 0, "¿Está más próximo a? E 10 cm"),
                b("mover ↑ durante 10 rotaciones", 1, "↑", "0.5", "rotaciones"),
                b("parar movimiento", 0),
            ],
            "notas": "Se acerca a saltitos. Es menos elegante que «empezar a mover», pero deja ver muy bien cuándo se cumple la condición.",
        },
        {
            "titulo": "La barra que crece",
            "enunciado": "Enciende los cinco píxeles de la fila 3 uno a uno, de la columna 1 a la 5, con medio segundo entre cada uno.",
            "pista": "Son cinco bloques de píxel seguidos, cambiando solo el número de la columna.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar píxel en 1 , 1 al 100 %", 0, "3", "1", "100"),
                b("Esperar X segundos", 0, "0.5"),
                b("fijar píxel en 1 , 1 al 100 %", 0, "3", "2", "100"),
                b("Esperar X segundos", 0, "0.5"),
                b("fijar píxel en 1 , 1 al 100 %", 0, "3", "3", "100"),
                b("Esperar X segundos", 0, "0.5"),
                b("fijar píxel en 1 , 1 al 100 %", 0, "3", "4", "100"),
                b("Esperar X segundos", 0, "0.5"),
                b("fijar píxel en 1 , 1 al 100 %", 0, "3", "5", "100"),
            ],
            "notas": "Repetitivo a propósito: deja la puerta abierta a preguntar en clase cómo se haría con un bucle y una variable, que es de 2º.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Cuántas bocas tiene el bloque «Si... entonces... Si no...»?",
            "opciones": ["Una", "Dos", "Tres", "Las que quieras"],
            "correcta": 1,
            "explicacion": "Dos: la de arriba para cuando la pregunta es verdad y la de abajo para cuando es mentira.",
        },
        {
            "pregunta": "Con «Si... entonces... Si no...», ¿cuántas bocas se ejecutan en cada pasada?",
            "opciones": ["Las dos", "Solo una", "Ninguna si la pregunta es mentira", "Depende del sensor"],
            "correcta": 1,
            "explicacion": "Siempre una y solo una. Si es verdad, la de arriba; si no, la de abajo.",
        },
        {
            "pregunta": "¿Qué hace «Repetir bucle hasta»?",
            "opciones": [
                "Repite un número fijo de veces",
                "Repite hasta que la pregunta sea verdad",
                "Repite mientras la pregunta sea verdad",
                "Repite para siempre",
            ],
            "correcta": 1,
            "explicacion": "La pregunta es la condición de salida: en cuanto se cumple, el bucle termina y el programa sigue.",
        },
        {
            "pregunta": "En «fijar píxel en 3, 2 al 100 %», ¿qué es el 2?",
            "opciones": ["El brillo", "La columna", "Los segundos", "El número de píxeles"],
            "correcta": 1,
            "explicacion": "Primero la fila, luego la columna y al final el brillo. Filas y columnas van del 1 al 5.",
        },
        {
            "pregunta": "¿Cuándo usarías «¿Es la luz reflejada...?» en vez de «¿Es de color...?»",
            "opciones": [
                "Cuando solo necesitas saber si es claro u oscuro",
                "Cuando quieres saber el color exacto",
                "Cuando el sensor está lejos",
                "Nunca: hacen lo mismo",
            ],
            "correcta": 0,
            "explicacion": "La luz reflejada no distingue colores, pero sí claro de oscuro, y para seguir una línea negra con eso basta.",
        },
        {
            "pregunta": "¿Por qué dos «Si... entonces» con preguntas contrarias es peor que un «Si no»?",
            "opciones": [
                "Porque ocupa más y te puedes equivocar al escribir la pregunta contraria",
                "Porque va más lento",
                "Porque no funciona",
                "Porque solo se puede usar un «Si» por programa",
            ],
            "correcta": 0,
            "explicacion": "Funciona, pero repites la pregunta y si cambias una y olvidas la otra, el robot hace las dos cosas o ninguna.",
        },
        {
            "pregunta": "Tu clasificador manda todas las tarjetas al mismo lado. ¿Qué miras primero?",
            "opciones": [
                "Que el sensor de color esté a la altura correcta y vea la tarjeta",
                "Que el Hub esté cargado",
                "Que el bucle sea infinito",
                "Que el motor esté al 100 %",
            ],
            "correcta": 0,
            "explicacion": "Si el sensor no llega a ver el color, la pregunta sale siempre mentira y todas van por la misma boca.",
        },
        {
            "pregunta": "«Repetir bucle hasta que haya algo a menos de 10 cm», y nunca se acerca nada. ¿Qué pasa?",
            "opciones": ["El bucle da una vuelta y sale", "El bucle no termina nunca", "Da error", "Se salta el bucle"],
            "correcta": 1,
            "explicacion": "Como la espera: si la condición no llega a cumplirse, el bucle sigue dando vueltas.",
        },
    ],
    "practicas": [
        {
            "titulo": "El clasificador de tarjetas",
            "enunciado": "En un bucle infinito, espera a que una tarjeta se acerque a menos de 5 centímetros y entonces, si es verde, escribe SI y gira el motor A 90 grados a un lado, y si no, escribe NO y gíralo 90 grados al otro.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Bucle infinito"),
                b("Esperar hasta que", 1, "¿Está más próximo a? E 5 cm"),
                b("Si... entonces... Si no...", 1, "¿Es de color verde? D"),
                b("escribir Hello", 2, "SI"),
                b("A ir durante 1 rotaciones", 2, "A", "↻", "90", "grados"),
                b("escribir Hello", 2, "NO"),
                b("A ir durante 1 rotaciones", 2, "A", "↺", "90", "grados"),
            ],
            "notas": "Lo difícil es la sangría: la espera y el «Si no» dentro del bucle, y cada par de acciones en su boca.",
        },
        {
            "titulo": "El aparcamiento automático",
            "enunciado": "Prepara la base al 30 %, avanza con «Repetir bucle hasta» de media en media rotación hasta que haya algo a menos de 12 centímetros, para el movimiento y después, si el sensor de color ve rojo, toca una nota grave, y si no, toca una aguda.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar velocidad de movimiento al 50 %", 0, "30"),
                b("Repetir bucle hasta", 0, "¿Está más próximo a? E 12 cm"),
                b("mover ↑ durante 10 rotaciones", 1, "↑", "0.5", "rotaciones"),
                b("parar movimiento", 0),
                b("Si... entonces... Si no...", 0, "¿Es de color rojo? D"),
                b("Tocar nota X segundos", 1, "48 · 0.6"),
                b("Tocar nota X segundos", 1, "84 · 0.6"),
            ],
            "notas": "Encadena las tres cosas de la unidad: bucle con condición de salida, parada y decisión de dos caminos.",
        },
    ],
})


UNIDADES.append({
    "numero": 8,
    "video_de": 3,
    "evaluacion": 3,
    "nivel": 3,
    "titulo": "Giros precisos: el girosensor manda",
    "hardware": "Hub (Giroscopio, matriz de luces 5x5 y altavoz) + 2 Motor mediano + Sensor de distancia",
    "modelo": "Base de conducción con el Hub bien centrado y el sensor de distancia delante, para medir giros sin que se desequilibre",
    "bloques": [
        "Ángulo de cabeceo, alabeo o guiñada del Hub",
        "empezar a mover derecha: 30",
        "Fijar motores de movimiento para que frenen al parar",
        "Operadores de comparación (>, <, =)",
    ],
    "reto": "Consigue que el robot gire 90 grados exactos siempre, mida lo que ha girado y cierre un cuadrado de verdad.",
    "video": {
        "titulo": "Girar a ojo y girar midiendo",
        "duracion": "5 min",
        "escenas": [
            {
                "plano": "Dos robots iguales giran «media rotación». Uno se queda corto y el otro se pasa.",
                "locucion": "En la unidad 5 girabas contando rotaciones de rueda. Funciona, pero depende del suelo: en la mesa patina menos que en el suelo de clase, y el mismo programa da giros distintos.",
            },
            {
                "plano": "El Hub en la mano, girando despacio. Un número en pantalla sube: 0, 30, 60, 90.",
                "locucion": "El giroscopio no cuenta ruedas: cuenta grados de verdad. Le da igual si la rueda patina, porque mide cómo está puesto el robot.",
            },
            {
                "plano": "El bloque del ángulo de guiñada metido dentro de una comparación «mayor que 90».",
                "locucion": "El bloque del ángulo da un número, así que se mete dentro de una comparación. «Ángulo mayor que 90» es una pregunta, y las preguntas van en los bucles y en los «Si».",
            },
            {
                "plano": "Un «Repetir hasta» con esa comparación dentro, y el robot girando y parando justo a 90 grados.",
                "locucion": "Y ahí está el truco de la unidad: empieza a girar, repite hasta que el ángulo pase de 90, y para. El robot gira lo que tenga que girar, no lo que tú hayas calculado.",
            },
            {
                "plano": "El robot girando y parando en seco, frente a otro que se desliza un poco al parar.",
                "locucion": "Hay un bloque que hace que los motores frenen al parar en vez de dejarse llevar. Con giros precisos se nota: sin él, el robot se pasa unos grados cada vez.",
            },
            {
                "plano": "El robot recorriendo un cuadrado y volviendo exactamente al punto de salida marcado con cinta.",
                "locucion": "Con el giroscopio el cuadrado cierra. Y si no cierra, ya sabes que el problema está en los lados, no en las esquinas.",
            },
        ],
    },
    "explicaciones": {
        "Ángulo de cabeceo, alabeo o guiñada del Hub": "Da un número: los grados que el Hub ha girado desde la última puesta a cero. La guiñada es el giro en plano, el que hace el robot al torcer.",
        "empezar a mover derecha: 30": "Pone el robot a girar y deja seguir el programa, para poder vigilar el ángulo mientras gira.",
        "Fijar motores de movimiento para que frenen al parar": "Hace que los motores sujeten al parar en vez de dejarse llevar. En giros precisos evita que el robot se pase unos grados.",
        "Operadores de comparación (>, <, =)": "Compara dos números y da verdad o mentira. Es lo que convierte un número, como el ángulo, en una pregunta que se puede meter en un bucle.",
    },
    "programa": {
        "titulo": "El giro de 90 grados exactos",
        "explicacion": "El robot empieza a girar y no para hasta que el giroscopio dice que ha pasado de 90 grados. Si el suelo cambia, el giro sigue saliendo igual.",
        "bloques": [
            b("Cuando se inicia el programa"),
            b("fijar A+B como motores en movimiento", 0, "A+B"),
            b("Fijar motores de movimiento para que frenen al parar", 0, "frenar"),
            b("fijar velocidad de movimiento al 50 %", 0, "30"),
            b("Fijar el ángulo de guiñada del Hub a 0"),
            b("empezar a mover derecha: 30", 0, "derecha: 100"),
            b("Repetir bucle hasta", 0, "ángulo de guiñada > 90"),
            b("Esperar X segundos", 1, "0.01"),
            b("parar movimiento", 0),
        ],
    },
    "construccion": {
        "piezas": "La base de conducción de la unidad 5, el sensor de distancia, dos vigas de 7, cuatro pasadores y dos bujes.",
        "pasos": [
            {
                "titulo": "Centrar el Hub",
                "texto": "Quita el Hub y vuelve a ponerlo justo en el centro del chasis, a la misma distancia de las dos ruedas. El giroscopio está dentro del Hub: si va torcido, mide torcido.",
            },
            {
                "titulo": "Nivelar",
                "texto": "Pon el robot en la mesa y mira si cojea. Si se apoya en tres puntos y baila, ajusta la rueda de atrás hasta que quede firme.",
            },
            {
                "titulo": "El sensor de distancia",
                "texto": "Monta las dos vigas de 7 delante y encaja el sensor entre ellas, mirando al frente y bien recto.",
            },
            {
                "titulo": "Apretar los ejes",
                "texto": "Pon un buje en cada eje, pegado a la rueda, para que no se salga ni baile. Una rueda floja estropea cualquier medida.",
            },
            {
                "titulo": "La marca de salida",
                "texto": "Pega un trozo de cinta en la mesa y marca por dónde empieza el robot. Sin marca no se puede ver si el cuadrado cierra.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "Pon el contador a cero",
            "enunciado": "Pon el ángulo de guiñada a cero con el robot alineado con una junta. Espera dos segundos para girarlo a mano hasta la junta perpendicular y después escribe en la pantalla lo que marca el ángulo: tiene que andar por 90.",
            "pista": "El bloque del ángulo es redondo: se mete dentro del hueco del bloque de escribir.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("Fijar el ángulo de guiñada del Hub a 0"),
                b("Esperar X segundos", 0, "2"),
                b("escribir Hello", 0, "ángulo de guiñada"),
            ],
            "notas": "Girando el robot a mano durante la espera se ve que el número cambia. Es la forma más rápida de entender el giroscopio.",
        },
        {
            "titulo": "El giro medido",
            "enunciado": "Alinea el robot con una junta. Pon el ángulo a cero, empieza a girar a la derecha y repite hasta que el ángulo pase de 90 grados, y entonces para: tiene que quedar mirando a lo largo de la junta perpendicular.",
            "pista": "El bucle no lleva nada dentro que haga trabajo: solo está ahí vigilando el ángulo.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("fijar velocidad de movimiento al 50 %", 0, "30"),
                b("Fijar el ángulo de guiñada del Hub a 0"),
                b("empezar a mover derecha: 30", 0, "derecha: 100"),
                b("Repetir bucle hasta", 0, "ángulo de guiñada > 90"),
                b("Esperar X segundos", 1, "0.01"),
                b("parar movimiento", 0),
            ],
            "notas": "La espera minúscula de dentro del bucle es para que no se quede comprobando a ciegas. Conviene explicarlo.",
        },
        {
            "titulo": "Frenar en seco",
            "enunciado": "Repite el giro medido añadiendo al principio el bloque que hace que los motores frenen al parar. Compara con el ejercicio anterior mirando cuánto se pasa de la junta cada uno.",
            "pista": "El bloque de frenar va al principio, junto al de fijar los motores.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("Fijar motores de movimiento para que frenen al parar", 0, "frenar"),
                b("fijar velocidad de movimiento al 50 %", 0, "30"),
                b("Fijar el ángulo de guiñada del Hub a 0"),
                b("empezar a mover derecha: 30", 0, "derecha: 100"),
                b("Repetir bucle hasta", 0, "ángulo de guiñada > 90"),
                b("Esperar X segundos", 1, "0.01"),
                b("parar movimiento", 0),
            ],
            "notas": "El mismo programa con una línea más. Midiendo con un transportador se ve la diferencia de dos o tres grados.",
        },
        {
            "titulo": "Media vuelta exacta",
            "enunciado": "Haz el mismo giro medido pero hasta 180 grados, hasta quedar alineado con la misma junta y mirando al revés. Al terminar toca una nota y enciende un dibujo un segundo.",
            "pista": "Solo cambia el número de la comparación. Lo demás es igual.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("Fijar motores de movimiento para que frenen al parar", 0, "frenar"),
                b("fijar velocidad de movimiento al 50 %", 0, "30"),
                b("Fijar el ángulo de guiñada del Hub a 0"),
                b("empezar a mover derecha: 30", 0, "derecha: 100"),
                b("Repetir bucle hasta", 0, "ángulo de guiñada > 180"),
                b("Esperar X segundos", 1, "0.01"),
                b("parar movimiento", 0),
                b("Tocar nota X segundos", 0, "60 · 0.4"),
                b("encender dibujo durante 2 segundos", 0, "cara contenta", "1"),
            ],
            "notas": "Cambiar un número y que el robot haga otra cosa distinta es justo lo que buscamos que entiendan.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Por qué un giro contando rotaciones de rueda no siempre sale igual?",
            "opciones": [
                "Porque los motores se cansan",
                "Porque la rueda patina más o menos según el suelo",
                "Porque el bucle va más rápido unas veces que otras",
                "Porque el Hub pierde batería",
            ],
            "correcta": 1,
            "explicacion": "La rueda puede dar la vuelta y el robot girar menos de lo previsto. El giroscopio mide el robot, no la rueda.",
        },
        {
            "pregunta": "¿Qué es la guiñada?",
            "opciones": [
                "Lo que se inclina el robot hacia delante",
                "Lo que se tumba el robot de lado",
                "Lo que gira el robot en plano, como una veleta",
                "La velocidad de giro",
            ],
            "correcta": 2,
            "explicacion": "Cabeceo es inclinarse hacia delante, alabeo es tumbarse de lado y guiñada es el giro en plano, el que hace al torcer.",
        },
        {
            "pregunta": "El bloque del ángulo, ¿qué forma tiene y dónde encaja?",
            "opciones": [
                "De rombo, y va en los huecos de pregunta",
                "Redondeado, y va en los huecos de número, por ejemplo dentro de una comparación",
                "De sombrero, y va arriba del programa",
                "Rectangular, y va en la pila",
            ],
            "correcta": 1,
            "explicacion": "Da un número, así que es redondo. Para usarlo como pregunta hay que compararlo con algo.",
        },
        {
            "pregunta": "¿Qué hace «Fijar el ángulo de guiñada a 0»?",
            "opciones": [
                "Gira el robot hasta que el ángulo sea cero",
                "Pone el contador a cero donde esté el robot",
                "Apaga el giroscopio",
                "Endereza las ruedas",
            ],
            "correcta": 1,
            "explicacion": "No mueve nada. Marca el punto desde el que se empieza a contar, y por eso va justo antes de girar.",
        },
        {
            "pregunta": "¿Para qué sirve «Fijar motores de movimiento para que frenen al parar»?",
            "opciones": [
                "Para que el robot vaya más despacio",
                "Para que al parar sujete en vez de dejarse llevar unos grados más",
                "Para que los motores no se calienten",
                "Para parar el programa",
            ],
            "correcta": 1,
            "explicacion": "Sin frenado el robot se desliza un poco al parar, y en un giro medido eso son grados de error en cada esquina.",
        },
        {
            "pregunta": "«Repetir hasta que el ángulo sea mayor que 90», con el robot girando. ¿Cuándo sale del bucle?",
            "opciones": [
                "A las 90 vueltas del bucle",
                "Cuando el giroscopio marque más de 90 grados",
                "A los 90 segundos",
                "Nunca",
            ],
            "correcta": 1,
            "explicacion": "La condición mira el ángulo, no las vueltas ni el tiempo. En cuanto pasa de 90, sale y el programa sigue.",
        },
        {
            "pregunta": "El cuadrado del robot no cierra, pero los giros son exactos. ¿Dónde está el fallo?",
            "opciones": [
                "En los giros, aunque midan bien",
                "En los lados: no todos recorren lo mismo",
                "En el giroscopio",
                "En el sensor de distancia",
            ],
            "correcta": 1,
            "explicacion": "Si las esquinas son buenas y no cierra, el problema está en la longitud de los lados o en que el robot no va recto.",
        },
        {
            "pregunta": "¿Por qué conviene girar despacio cuando se mide con el giroscopio?",
            "opciones": [
                "Porque el giroscopio no funciona deprisa",
                "Porque deprisa el robot se pasa de los 90 antes de que el bucle lo compruebe",
                "Porque los motores pierden fuerza",
                "No conviene: cuanto más rápido, más exacto",
            ],
            "correcta": 1,
            "explicacion": "Entre comprobación y comprobación pasa un instante. Cuanto más rápido gire, más grados avanza en ese instante.",
        },
    ],
    "practicas": [
        {
            "titulo": "El cuadrado que cierra",
            "enunciado": "Pon el robot en una cruceta y prepara la base con frenado y velocidad 30. Repite cuatro veces: avanza dos baldosas (4,6 rotaciones); pon el ángulo a cero; empieza a girar a la derecha; repite hasta que el ángulo pase de 90; para el movimiento. Tiene que cerrar en la cruceta de salida.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("Fijar motores de movimiento para que frenen al parar", 0, "frenar"),
                b("fijar velocidad de movimiento al 50 %", 0, "30"),
                b("Repetir bucle", 0, "4"),
                b("mover ↑ durante 10 rotaciones", 1, "↑", "4.6", "rotaciones"),
                b("Fijar el ángulo de guiñada del Hub a 0", 1),
                b("empezar a mover derecha: 30", 1, "derecha: 100"),
                b("Repetir bucle hasta", 1, "ángulo de guiñada > 90"),
                b("Esperar X segundos", 2, "0.01"),
                b("parar movimiento", 1),
            ],
            "notas": "La puesta a cero tiene que ir DENTRO del bucle, antes de cada giro. Fuera, el ángulo se acumula y solo gira bien la primera esquina.",
        },
        {
            "titulo": "El robot que esquiva",
            "enunciado": "Pon una caja dos baldosas por delante. Arranca hacia delante y repite hasta que haya algo a menos de 20 centímetros. Entonces para el movimiento, pon el ángulo a cero, gira midiendo hasta pasar de 90 grados, para otra vez y avanza una baldosa (2,3 rotaciones) por el lado.",
            "solucion": [
                b("Cuando se inicia el programa"),
                b("fijar A+B como motores en movimiento", 0, "A+B"),
                b("Fijar motores de movimiento para que frenen al parar", 0, "frenar"),
                b("fijar velocidad de movimiento al 50 %", 0, "30"),
                b("empezar a mover a ↑", 0, "↑"),
                b("Repetir bucle hasta", 0, "¿Está más próximo a? E 20 cm"),
                b("Esperar X segundos", 1, "0.01"),
                b("parar movimiento", 0),
                b("Fijar el ángulo de guiñada del Hub a 0"),
                b("empezar a mover derecha: 30", 0, "derecha: 100"),
                b("Repetir bucle hasta", 0, "ángulo de guiñada > 90"),
                b("Esperar X segundos", 1, "0.01"),
                b("parar movimiento", 0),
                b("mover ↑ durante 10 rotaciones", 0, "↑", "2.3", "rotaciones"),
            ],
            "notas": "Junta el sensor de distancia con el giro medido: ve el obstáculo, se para, gira exacto y sigue. Es el programa más largo del curso.",
        },
    ],
})


UNIDADES.append({
    "numero": 9,
    "evaluacion": 3,
    "nivel": 3,
    "titulo": "Proyecto final: la feria automática",
    "hardware": "Hub (Matriz de luces 5x5, altavoz y botón central) + 1 Motor grande + 1 Motor mediano + Sensor de color + Sensor de distancia + Sensor de fuerza",
    "modelo": "Tiovivo con taquilla: el motor grande hace girar la plataforma y el mediano levanta la barrera de entrada",
    "bloques": [
        "Cuando se presiona el botón del Hub",
        "Cuando el color es",
        "Cuando está más próximo a",
        "Enviar mensaje",
        "Cuando se reciba el mensaje",
    ],
    "reto": "Monta una atracción de feria que se maneje sola: la entrada con tarjeta, el aviso de seguridad y el viaje.",
    "video": {
        "titulo": "Varios programas a la vez",
        "duracion": "6 min",
        "escenas": [
            {
                "plano": "Un programa larguísimo, con bucles dentro de bucles, difícil de seguir.",
                "locucion": "Una atracción de feria tiene que hacer varias cosas a la vez: vender entradas, vigilar que nadie se acerque y mover el tiovivo. Todo en un solo programa sale enorme y no hay quien lo lea.",
            },
            {
                "plano": "Tres pilas de bloques separadas en el lienzo, cada una con su sombrero de color distinto.",
                "locucion": "SPIKE deja tener varios programas a la vez en la misma hoja. Cada uno con su sombrero, cada uno esperando a lo suyo, todos vigilando al mismo tiempo.",
            },
            {
                "plano": "Primer plano de tres sombreros: botón del Hub, color y distancia.",
                "locucion": "Estos sombreros no esperan a que pulses reproducir: esperan a que pase algo. Cuando se aprieta el botón, cuando el sensor ve un color, cuando algo se acerca.",
            },
            {
                "plano": "Un bloque «Enviar mensaje» en una pila y un sombrero «Cuando se reciba el mensaje» en otra.",
                "locucion": "Y para que hablen entre ellos están los mensajes. Un programa manda un aviso y otro, que estaba esperándolo, arranca. Es como llamar a un compañero por su nombre.",
            },
            {
                "plano": "La taquilla leyendo una tarjeta verde, la barrera subiendo y el tiovivo arrancando.",
                "locucion": "Así queda la feria: la taquilla lee la tarjeta y manda «empezar»; el tiovivo, que estaba esperando ese mensaje, arranca.",
            },
            {
                "plano": "Una mano se acerca al tiovivo en marcha y todo se para con la pantalla en rojo.",
                "locucion": "Y la seguridad va por su cuenta, vigilando siempre. Si alguien se acerca demasiado, para todo. Eso es lo que hace que una máquina sea de verdad.",
            },
        ],
    },
    "explicaciones": {
        "Cuando se presiona el botón del Hub": "Un sombrero que arranca su pila cuando pulsas el botón grande del Hub. No hace falta darle a reproducir cada vez.",
        "Cuando el color es": "Arranca su pila justo en el momento en que el sensor ve el color elegido. Es como un «Esperar hasta que», pero en su propio programa.",
        "Cuando está más próximo a": "Arranca su pila cuando algo se pone más cerca de los centímetros que le digas. Sirve para la vigilancia, que tiene que estar siempre atenta.",
        "Enviar mensaje": "Manda un aviso con un nombre que eliges tú. El programa sigue sin esperar a nadie.",
        "Cuando se reciba el mensaje": "Un sombrero que espera un aviso concreto. Cuando alguien lo manda, arranca su pila. Así un programa puede poner otro en marcha.",
    },
    "programa": {
        "titulo": "La feria",
        "explicacion": "Tres programas a la vez en la misma hoja. La taquilla lee la tarjeta y avisa; el tiovivo espera ese aviso para arrancar; la vigilancia no espera a nadie y lo para todo si alguien se acerca.",
        "bloques": [
            b("Cuando el color es", 0, "verde D"),
            b("A ir durante 1 rotaciones", 0, "B", "↻", "90", "grados"),
            b("Enviar mensaje", 0, "empezar"),
            b("Cuando se reciba el mensaje", 0, "empezar"),
            b("escribir Hello", 0, "VAMOS"),
            b("A fijar velocidad al 75 %", 0, "A", "40"),
            b("A arrancar motor", 0, "A", "↻"),
            b("Cuando está más próximo a", 0, "E 10 cm"),
            b("A parar motor", 0, "A"),
            b("poner luz del botón central en rojo", 0, "rojo"),
        ],
    },
    "construccion": {
        "piezas": "El Hub, el motor grande, un motor mediano, los tres sensores, dos marcos Technic, cuatro vigas de 15, cuatro vigas de 11, dos ejes de 7, un eje de 5, un panel, dos vigas angulares y dieciséis pasadores.",
        "pasos": [
            {
                "titulo": "La base de la atracción",
                "texto": "Monta un cuadrado grande con las cuatro vigas de 15 y refuérzalo con los dos marcos Technic cruzados por debajo. Tiene que aguantar el peso del tiovivo girando.",
            },
            {
                "titulo": "El eje del tiovivo",
                "texto": "Pon el motor grande en el centro de la base, con el eje de 7 hacia arriba. Es el que mueve la plataforma, y por eso es el grande.",
            },
            {
                "titulo": "La plataforma",
                "texto": "Cruza dos vigas de 11 sobre el eje y fíjalas con pasadores. Esos son los brazos donde van las cabinas.",
            },
            {
                "titulo": "La taquilla",
                "texto": "En un lateral, monta el motor mediano con el eje de 5 y el panel: es la barrera. Pon el sensor de color justo delante, mirando a donde se pasa la tarjeta.",
            },
            {
                "titulo": "La seguridad",
                "texto": "Coloca el sensor de distancia en una esquina, mirando hacia donde está el público, y el de fuerza al alcance de la mano como parada de emergencia.",
            },
            {
                "titulo": "Los cables",
                "texto": "Motor grande al A, motor mediano al B, color al D, distancia al E y fuerza al F. Recoge todos los cables por debajo de la base para que no se enganchen al girar.",
            },
        ],
    },
    "intermedias": [
        {
            "titulo": "El botón arranca",
            "enunciado": "Con el sombrero del botón del Hub, haz que al pulsarlo se escriba HOLA y se toque una nota.",
            "pista": "Este programa no empieza por el sombrero amarillo de siempre, sino por el del botón.",
            "solucion": [
                b("Cuando se presiona el botón del Hub", 0, "botón central"),
                b("escribir Hello", 0, "HOLA"),
                b("Tocar nota X segundos", 0, "60 · 0.4"),
            ],
            "notas": "Primer programa del curso que no empieza por «Cuando se inicia el programa». Conviene pararse en ello.",
        },
        {
            "titulo": "La taquilla",
            "enunciado": "Con el sombrero del color, haz que al ver la tarjeta verde el motor B suba la barrera 90 grados, espere tres segundos y la baje.",
            "pista": "Para bajar la barrera se gira 90 grados en el sentido contrario.",
            "solucion": [
                b("Cuando el color es", 0, "verde D"),
                b("A ir durante 1 rotaciones", 0, "B", "↻", "90", "grados"),
                b("Esperar X segundos", 0, "3"),
                b("A ir durante 1 rotaciones", 0, "B", "↺", "90", "grados"),
            ],
            "notas": "La barrera vuelve sola. Si se quedan sin el giro de vuelta, a la segunda tarjeta la barrera ya está arriba.",
        },
        {
            "titulo": "El aviso entre programas",
            "enunciado": "Haz dos programas: en el primero, al pulsar el botón del Hub se manda el mensaje empezar; en el segundo, al recibir empezar se escribe VAMOS y arranca el motor A.",
            "pista": "El nombre del mensaje tiene que escribirse igual en los dos sitios.",
            "solucion": [
                b("Cuando se presiona el botón del Hub", 0, "botón central"),
                b("Enviar mensaje", 0, "empezar"),
                b("Cuando se reciba el mensaje", 0, "empezar"),
                b("escribir Hello", 0, "VAMOS"),
                b("A arrancar motor", 0, "A", "↻"),
            ],
            "notas": "Son dos pilas separadas en el lienzo. Si el nombre del mensaje no coincide, no pasa nada y no hay error: ese es el fallo típico.",
        },
        {
            "titulo": "La parada de seguridad",
            "enunciado": "Con el sombrero de la distancia, haz que cuando algo se ponga a menos de 10 centímetros se pare el motor A, se ponga el botón en rojo y se toque una nota larga.",
            "pista": "Este programa vigila siempre, aunque los otros estén trabajando.",
            "solucion": [
                b("Cuando está más próximo a", 0, "E 10 cm"),
                b("A parar motor", 0, "A"),
                b("poner luz del botón central en rojo", 0, "rojo"),
                b("Tocar nota X segundos", 0, "48 · 1"),
            ],
            "notas": "La seguridad siempre va en su propio programa: si estuviera dentro del bucle del tiovivo, solo miraría cuando le tocara turno.",
        },
    ],
    "test": [
        {
            "pregunta": "¿Qué ventaja tiene partir una máquina en varios programas con sombrero?",
            "opciones": [
                "Que va más rápido",
                "Que cada uno vigila lo suyo a la vez y el programa se lee mejor",
                "Que gasta menos batería",
                "Ninguna: es solo para que quede bonito",
            ],
            "correcta": 1,
            "explicacion": "Vigilan a la vez y cada pila hace una cosa. Todo junto sería un programa enorme en el que una vigilancia tendría que esperar su turno.",
        },
        {
            "pregunta": "¿Qué hace el sombrero «Cuando está más próximo a 10 cm»?",
            "opciones": [
                "Para el programa hasta que algo se acerque",
                "Arranca su pila en el momento en que algo se pone a menos de 10 cm",
                "Mide la distancia continuamente y la escribe",
                "Mueve el robot hasta estar a 10 cm",
            ],
            "correcta": 1,
            "explicacion": "Es un sombrero: no espera dentro de otro programa, arranca el suyo cuando ocurre.",
        },
        {
            "pregunta": "Mandas el mensaje «empezar» y el sombrero espera «Empezar». ¿Qué pasa?",
            "opciones": [
                "Funciona igual",
                "No arranca, y además no sale ningún error",
                "El Hub se bloquea",
                "Arranca dos veces",
            ],
            "correcta": 1,
            "explicacion": "El nombre tiene que coincidir exactamente. Como no hay error, parece que el programa no hace nada y cuesta encontrarlo.",
        },
        {
            "pregunta": "¿Por qué la parada de seguridad va en su propio programa?",
            "opciones": [
                "Porque así vigila siempre, sin esperar turno dentro de otro bucle",
                "Porque los sensores no funcionan dentro de un bucle",
                "Porque el sensor de distancia necesita su propio Hub",
                "Por costumbre, da igual dónde vaya",
            ],
            "correcta": 0,
            "explicacion": "Metida dentro de otro bucle, solo se comprobaría cuando el programa pasara por allí. Sola, está atenta todo el rato.",
        },
        {
            "pregunta": "¿Qué motor conviene para mover la plataforma del tiovivo?",
            "opciones": ["El mediano, que es más rápido", "El grande, que tiene más fuerza", "Cualquiera", "Los dos a la vez"],
            "correcta": 1,
            "explicacion": "El grande da más fuerza, y mover una plataforma con peso encima es cuestión de fuerza, no de velocidad.",
        },
        {
            "pregunta": "¿Cuántos programas puede haber a la vez en la misma hoja?",
            "opciones": ["Uno", "Dos como mucho", "Varios, cada uno con su sombrero", "Uno por sensor conectado"],
            "correcta": 2,
            "explicacion": "Tantas pilas como quieras, siempre que cada una empiece por un sombrero.",
        },
        {
            "pregunta": "«Enviar mensaje», ¿detiene el programa que lo manda?",
            "opciones": [
                "Sí, hasta que el otro termina",
                "No, manda el aviso y sigue",
                "Sí, durante un segundo",
                "Solo si el otro programa está ocupado",
            ],
            "correcta": 1,
            "explicacion": "Suelta el aviso y continúa. Si necesitaras esperar al otro, haría falta el bloque de enviar y esperar.",
        },
        {
            "pregunta": "En la feria, ¿qué sensor abre la barrera de la taquilla?",
            "opciones": ["El de distancia", "El de color", "El de fuerza", "El giroscopio"],
            "correcta": 1,
            "explicacion": "La entrada es una tarjeta de color: la lee el sensor de color del puerto D.",
        },
    ],
    "practicas": [
        {
            "titulo": "La feria automática",
            "enunciado": "Monta tres programas: con el sensor de color, al ver la tarjeta verde sube la barrera con el motor B y manda el mensaje empezar; al recibir empezar, escribe VAMOS y arranca el motor A al 40 %; y con el sensor de distancia, si algo se acerca a menos de 10 centímetros, para el motor A y pon el botón en rojo.",
            "solucion": [
                b("Cuando el color es", 0, "verde D"),
                b("A ir durante 1 rotaciones", 0, "B", "↻", "90", "grados"),
                b("Enviar mensaje", 0, "empezar"),
                b("Cuando se reciba el mensaje", 0, "empezar"),
                b("escribir Hello", 0, "VAMOS"),
                b("A fijar velocidad al 75 %", 0, "A", "40"),
                b("A arrancar motor", 0, "A", "↻"),
                b("Cuando está más próximo a", 0, "E 10 cm"),
                b("A parar motor", 0, "A"),
                b("poner luz del botón central en rojo", 0, "rojo"),
            ],
            "notas": "Tres pilas con tres sombreros distintos. Lo que se corrige es que cada cosa esté en su programa, no que el orden sea exacto.",
        },
        {
            "titulo": "La parada de emergencia",
            "enunciado": "Añade un cuarto programa que, al pulsar el sensor de fuerza, pare el motor A, pare el motor B, escriba PARADA y toque una nota larga.",
            "solucion": [
                b("Cuando se presiona el botón del Hub", 0, "botón central"),
                b("Esperar hasta que", 0, "¿Está presionado? F"),
                b("A parar motor", 0, "A"),
                b("A parar motor", 0, "B"),
                b("escribir Hello", 0, "PARADA"),
                b("Tocar nota X segundos", 0, "40 · 1.5"),
            ],
            "notas": "El sensor de fuerza no tiene sombrero propio, así que se arranca con el botón del Hub y se espera a que lo aprieten. Vale también con el sombrero de inicio.",
        },
    ],
})




# ── El suelo del aula ──────────────────────────────────────────────────
#
# Las prácticas que se hacen sobre el terrazo del aula, de baldosas de
# 40 × 40 cm. En su ficha sale el recordatorio de la baldosa y de cómo
# calibrarla (ver src/components/unidad/SueloBaldosas.tsx).
#
# En 1º todavía no existe el bloque de la vuelta de rueda, así que el robot
# se mueve en ROTACIONES: una baldosa son unas 2,3 y el número exacto lo
# saca cada grupo probando sobre su suelo. Es la mejor versión del
# ejercicio, porque la baldosa es la verdad y el número sale de medir.
EN_EL_SUELO = {
    (5, "Cruza una baldosa"),
    (5, "Ida y vuelta de dos baldosas"),
    (5, "Media vuelta"),
    (5, "El cuadrado de una baldosa"),
    (5, "El circuito cuadrado"),
    (5, "La entrega a domicilio"),
    (6, "Frena ante el obstáculo"),
    (6, "El arranque con botón"),
    (6, "El vehículo vigilante"),
    (8, "Pon el contador a cero"),
    (8, "El giro medido"),
    (8, "Frenar en seco"),
    (8, "Media vuelta exacta"),
    (8, "El cuadrado que cierra"),
    (8, "El robot que esquiva"),
}


if __name__ == "__main__":
    main("1ESO", UNIDADES, VIDEOS, EN_EL_SUELO)
