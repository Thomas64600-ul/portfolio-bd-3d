#!/usr/bin/env bash

BASE="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons"

declare -A ICONS=(
  [react]="react"
  [vite]="vite"
  [javascript]="javascript"
  [html]="html5"
  [css]="css3"
  [tailwind]="tailwindcss"

  [node]="nodedotjs"
  [express]="express"
  [jwt]="jsonwebtokens"
  [postman]="postman"

  [mongodb]="mongodb"
  [postgresql]="postgresql"
  [git]="git"
  [github]="github"
  [vercel]="vercel"
  [render]="render"
  [cloudinary]="cloudinary"
  [stripe]="stripe"
)

cd "$(dirname "$0")"

for name in "${!ICONS[@]}"; do
  slug="${ICONS[$name]}"
  url="$BASE/$slug.svg"
  echo "Downloading $name.svg ($slug)"
  curl -fL "$url" -o "${name}.svg" || echo "⚠️  $name introuvable"
done

echo "✅ Téléchargement terminé"

