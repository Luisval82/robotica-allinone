"""Convierte el enunciado de cada práctica en una lista de pasos.

Los enunciados están escritos como una frase seguida («Pon la luz en verde,
espera 2 segundos, cámbiala a rojo y espera otros 2»), que para un alumno de
1º de ESO es una pared de texto. Esto los parte en los pasos que ya llevan
dentro, sin inventarse nada: lo único que se hace es cortar por donde la
propia frase separa una acción de la siguiente.

Regla de oro: si el corte no queda limpio —si algún trozo no empieza por un
verbo de acción—, la frase se deja entera. Media frase suelta en la pantalla
de un alumno es peor que la frase completa.
"""

import json
import glob
import re
import unicodedata

# Verbos con los que empieza una acción en estos enunciados: en imperativo
# («espera»), en tercera persona («gira») o con pronombre («se apague»).
VERBOS = {
    "abre", "acerca", "aleja", "anota", "apaga", "apagala", "arranca", "avanza", "avisa",
    "aparece", "baja", "borra", "busca", "calcula", "cambia", "cambiala", "cierra", "clasifica",
    "coge", "compara", "comprueba", "cuenta", "detecta", "detiene", "deten", "dibuja", "divide",
    "elige", "empieza", "empuja", "enciende", "enciendela", "ensena", "entrega", "escribe",
    "espera", "fija", "frena", "gira", "guarda", "haz", "lee", "levanta", "lleva", "marca",
    "mide", "monta", "mueve", "multiplica", "para", "parala", "pita", "pon", "ponla", "prueba",
    "recorre", "registra", "reinicia", "repite", "resta", "retrocede", "sigue", "suba", "sube",
    "suelta", "suena", "suma", "toca", "traza", "usa", "vuelve", "muestra", "manda", "envia",
}

# Arranques que también valen porque marcan el paso siguiente.
ARRANQUES = ("se ", "despues", "luego", "al final", "a los ", "por ultimo", "cuando ", "si ",
             "mientras ", "al terminar", "al empezar", "hasta ")


def sin_tildes(texto: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", texto.lower()) if unicodedata.category(c) != "Mn"
    )


# Coletillas que PARECEN el paso siguiente y no lo son: «después de cada
# paso», «antes de abrir»… Van pegadas al paso anterior.
COLETILLAS = ("despues de", "antes de", "al mismo tiempo", "en cuanto que", "todo ", "sin ")


def empieza_bien(trozo: str) -> bool:
    limpio = sin_tildes(trozo.strip())
    if limpio.startswith(COLETILLAS):
        return False
    if limpio.startswith(ARRANQUES):
        return True
    primera = re.split(r"[^a-z]", limpio, maxsplit=1)[0]
    return primera in VERBOS


def trocear(frase: str):
    """Corta una frase por sus comas y por su «y» final."""
    frase = frase.strip().rstrip(".")
    # «y, justo después,» cuenta como un solo corte.
    frase = re.sub(r"\s+y,\s*", ", ", frase)
    trozos = [t.strip() for t in frase.split(",") if t.strip()]

    # El último trozo suele traer dos acciones unidas por «y».
    if trozos:
        ultimo = trozos[-1]
        corte = re.search(r"\s+y\s+(?=\S)", ultimo)
        if corte and empieza_bien(ultimo[corte.end():]):
            trozos[-1] = ultimo[: corte.start()].strip()
            trozos.append(ultimo[corte.end():].strip())
    return [t for t in trozos if t]


def mayuscula(texto: str) -> str:
    return texto[0].upper() + texto[1:] if texto else texto


def frases(enunciado: str):
    """Las oraciones del enunciado. Un paso nunca cruza un punto."""
    return [f.strip() for f in re.split(r"(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])", enunciado) if f.strip()]


def juntar_colgantes(trozos):
    """Lo que no empieza por una acción se pega al paso anterior.

    «…y vuelve a bajarla, todo dentro del bucle» no son dos pasos: el segundo
    trozo es una coletilla del primero.
    """
    salida = []
    for trozo in trozos:
        if salida and not empieza_bien(trozo):
            salida[-1] = f"{salida[-1]}, {trozo}"
        else:
            salida.append(trozo)
    return salida


def pasos_de(enunciado: str):
    """Los pasos de un enunciado. Lista vacía = déjalo tal cual está."""
    pasos = []

    for frase in frases(enunciado):
        # Con dos puntos, lo de delante es el objetivo y lo de detrás, los pasos.
        cabeza, _, cola = frase.partition(":")
        if cola.strip():
            # El punto y coma manda sobre la coma. «Si A, haz B; si C, haz D»
            # son DOS pasos, no cuatro: cortando por comas se parten los pares
            # y cada mitad queda sin sentido.
            if ";" in cola:
                hijos = [t.strip(" .") for t in cola.split(";") if t.strip(" .")]
            else:
                hijos = juntar_colgantes(trocear(cola))
            if len(hijos) >= 2:
                pasos.append(
                    {"texto": mayuscula(cabeza.strip()), "hijos": [mayuscula(h) for h in hijos]}
                )
            else:
                pasos.append({"texto": mayuscula(frase.rstrip("."))})
            continue

        # Con punto y coma la frase lleva dentro dos ideas contrapuestas
        # («pita; si no, se queda en silencio»): se deja de una pieza.
        trozos = [] if ";" in frase else trocear(frase)
        # Si la frase ARRANCA con una coletilla («Después de cada paso, …»),
        # esa coletilla es del primer paso, no un paso suelto.
        if len(trozos) >= 2 and sin_tildes(trozos[0]).startswith(COLETILLAS):
            trozos = [f"{trozos[0]}, {trozos[1]}"] + trozos[2:]
        # Todos los trozos menos el primero tienen que empezar por una acción.
        if len(trozos) >= 2 and all(empieza_bien(t) for t in trozos[1:]):
            pasos.extend({"texto": mayuscula(t)} for t in trozos)
        else:
            pasos.append({"texto": mayuscula(frase.rstrip("."))})

    # Un solo paso sin hijos es la frase de siempre: no hay nada que desglosar.
    if len(pasos) < 2 and not any("hijos" in paso for paso in pasos):
        return []
    return pasos


def main() -> None:
    partidos = enteros = 0
    for fichero in sorted(glob.glob("src/data/contenido/*.json")):
        datos = json.load(open(fichero, encoding="utf-8"))
        for practica in datos.get("intermedias", []) + datos.get("practicas", []):
            pasos = pasos_de(practica["enunciado"])
            if pasos:
                practica["pasos"] = pasos
                partidos += 1
            else:
                practica.pop("pasos", None)
                enteros += 1
        json.dump(datos, open(fichero, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"{partidos} enunciados desglosados, {enteros} se quedan de una pieza.")


if __name__ == "__main__":
    main()
