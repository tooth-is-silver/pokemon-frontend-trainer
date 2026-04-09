#!/bin/bash
# 1세대 151마리 앞면 스프라이트 다운로드
DEST="public/sprites"
BASE_URL="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon"

mkdir -p "$DEST"

for i in $(seq 1 151); do
  if [ ! -f "$DEST/$i.png" ]; then
    curl -sL "$BASE_URL/$i.png" -o "$DEST/$i.png"
    echo "Downloaded: $i.png"
  else
    echo "Skip (exists): $i.png"
  fi
done

echo "Done. $(ls "$DEST"/*.png 2>/dev/null | wc -l) sprites in $DEST"
