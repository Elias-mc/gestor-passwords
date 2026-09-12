#!/usr/bin/env bash
set -euo pipefail

platform="${1:-}"
release_dir="release"
downloads_dir="downloads"

case "$platform" in
  linux)
    target="--linux AppImage"
    extension="AppImage"
    label="Linux"
    ;;
  windows)
    target="--win nsis"
    extension="exe"
    label="Windows"
    ;;
  macos)
    target="--mac dmg"
    extension="dmg"
    label="macOS"
    ;;
  *)
    echo "Uso: npm run electron:download:<linux|windows|macos>" >&2
    exit 1
    ;;
esac

npm run build
rm -f "$release_dir"/*."$extension" "$release_dir"/*-"$label".zip
npx electron-builder $target

artifact="$(find "$release_dir" -maxdepth 1 -type f -name "*.$extension" -print -quit)"
if [[ -z "$artifact" ]]; then
  echo "No se encontró el artefacto .$extension en $release_dir" >&2
  exit 1
fi

artifact_name="$(basename "$artifact")"
archive="$release_dir/${artifact_name%.$extension}-$label.zip"
if [[ "$platform" == "windows" ]]; then
  powershell.exe -NoProfile -Command \
    "Compress-Archive -Path '$artifact' -DestinationPath '$archive' -Force"
else
  zip -j "$archive" "$artifact"
fi
mkdir -p "$downloads_dir"
cp "$archive" "$downloads_dir/"
printf 'Descarga lista: %s\n' "$downloads_dir/$(basename "$archive")"
