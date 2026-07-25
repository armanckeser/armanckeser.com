#!/usr/bin/env bash
# Rasterize the social card. SVG is not renderable by X or Slack card scrapers,
# so the committed asset has to be a PNG at exactly 1200x630.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

rsvg-convert \
	--width 1200 --height 630 \
	--output "$root/static/og.png" \
	"$root/scripts/og-card.svg"

echo "wrote static/og.png"
