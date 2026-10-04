// Rasterize the site-wide social card. SVG is not renderable by X or Slack card
// scrapers, so the committed asset has to be a PNG at exactly 1200x630.
// Uses the same resvg and JetBrains Mono TTFs as the per-post cards.
import { readFileSync, writeFileSync } from "node:fs"
import { Resvg } from "@resvg/resvg-js"

const svg = readFileSync("scripts/og-card.svg", "utf8")
const png = new Resvg(svg, {
	fitTo: { mode: "width", value: 1200 },
	font: {
		loadSystemFonts: false,
		fontFiles: [
			"src/lib/server/og/JetBrainsMono-Regular.ttf",
			"src/lib/server/og/JetBrainsMono-Bold.ttf",
		],
		defaultFontFamily: "JetBrains Mono",
	},
})
	.render()
	.asPng()
writeFileSync("static/og.png", png)
console.log("wrote static/og.png")
