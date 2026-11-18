"""Saca de cada unidad su lista de materiales, a partir de la frase de piezas.

La frase de «construccion.piezas» de cada unidad está escrita para leerse
(«El Hub, un motor grande con su cable, un eje largo, vigas para la rueda…»).
Esto la convierte en una lista con la que la plataforma puede enseñar las
miniaturas de la caja.

Lo que el texto dice, se pone. Lo que no dice —cuántas vigas, de qué medida—
NO se inventa: se queda sin cantidad y el alumno coge las que necesite. Para
fijar medidas exactas hay que montar el modelo y anotarlas: entonces se edita
la lista de esa unidad a mano, que para eso queda escrita en su archivo.
"""

import json
import glob
import re
import unicodedata

NUMEROS = {
    "un": 1, "una": 1, "uno": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5,
    "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10,
}

# Cada pieza, con lo que hay que buscar en el texto para darla por nombrada.
# Se buscan TODAS las apariciones: una misma frase puede nombrar dos motores
# distintos («dos motores medianos con ruedas, un motor grande»).
PATRONES = [
    ("hub", r"\bhub\b"),
    ("motor-grande", r"motor(?:es)?\s+grandes?"),
    ("motor", r"motor(?:es)?(?:\s+medianos?)?"),
    ("rueda", r"\bruedas?\b|neumatic"),
    ("engranaje", r"engranajes?"),
    ("eje", r"\bejes?\b"),
    ("viga", r"\bvigas?\b|\bbarras?\b"),
    ("panel", r"\bpaneles?\b"),
    ("marco", r"\bmarcos?\b"),
    ("cremallera", r"\bcremalleras?\b"),
    ("goma", r"\bgomas?\b"),
    ("pasador", r"\bpasador(?:es)?\b|\bconector(?:es)?\b"),
    ("buje", r"\bbujes?\b"),
    ("pieza-pequena", r"piezas? pequen"),
]

# Los tres sensores se nombran muchas veces en racimo («los sensores de
# color, distancia y fuerza»), así que se buscan por su palabra suelta.
SENSORES = [
    ("distancia", r"\bdistancias?\b|ultrasonid"),
    ("color", r"\bcolor(?:es)?\b"),
    ("fuerza", r"\bfuerzas?\b"),
]

# Lo que viene detrás de esto NO hace falta: es la lista de lo que sobra.
NEGACIONES = r"no hace falta|no hacen falta|no necesitas|no lleva|sin motor|sin sensor"


def sin_tildes(texto: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", texto.lower()) if unicodedata.category(c) != "Mn"
    )


def cantidad_antes(texto: str, posicion: int):
    """El número que va JUSTO delante de la pieza, si lo hay.

    Solo la palabra inmediatamente anterior. Mirando más atrás se cuela el
    número de otra pieza: en «un eje largo, vigas para la rueda», ese «un» es
    del eje, no de las vigas.
    """
    palabras = re.findall(r"[a-z0-9]+", texto[max(0, posicion - 30) : posicion])
    if not palabras:
        return None
    ultima = palabras[-1]
    if ultima.isdigit():
        return int(ultima)
    return NUMEROS.get(ultima)


def materiales_de(frase: str):
    texto = sin_tildes(frase)
    # Se corta en la negación: «El Hub y vigas. No hace falta ningún motor».
    corte = re.search(NEGACIONES, texto)
    if corte:
        texto = texto[: corte.start()]

    encontradas = []
    grandes = [m.span() for m in re.finditer(PATRONES[1][1], texto)]

    for pieza, patron in PATRONES:
        for m in re.finditer(patron, texto):
            # «motor grande» ya se contó: el genérico no lo cuenta otra vez.
            if pieza == "motor" and any(a <= m.start() < b for a, b in grandes):
                continue
            material = {"pieza": pieza, "donde": m.start()}
            cantidad = cantidad_antes(texto, m.start())
            if cantidad is not None:
                material["cantidad"] = cantidad
            encontradas.append(material)
            # De cada pieza, la primera vez con número; si no, la primera.
            if cantidad is None and pieza != "motor":
                break

    for pieza, patron in SENSORES:
        m = re.search(patron, texto)
        if m and "sensor" in texto:
            encontradas.append({"pieza": pieza, "donde": m.start()})

    # Una pieza, una entrada: la que traiga cantidad manda.
    mejor = {}
    for material in encontradas:
        previo = mejor.get(material["pieza"])
        if previo is None:
            mejor[material["pieza"]] = material
        elif "cantidad" in material and "cantidad" not in previo:
            mejor[material["pieza"]] = material
        elif "cantidad" in material and "cantidad" in previo:
            previo["cantidad"] += material["cantidad"]

    orden = sorted(mejor.values(), key=lambda x: x["donde"])
    return [{k: v for k, v in m.items() if k != "donde"} for m in orden]


def main() -> None:
    total = 0
    for fichero in sorted(glob.glob("src/data/contenido/*.json")):
        datos = json.load(open(fichero, encoding="utf-8"))
        construccion = datos.get("construccion")
        if not construccion:
            continue
        construccion["materiales"] = materiales_de(construccion.get("piezas", ""))
        total += len(construccion["materiales"])
        json.dump(datos, open(fichero, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"{total} materiales repartidos en 27 unidades.")


if __name__ == "__main__":
    main()
