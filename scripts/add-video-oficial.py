#!/usr/bin/env python3
"""Añade video.url con el enlace de EMBED oficial (source=embed) de LEGO
Education (reproductor 23video), en las unidades cuyo tema coincide con uno
de los vídeos reales que LEGO publica en:
https://education.lego.com/en-us/product-resources/spike-prime/teacher-resources/video-tutorials/

Solo hay vídeo oficial para Hub, Motores y Sensores — las demás unidades no
se tocan (siguen con la tarjeta de «Recurso oficial» y/o el aviso de vídeo).

Uso: python3 scripts/add-video-oficial.py
"""
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent / "src" / "data" / "contenido"

HUB = "https://legoeducation.23video.com/v.ihtml/player.html?token=d38c988135454133ec8220b25f9663e3&source=embed&photo_id=56312726&autoPlay=0&autoMute=0&hideBigPlay=1&showDescriptions=0"
MOTORS = "https://legoeducation.23video.com/v.ihtml/player.html?token=fe5792d1b14dd60f8950eab97f9da507&source=embed&photo_id=56312975&autoPlay=0&autoMute=0&hideBigPlay=1&showDescriptions=0"
SENSORS = "https://legoeducation.23video.com/v.ihtml/player.html?token=eda2ad810323412603b8cce60fac56bb&source=embed&photo_id=59327963&autoPlay=0&autoMute=0&hideBigPlay=1&showDescriptions=0"

VIDEOS = {
    "1ESO-1": HUB,       # Hub: luces y sonidos
    "1ESO-2": MOTORS,    # Motor: grados y rotaciones
    "1ESO-3": MOTORS,    # Motor como servo (posición absoluta)
    "1ESO-5": SENSORS,   # Sensor de fuerza
    "1ESO-7": SENSORS,   # Sensor de distancia
    "1ESO-8": SENSORS,   # Sensor de color
    "2ESO-5": SENSORS,   # Sensor de fuerza (medir)
    "2ESO-6": SENSORS,   # Giroscopio
    "3ESO-3": MOTORS,    # Motores de precisión / pinza
    "3ESO-5": SENSORS,   # Control con realimentación (sensores)
}

updated = []

for key, url in VIDEOS.items():
    path = BASE / f"{key}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    video = data["video"]

    nuevo_video = {}
    nuevo_video["titulo"] = video.get("titulo")
    nuevo_video["duracion"] = video.get("duracion")
    if "enlaceOficial" in video:
        nuevo_video["enlaceOficial"] = video["enlaceOficial"]
    nuevo_video["url"] = url
    nuevo_video["escenas"] = video.get("escenas")

    data["video"] = nuevo_video
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    updated.append(key)

print(f"Vídeo oficial embebido en ({len(updated)}): {', '.join(updated)}")
