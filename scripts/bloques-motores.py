"""Pone los bloques de MOTORES tal como salen en la app SPIKE.

Reescribe las entradas de la categoría «motores» en src/data/bloques.json con
sus partes (icono, puerto, palabras, huecos y desplegables) y migra las
referencias de las 27 unidades: el antiguo «valor» ("A · 5 segundos") pasa a
ser la lista de valores de los huecos del bloque.
"""

import glob
import json
import re

CAT = "src/data/bloques.json"

# ── Catálogo: los 7 bloques de Motores, tal cual se ven en la paleta ────────
NUEVOS = [
    {
        "texto": "A ir durante 1 rotaciones",
        "categoria": "motores",
        "forma": "pila",
        "partes": [
            {"t": "icono", "v": "motor"},
            {"t": "menu", "v": "A"},
            {"t": "palabra", "v": "ir"},
            {"t": "menu", "v": "↻"},
            {"t": "palabra", "v": "durante"},
            {"t": "hueco", "v": "1"},
            {"t": "menu", "v": "rotaciones"},
        ],
        "pendiente": False,
    },
    {
        "texto": "A ir por la ruta más corta a la posición 0",
        "categoria": "motores",
        "forma": "pila",
        "partes": [
            {"t": "icono", "v": "motor"},
            {"t": "menu", "v": "A"},
            {"t": "palabra", "v": "ir"},
            {"t": "menu", "v": "por la ruta más corta"},
            {"t": "palabra", "v": "a la posición"},
            {"t": "hueco", "v": "0"},
        ],
        "pendiente": False,
    },
    {
        "texto": "A arrancar motor",
        "categoria": "motores",
        "forma": "pila",
        "partes": [
            {"t": "icono", "v": "motor"},
            {"t": "menu", "v": "A"},
            {"t": "palabra", "v": "arrancar motor"},
            {"t": "menu", "v": "↻"},
        ],
        "pendiente": False,
    },
    {
        "texto": "A parar motor",
        "categoria": "motores",
        "forma": "pila",
        "partes": [
            {"t": "icono", "v": "motor"},
            {"t": "menu", "v": "A"},
            {"t": "palabra", "v": "parar motor"},
        ],
        "pendiente": False,
    },
    {
        "texto": "A fijar velocidad al 75 %",
        "categoria": "motores",
        "forma": "pila",
        "partes": [
            {"t": "icono", "v": "motor"},
            {"t": "menu", "v": "A"},
            {"t": "palabra", "v": "fijar velocidad al"},
            {"t": "hueco", "v": "75"},
            {"t": "palabra", "v": "%"},
        ],
        "pendiente": False,
    },
    {
        "texto": "A posición",
        "categoria": "motores",
        "forma": "dato",
        "partes": [
            {"t": "icono", "v": "motor"},
            {"t": "menu", "v": "A"},
            {"t": "palabra", "v": "posición"},
        ],
        "pendiente": False,
    },
    {
        "texto": "A velocidad",
        "categoria": "motores",
        "forma": "dato",
        "partes": [
            {"t": "icono", "v": "motor"},
            {"t": "menu", "v": "A"},
            {"t": "palabra", "v": "velocidad"},
        ],
        "pendiente": False,
    },
]

SUSTITUIDOS = {
    "Accionar motor durante",
    "Motor Ir a la posición",
    "Arrancar motor",
    "Parar motor",
    "Fijar velocidad al… %",
    "Posición del motor",
}

UNIDADES = {"rotación": "rotaciones", "rotaciones": "rotaciones",
            "grado": "grados", "grados": "grados",
            "segundo": "segundos", "segundos": "segundos"}

RUTAS = {
    "camino más corto": "por la ruta más corta",
    "sentido horario": "en sentido horario",
    "sentido antihorario": "en sentido antihorario",
}


def trozos(valor: str) -> list[str]:
    return [p.strip() for p in (valor or "").split("·") if p.strip()]


def migrar_fila(texto: str, valor: str) -> tuple[str, list[str]] | None:
    """Devuelve (nombre nuevo del bloque, valores de sus huecos)."""
    p = trozos(valor)
    puerto = p[0] if p else "A"

    if texto == "Accionar motor durante":
        numero, unidad = "1", "rotaciones"
        if len(p) > 1:
            m = re.match(r"([\d.,]+)\s*(\w+)", p[1])
            if m:
                numero = m.group(1)
                unidad = UNIDADES.get(m.group(2).lower(), m.group(2))
        return "A ir durante 1 rotaciones", [puerto, "↻", numero, unidad]

    if texto == "Motor Ir a la posición":
        posicion = p[1] if len(p) > 1 else "0"
        ruta = RUTAS.get(p[2].lower(), p[2]) if len(p) > 2 else "por la ruta más corta"
        return "A ir por la ruta más corta a la posición 0", [puerto, ruta, posicion]

    if texto == "Arrancar motor":
        return "A arrancar motor", [puerto, "↻"]
    if texto == "Parar motor":
        return "A parar motor", [puerto]
    if texto == "Fijar velocidad al… %":
        return "A fijar velocidad al 75 %", [puerto, p[1] if len(p) > 1 else "75"]
    if texto == "Posición del motor":
        return "A posición", [puerto]
    return None


def main() -> None:
    catalogo = json.load(open(CAT, encoding="utf-8"))
    resto = [b for b in catalogo["bloques"] if b["texto"] not in SUSTITUIDOS]
    corte = next((i for i, b in enumerate(resto) if b["categoria"] == "motores"), len(resto))
    catalogo["bloques"] = resto[:corte] + NUEVOS + resto[corte:]
    json.dump(catalogo, open(CAT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"Catálogo: {len(NUEVOS)} bloques de motores puestos tal cual SPIKE.")

    total = 0
    for ruta in sorted(glob.glob("src/data/contenido/*.json")):
        datos = json.load(open(ruta, encoding="utf-8"))
        cambios = 0

        def recorre(o):
            nonlocal cambios
            if isinstance(o, dict):
                t = o.get("texto")
                if isinstance(t, str) and t in SUSTITUIDOS:
                    nuevo = migrar_fila(t, o.get("valor") or "")
                    if nuevo:
                        o["texto"], o["valores"] = nuevo
                        o.pop("valor", None)
                        cambios += 1
                for v in o.values():
                    recorre(v)
            elif isinstance(o, list):
                for v in o:
                    recorre(v)

        recorre(datos)
        if cambios:
            json.dump(datos, open(ruta, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
            total += cambios
            print(f"  {ruta.split('/')[-1]}: {cambios} bloques migrados")
    print(f"Total: {total} bloques de motores migrados en el contenido.")


if __name__ == "__main__":
    main()
