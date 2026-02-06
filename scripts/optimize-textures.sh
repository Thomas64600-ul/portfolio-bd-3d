#!/usr/bin/env bash
set -euo pipefail

ROOT="public/textures"
Q=78   # qualité WebP (70-85 = très bon compromis)

echo "=== OPTIMISATION TEXTURES PORTFOLIO 3D ==="
echo ""

convert_img () {
  local src="$1"
  local max="$2"
  local out="${src%.*}.webp"

  if [ -f "$out" ]; then
    echo "↩︎ skip $(basename "$out")"
    return
  fi

  convert "$src" \
    -resize "${max}x${max}>" \
    -strip \
    -quality 92 \
    -define webp:method=6 \
    -define webp:quality="$Q" \
    "$out"

  local a b
  a=$(stat -c%s "$src" 2>/dev/null || echo 0)
  b=$(stat -c%s "$out" 2>/dev/null || echo 0)

  if [ "$a" -gt 0 ] && [ "$b" -gt 0 ]; then
    echo "✅ $(basename "$src") → $((100*b/a))%"
  else
    echo "✅ $(basename "$src")"
  fi
}

convert_dir () {
  local dir="$1"
  local size="$2"

  [ ! -d "$dir" ] && return

  echo ">> $dir ($size px)"

  find "$dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 |
  while IFS= read -r -d '' f; do
    convert_img "$f" "$size"
  done
}

# Posters
convert_dir "$ROOT/posters" 1200

# BD / Manga / Comics
convert_dir "$ROOT/bd" 1400
convert_dir "$ROOT/manga" 1400
convert_dir "$ROOT/comics" 1400

# Diplômes
convert_dir "$ROOT/diplomas" 1600

# Textures principales
[ -f "$ROOT/stone_wall.jpg" ] && convert_img "$ROOT/stone_wall.jpg" 2048
[ -f "$ROOT/wood_floor.jpg" ] && convert_img "$ROOT/wood_floor.jpg" 2048
[ -f "$ROOT/plaster_ceiling.jpg" ] && convert_img "$ROOT/plaster_ceiling.jpg" 2048
[ -f "$ROOT/plaster_ceiling2.jpg" ] && convert_img "$ROOT/plaster_ceiling2.jpg" 2048
[ -f "$ROOT/world_map.jpg" ] && convert_img "$ROOT/world_map.jpg" 2048

# Cartes voyages
find "$ROOT/travels" -type f -iname "map.png" -print0 2>/dev/null |
while IFS= read -r -d '' f; do
  convert_img "$f" 1200
done

echo ""
echo "=== TERMINÉ ==="
echo ""
echo "👉 Remplace maintenant les .jpg/.png par .webp dans ton code"
