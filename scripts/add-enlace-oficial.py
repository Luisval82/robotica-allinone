#!/usr/bin/env python3
"""Añade (o actualiza) video.enlaceOficial en los archivos de contenido de las
unidades, con un recurso REAL y verificado de education.lego.com que encaja
con el tema de cada unidad. Las unidades sin una correspondencia oficial
razonable se dejan sin tocar (siguen mostrando el aviso de «añade tu vídeo»).

Uso: python3 scripts/add-enlace-oficial.py
"""
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent / "src" / "data" / "contenido"

# curso-unidad -> (título del recurso, URL oficial verificada)
ENLACES = {
    "1ESO-1": ("LEGO Education: «Digital Sign» (luces y sonido en el Hub)",
               "https://education.lego.com/en-us/lessons/prime-python-communicating-ideas/digital-sign"),
    "1ESO-2": ("LEGO Education: «Making Moves with Motors»",
               "https://education.lego.com/en-us/lessons/get-moving-with-motors/making-moves-with-motors/"),
    "1ESO-3": ("LEGO Education: «New Moves with Motors» (posición absoluta)",
               "https://education.lego.com/en-us/lessons/get-moving-with-motors/new-moves-with-motors/"),
    "1ESO-4": ("LEGO Education: «Warm Up Loop with Leo» (bucles)",
               "https://education.lego.com/en-us/lessons/spike-python-u4-doing-reps-with-loops/spike-python-u4l1-warm-up-loop-with-leo"),
    "1ESO-5": ("LEGO Education: «Start Sensing» (sensor de fuerza)",
               "https://education.lego.com/en-us/lessons/spike-python-u3-sensor-control/spike-python-u3l1-start-sensing/"),
    "1ESO-6": ("LEGO Education: «Training Camp 1 — Driving Around»",
               "https://education.lego.com/en-us/lessons/prime-competition-ready/training-camp-1-driving-around/"),
    "1ESO-7": ("LEGO Education: «Cart Control» (sensor de distancia)",
               "https://education.lego.com/en-us/lessons/spike-python-u3-sensor-control/spike-python-u3l3/"),
    "1ESO-8": ("LEGO Education: «Training Camp 3 — Reacting to Lines» (sensor de color)",
               "https://education.lego.com/en-us/lessons/prime-competition-ready/training-camp-3-react-to-lines/"),
    # 1ESO-9 (proyecto final): sin recurso oficial específico — se deja vacío.

    "2ESO-1": ("LEGO Education: «Setting Conditions for Yoga» (si/entonces/si no)",
               "https://education.lego.com/en-us/lessons/spike-python-u4-doing-reps-with-loops/spike-python-u4l4-setting-conditions-for-yoga/"),
    "2ESO-2": ("LEGO Education: «Training Camp 3 — Reacting to Lines» (seguir línea)",
               "https://education.lego.com/en-us/lessons/prime-competition-ready/training-camp-3-react-to-lines/"),
    "2ESO-3": ("LEGO Education: «Counting Reps with Leo» (variables)",
               "https://education.lego.com/en-au/lessons/spike-python-u4-doing-reps-with-loops/spike-python-u4l2-counting-reps-with-leo/"),
    # 2ESO-4 (operadores): sin recurso oficial específico — se deja vacío.
    "2ESO-5": ("LEGO Education: «Get Moving to Get Data» (medir con el sensor de fuerza)",
               "https://education.lego.com/en-us/lessons/spike-python-u9-data-and-math-functions/spike-python-u9l1-get-moving-to-get-data"),
    # 2ESO-6 (giroscopio): sin recurso oficial específico — se deja vacío.
    # 2ESO-7 (eventos/mensajes): sin recurso oficial específico — se deja vacío.
    # 2ESO-8 (cronómetro/azar): sin recurso oficial específico — se deja vacío.
    "2ESO-9": ("LEGO Education: «Training Camp 2 — Playing with Objects» (clasificadora)",
               "https://education.lego.com/en-us/lessons/prime-competition-ready/training-camp-2-playing-with-objects/"),

    "3ESO-1": ("LEGO Education: «My Code, Our Program» (Mis bloques)",
               "https://education.lego.com/en-us/lessons/prime-competition-ready/my-code-our-program/"),
    "3ESO-2": ("LEGO Education: «Training Camp 3 — Reacting to Lines» (seguidor proporcional)",
               "https://education.lego.com/en-us/lessons/prime-competition-ready/training-camp-3-react-to-lines/"),
    "3ESO-3": ("LEGO Education: «Hopper Run» (mecanismos con motores)",
               "https://education.lego.com/en-us/lessons/get-moving-with-motors/hopper-run/"),
    "3ESO-4": ("LEGO Education: «Listing Letters» (listas)",
               "https://education.lego.com/en-us/lessons/spike-python-u10-lists/spike-u10l1-listing-letters/"),
    "3ESO-5": ("LEGO Education: «Safe Delivery» (control con realimentación)",
               "https://education.lego.com/en-us/lessons/spike-python-u3-sensor-control/spike-python-u3l4-safe-delivery/"),
    "3ESO-6": ("LEGO Education: «Setting Conditions for Yoga» (estados y condiciones)",
               "https://education.lego.com/en-us/lessons/spike-python-u4-doing-reps-with-loops/spike-python-u4l4-setting-conditions-for-yoga/"),
    "3ESO-7": ("LEGO Education: «Get Moving to Get Data» (datos y gráficas)",
               "https://education.lego.com/en-us/lessons/spike-python-u9-data-and-math-functions/spike-python-u9l1-get-moving-to-get-data"),
    "3ESO-8": ("LEGO Education: «Make It Move» (navegación autónoma)",
               "https://education.lego.com/en-us/lessons/spike-python-u9-data-and-math-functions/spike-python-u9l4-make-it-move/"),
    "3ESO-9": ("LEGO Education: «Assembling an Advanced Driving Base» (proyecto final)",
               "https://education.lego.com/en-us/lessons/prime-competition-ready/assembling-an-advanced-driving-base/"),
}

updated, skipped = [], []

for path in sorted(BASE.glob("*.json")):
    key = path.stem
    data = json.loads(path.read_text(encoding="utf-8"))
    video = data.get("video")
    if not isinstance(video, dict):
        skipped.append((key, "sin bloque video"))
        continue

    if key not in ENLACES:
        skipped.append((key, "sin recurso oficial asignado"))
        continue

    titulo_enlace, url_enlace = ENLACES[key]

    # Reconstruimos el dict «video» para mantener un orden de claves legible:
    # titulo, duracion, enlaceOficial, (url si existiera), escenas.
    nuevo_video = {}
    nuevo_video["titulo"] = video.get("titulo")
    nuevo_video["duracion"] = video.get("duracion")
    nuevo_video["enlaceOficial"] = {"titulo": titulo_enlace, "url": url_enlace}
    if "url" in video:
        nuevo_video["url"] = video["url"]
    nuevo_video["escenas"] = video.get("escenas")

    data["video"] = nuevo_video
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    updated.append(key)

print(f"Actualizadas ({len(updated)}): {', '.join(updated)}")
print(f"Sin recurso oficial ({len(skipped)}): {', '.join(k for k, _ in skipped)}")
