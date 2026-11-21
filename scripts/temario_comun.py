"""Lo común a los temarios: la función de bloque, las comprobaciones y el escritor.

Lo usan scripts/temario-1eso.py y scripts/temario-2eso.py. Está aquí y no
copiado en cada uno porque las comprobaciones son el motivo de que estos
temarios se generen con un script: si estuvieran duplicadas, se arreglaría
una y la otra se quedaría atrás.
"""

import glob
import json
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CONTENIDO = RAIZ / "src/data/contenido"
UNIDADES_JSON = RAIZ / "src/data/unidades.json"
BLOQUES_JSON = RAIZ / "src/data/bloques.json"


def b(texto, nivel=0, *valores):
    """Una fila de programa: el bloque, su sangría y lo que va en sus huecos."""
    fila = {"texto": texto, "nivel": nivel}
    if valores:
        fila["valores"] = [str(v) for v in valores]
    return fila


# ═══════════════════════════════════════════════════════════════════════════
#  COMPROBACIONES Y ESCRITURA
# ═══════════════════════════════════════════════════════════════════════════

datos_bloques = json.loads(BLOQUES_JSON.read_text(encoding="utf-8"))
CATALOGO = {x["texto"]: x for x in datos_bloques["bloques"]}
AUXILIARES = {x["texto"]: x for x in datos_bloques["auxiliares"]}
ACOMPANAN = {}
for aux in datos_bloques["auxiliares"]:
    ACOMPANAN.setdefault(aux["acompana"], []).append(aux["texto"])

# Los contenedores: lo que va dentro de ellos sube un nivel de sangría.
CONTENEDORES = {
    "Repetir bucle",
    "Repetir bucle hasta",
    "Bucle infinito",
    "Si... entonces...",
    "Si... entonces... Si no...",
    # Definir un bloque propio también abre una boca: lo que va debajo, con
    # sangría, es el cuerpo del bloque.
    "Mis bloques: Crear un bloque con entradas",
}
# Los sombreros empiezan una pila nueva: siempre van a nivel 0.
SOMBREROS = {t for t, x in CATALOGO.items() if x["forma"] == "inicio"}

fallos = []


def huecos_de(texto):
    """Cuántos valores admite un bloque. Sin «partes», uno solo de texto libre."""
    partes = CATALOGO.get(texto, {}).get("partes")
    if not partes:
        return 1
    return len([p for p in partes if p["t"] in ("menu", "hueco", "color")])


def revisa_programa(donde, filas, permitidos):
    """Bloques conocidos, permitidos, con los valores que les caben y bien anidados."""
    nivel_previo = -1
    contenedor_abierto = []
    for i, fila in enumerate(filas):
        texto = fila["texto"]
        if texto not in CATALOGO and texto not in AUXILIARES:
            fallos.append(f"{donde}: el bloque «{texto}» no está en el catálogo")
            continue
        if texto not in permitidos:
            fallos.append(f"{donde}: «{texto}» no está en la paleta de la unidad")

        cabe = huecos_de(texto)
        tiene = len(fila.get("valores", []))
        if tiene > cabe:
            fallos.append(f"{donde}: «{texto}» admite {cabe} valores y lleva {tiene}")

        nivel = fila["nivel"]
        if texto in SOMBREROS and nivel != 0:
            fallos.append(f"{donde}: el sombrero «{texto}» tiene que ir a nivel 0")
        if nivel > nivel_previo + 1:
            fallos.append(f"{donde}: fila {i} salta de nivel {nivel_previo} a {nivel}")
        elif nivel == nivel_previo + 1 and i > 0:
            anterior = filas[i - 1]["texto"]
            if anterior not in CONTENEDORES:
                fallos.append(f"{donde}: fila {i} se mete dentro de «{anterior}», que no es un contenedor")
        nivel_previo = nivel
        contenedor_abierto = contenedor_abierto  # (el anidado real lo valida el nivel)


def reparte_respuestas(UNIDADES):
    """Reparte la respuesta correcta entre las cuatro posiciones.

    Escribiendo las preguntas sale casi siempre la B: uno pone el error
    típico primero y la buena después. Con eso, un alumno que conteste
    siempre B aprueba sin leer. Aquí se rota cada pregunta para que la
    correcta caiga por turnos en A, B, C y D.

    OJO: las entregas guardan el índice elegido, así que reordenar las
    opciones invalida los test ya entregados de ese curso. Solo se puede
    llamar al regenerar el curso entero.
    """
    i = 0
    for unidad in UNIDADES:
        for pregunta in unidad["test"]:
            opciones = pregunta["opciones"]
            buena = opciones[pregunta["correcta"]]
            destino = i % len(opciones)
            giro = (pregunta["correcta"] - destino) % len(opciones)
            pregunta["opciones"] = opciones[giro:] + opciones[:giro]
            pregunta["correcta"] = destino
            assert pregunta["opciones"][destino] == buena
            i += 1


def cargar_enlaces(curso):
    """Las lecciones oficiales que ya hay en el repositorio: {url: título}.

    Una misma lección puede estar citada en dos cursos y con el título
    escrito de dos maneras. Cuando pasa, se prefiere el de OTRO curso: el
    del curso que se está regenerando es el que puede venir mal puesto.

    Aquí no se inventa ninguna URL: solo se recogen las que ya están.
    """
    propias, ajenas = {}, {}
    for fichero in sorted(glob.glob("src/data/contenido/*.json")):
        enlace = (json.load(open(fichero, encoding="utf-8")).get("video") or {}).get(
            "enlaceOficial"
        )
        if not enlace:
            continue
        destino = propias if pathlib.Path(fichero).name.startswith(f"{curso}-") else ajenas
        destino.setdefault(enlace["url"], enlace["titulo"])
    return {**propias, **ajenas}


def main(curso, UNIDADES, VIDEOS, en_el_suelo=frozenset()):
    """Escribe el temario de un curso.

    `en_el_suelo` es el conjunto de prácticas que se hacen sobre el suelo de
    baldosas del aula, como pares (unidad, título). Se marcan con
    «suelo»: true para que la pantalla ponga al lado el recordatorio de la
    baldosa de 40 × 40 cm y su calibración. Se declaran en una lista al
    principio del temario de cada curso, no repartidas por el archivo, para
    poder ver de un vistazo cuáles son.
    """
    if len(UNIDADES) != 9:
        sys.exit(f"Tienen que ser 9 unidades y hay {len(UNIDADES)}")

    # La paleta de la unidad N: sus bloques y los de todas las anteriores,
    # con los auxiliares que arrastra cada uno (la rama «Si no», por ejemplo).
    #
    # «Anteriores» incluye los CURSOS anteriores, igual que hace getPaleta en
    # la aplicación: un alumno de 2º no desaprende lo de 1º. Sin esto, el
    # temario de 2º no podría usar ni el bloque de inicio.
    CURSOS = ["1ESO", "2ESO", "3ESO"]
    acumulada = set()
    temario = json.loads(UNIDADES_JSON.read_text(encoding="utf-8"))
    for u in temario["unidades"]:
        if CURSOS.index(u["curso"]) < CURSOS.index(curso):
            for texto in u["bloques"]:
                acumulada.add(texto)
                for aux in ACOMPANAN.get(texto, []):
                    acumulada.add(aux)

    paletas = {}
    for unidad in UNIDADES:
        for texto in unidad["bloques"]:
            acumulada.add(texto)
            for aux in ACOMPANAN.get(texto, []):
                acumulada.add(aux)
        paletas[unidad["numero"]] = set(acumulada)

    for unidad in UNIDADES:
        n = unidad["numero"]
        permitidos = paletas[n]
        etiqueta = f"UD{n}"

        for texto in unidad["bloques"]:
            if texto not in CATALOGO:
                fallos.append(f"{etiqueta}: el bloque nuevo «{texto}» no está en el catálogo")
            if texto not in unidad["explicaciones"]:
                fallos.append(f"{etiqueta}: el bloque «{texto}» no tiene explicación")

        revisa_programa(f"{etiqueta} programa", unidad["programa"]["bloques"], permitidos)

        if len(unidad["intermedias"]) != 4:
            fallos.append(f"{etiqueta}: tiene {len(unidad['intermedias'])} prácticas intermedias y deben ser 4")
        for i, practica in enumerate(unidad["intermedias"], start=1):
            revisa_programa(f"{etiqueta} práctica {i}", practica["solucion"], permitidos)

        if len(unidad["practicas"]) != 2:
            fallos.append(f"{etiqueta}: tiene {len(unidad['practicas'])} programaciones de prueba y deben ser 2")
        for i, practica in enumerate(unidad["practicas"], start=1):
            revisa_programa(f"{etiqueta} prueba {i}", practica["solucion"], permitidos)

        if len(unidad["test"]) != 8:
            fallos.append(f"{etiqueta}: el test tiene {len(unidad['test'])} preguntas y deben ser 8")
        for i, pregunta in enumerate(unidad["test"], start=1):
            if len(pregunta["opciones"]) != 4:
                fallos.append(f"{etiqueta} pregunta {i}: tiene {len(pregunta['opciones'])} opciones y deben ser 4")
            if not 0 <= pregunta["correcta"] < len(pregunta["opciones"]):
                fallos.append(f"{etiqueta} pregunta {i}: la respuesta correcta está fuera de rango")

    if fallos:
        print(f"✗ {len(fallos)} problemas. No se escribe nada:\n")
        for f in fallos:
            print("  ·", f)
        sys.exit(1)

    # ── Enlaces oficiales ──
    #
    # No se inventan URLs: el catálogo son las lecciones que ya están en el
    # repositorio, de los demás cursos. Si una unidad nombra una URL que no
    # está, se para antes de escribir.
    enlaces = cargar_enlaces(curso)
    sin_catalogo = sorted(
        {u["enlace"] for u in UNIDADES if u.get("enlace") and u["enlace"] not in enlaces}
    )
    if sin_catalogo:
        print("✗ enlaces que no están en el catálogo del repositorio:")
        for url in sin_catalogo:
            print("  ·", url)
        sys.exit(1)

    # ── El suelo de baldosas ──
    todas = {
        (u["numero"], p["titulo"])
        for u in UNIDADES
        for p in u["intermedias"] + u["practicas"]
    }
    huerfanas = sorted(en_el_suelo - todas)
    if huerfanas:
        print("✗ prácticas marcadas «en el suelo» que no existen:")
        for unidad, titulo in huerfanas:
            print(f"  · UD{unidad} «{titulo}»")
        sys.exit(1)

    # ── Escribir el contenido ──
    for unidad in UNIDADES:
        n = unidad["numero"]
        video = dict(unidad["video"])
        guardado = VIDEOS.get(str(unidad.get("video_de", n)), {})
        if guardado.get("url"):
            video["url"] = guardado["url"]
        # El enlace a la lección oficial se elige por TEMA, no por el vídeo:
        # «enlace» nombra una URL del catálogo (ver cargar_enlaces). Si la
        # unidad no nombra ninguna, se queda sin enlace antes que llevar uno
        # que no venga a cuento.
        if unidad.get("enlace"):
            video["enlaceOficial"] = {
                "titulo": enlaces[unidad["enlace"]],
                "url": unidad["enlace"],
            }
        elif "enlace" not in unidad and guardado.get("enlaceOficial"):
            video["enlaceOficial"] = guardado["enlaceOficial"]

        contenido = {
            "curso": curso,
            "unidad": n,
            "reto": unidad["reto"],
            "video": video,
            "bloques": [
                {"texto": t, "explicacion": unidad["explicaciones"][t]} for t in unidad["bloques"]
            ],
            "programa": unidad["programa"],
            "intermedias": [
                {
                    "practica": i,
                    "titulo": p["titulo"],
                    "enunciado": p["enunciado"],
                    "pista": p["pista"],
                    "solucion": p["solucion"],
                    "notas": p["notas"],
                    **({"suelo": True} if (n, p["titulo"]) in en_el_suelo else {}),
                }
                for i, p in enumerate(unidad["intermedias"], start=1)
            ],
            "construccion": unidad["construccion"],
            "test": unidad["test"],
            "practicas": [
                {**p, **({"suelo": True} if (n, p["titulo"]) in en_el_suelo else {})}
                for p in unidad["practicas"]
            ],
        }
        destino = CONTENIDO / f"{curso}-{n}.json"
        destino.write_text(
            json.dumps(contenido, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    # ── Actualizar el temario (unidades.json), solo 1º de ESO ──
    datos = json.loads(UNIDADES_JSON.read_text(encoding="utf-8"))
    otras = [u for u in datos["unidades"] if u["curso"] != curso]
    nuevas = [
        {
            "curso": curso,
            "numero": u["numero"],
            "titulo": u["titulo"],
            "evaluacion": u["evaluacion"],
            "nivel": u["nivel"],
            "hardware": u["hardware"],
            "bloques": u["bloques"],
            "modelo": u["modelo"],
        }
        for u in UNIDADES
    ]
    # Orden estable: por curso y número. Si no, el curso recién generado se
    # pone el primero y el archivo cambia entero en cada ejecución.
    CURSOS = ["1ESO", "2ESO", "3ESO"]
    datos["unidades"] = sorted(
        nuevas + otras, key=lambda u: (CURSOS.index(u["curso"]), u["numero"])
    )
    UNIDADES_JSON.write_text(
        json.dumps(datos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    practicas = sum(len(u["intermedias"]) for u in UNIDADES)
    pruebas = sum(len(u["practicas"]) for u in UNIDADES)
    preguntas = sum(len(u["test"]) for u in UNIDADES)
    print(
        f"✓ {curso}: 9 unidades en 3 evaluaciones · {practicas} prácticas · "
        f"{pruebas} programaciones de prueba · {preguntas} preguntas de test"
    )


