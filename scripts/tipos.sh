#!/usr/bin/env bash
# Comprueba los tipos y avisa solo de lo que es NUEVO.
#
# Por qué así: en este entorno no hay node_modules, de modo que `tsc` no
# encuentra los tipos de React, de Next ni de Node y escupe cientos de
# errores que en Vercel no existen. Filtrarlos por código de error (TS2322,
# TS2345…) es tentador y es justo lo que falló: un filtro de TS2322 se llevó
# por delante un error de verdad (un r="2.6" donde iba un número) y el fallo
# apareció en el build de Vercel, el peor sitio donde encontrarlo.
#
# Así que no se filtra por criterio: se guarda una foto del ruido conocido
# (scripts/tipos-base.txt, tomada de un commit que Vercel compiló bien) y se
# compara. Si aparece un error que no estaba en la foto, es tuyo.
#
#   ./scripts/tipos.sh          comprueba
#   ./scripts/tipos.sh --fijar  vuelve a tomar la foto (solo si Vercel va bien)
set -uo pipefail
cd "$(dirname "$0")/.."

BASE="scripts/tipos-base.txt"

# Sin números de línea: así una línea de más no inventa un error nuevo.
actual=$(npx tsc --noEmit 2>&1 | grep -E "^src/" | sed -E 's/\([0-9]+,[0-9]+\)//' | sort -u)

if [ "${1:-}" = "--fijar" ]; then
  printf '%s\n' "$actual" > "$BASE"
  echo "Foto tomada: $(wc -l < "$BASE") errores conocidos."
  exit 0
fi

[ -f "$BASE" ] || { echo "Falta $BASE. Haz ./scripts/tipos.sh --fijar"; exit 1; }

nuevos=$(comm -23 <(printf '%s\n' "$actual") <(sort -u "$BASE"))

if [ -z "$nuevos" ]; then
  echo "✓ sin errores de tipos nuevos"
else
  echo "✗ errores de tipos NUEVOS (estos no son ruido del sandbox):"
  printf '%s\n' "$nuevos"
  exit 1
fi
