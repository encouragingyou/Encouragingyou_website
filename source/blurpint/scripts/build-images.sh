#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/../media_attachment"
IMAGE_DIR="$ROOT_DIR/images"
ICON_DIR="$ROOT_DIR/icons"

mkdir -p "$IMAGE_DIR" "$ICON_DIR"

render_webp() {
  local input="$1"
  local width="$2"
  local output="$3"
  ffmpeg -hide_banner -loglevel error -y \
    -i "$input" \
    -vf "scale=${width}:-2:flags=lanczos" \
    -c:v libwebp \
    -quality 82 \
    -compression_level 6 \
    "$output"
}

render_avif() {
  local input="$1"
  local width="$2"
  local output="$3"
  ffmpeg -hide_banner -loglevel error -y \
    -i "$input" \
    -vf "scale=${width}:-2:flags=lanczos" \
    -c:v libaom-av1 \
    -still-picture 1 \
    -crf 34 \
    -cpu-used 6 \
    -row-mt 1 \
    "$output"
}

render_responsive_set() {
  local input="$1"
  local stem="$2"
  shift 2

  for width in "$@"; do
    render_webp "$input" "$width" "$IMAGE_DIR/${stem}-${width}.webp"
    render_avif "$input" "$width" "$IMAGE_DIR/${stem}-${width}.avif"
  done
}

render_icon() {
  local input="$1"
  local stem="$2"
  ffmpeg -hide_banner -loglevel error -y \
    -i "$input" \
    -vf "scale=320:320:flags=lanczos" \
    -c:v libwebp \
    -quality 88 \
    -compression_level 6 \
    "$ICON_DIR/${stem}.webp"
}

render_responsive_set "$SOURCE_DIR/1) Homepage hero illustration.png" "hero" 800 1200 1600
render_responsive_set "$SOURCE_DIR/2) About page : youth-led leadership illustration.png" "about" 640 960 1280
render_responsive_set "$SOURCE_DIR/3) Programme card series Community  Friendship.png" "community-friendship" 480 720 960
render_responsive_set "$SOURCE_DIR/4) Programme card series Personal Growth.png" "personal-growth" 480 720 960
render_responsive_set "$SOURCE_DIR/5) Programme card series Career Support.png" "career-support" 480 720 960
render_responsive_set "$SOURCE_DIR/6) Intergenerational community support illustration.png" "intergenerational" 800 1200 1600
render_responsive_set "$SOURCE_DIR/7) Volunteer : partner call-to-action illustration.png" "volunteer-partner" 800 1200 1600

render_icon "$SOURCE_DIR/8) Custom icon set for UX and wayfinding/8) Custom icon set for UX and wayfinding.png" "safe-space"
render_icon "$SOURCE_DIR/8) Custom icon set for UX and wayfinding/ChatGPT Image Apr 22, 2026, 12_29_27 AM (2).png" "mentoring"
render_icon "$SOURCE_DIR/8) Custom icon set for UX and wayfinding/ChatGPT Image Apr 22, 2026, 12_29_27 AM (3).png" "cv-support"
render_icon "$SOURCE_DIR/8) Custom icon set for UX and wayfinding/ChatGPT Image Apr 22, 2026, 12_29_27 AM (4).png" "youth-activities"
render_icon "$SOURCE_DIR/8) Custom icon set for UX and wayfinding/ChatGPT Image Apr 22, 2026, 12_29_27 AM (5).png" "growth"
render_icon "$SOURCE_DIR/8) Custom icon set for UX and wayfinding/ChatGPT Image Apr 22, 2026, 12_29_27 AM (6).png" "community-event"
render_icon "$SOURCE_DIR/8) Custom icon set for UX and wayfinding/ChatGPT Image Apr 22, 2026, 12_29_28 AM (7).png" "intergenerational-connection"
render_icon "$SOURCE_DIR/8) Custom icon set for UX and wayfinding/ChatGPT Image Apr 22, 2026, 12_29_28 AM (8).png" "contact"

echo "Responsive image assets written to $IMAGE_DIR and $ICON_DIR"
