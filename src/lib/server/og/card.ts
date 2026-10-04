import { readFileSync } from "node:fs"
import { join } from "node:path"
import { Resvg } from "@resvg/resvg-js"
import satori from "satori"

/**
 * The social card for one post, rendered at build time: the same terminal look
 * as static/og.png, with the post's own title and description, so a link to a
 * post shows what the post is about instead of the site-wide card.
 *
 * Satori can't read woff2, so the card carries its own TTF copies of JetBrains
 * Mono (OFL, see OFL.txt next to them).
 */

const fontDir = join(process.cwd(), "src", "lib", "server", "og")
const fonts = [
	{
		name: "JetBrains Mono",
		weight: 400 as const,
		file: "JetBrainsMono-Regular.ttf",
	},
	{
		name: "JetBrains Mono",
		weight: 700 as const,
		file: "JetBrainsMono-Bold.ttf",
	},
].map(f => ({
	...f,
	data: readFileSync(join(fontDir, f.file)),
	style: "normal" as const,
}))

const color = {
	bg: "#0a0a0b",
	accent: "#1fdc8c",
	text: "#fafafa",
	muted: "#bfbfc7",
	faint: "#8b8b95",
}

type Node = {
	type: string
	props: {
		style?: Record<string, unknown>
		children?: Node | Node[] | string
	}
}
const el = (
	type: string,
	style: Record<string, unknown>,
	children?: Node | Node[] | string
): Node => ({ type, props: { style, children } })

/** Cut at a word boundary so the card never ends mid-word. */
function clip(text: string, max: number): string {
	if (text.length <= max) return text
	const cut = text.slice(0, max)
	return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "")}…`
}

export async function renderCard(post: {
	slug: string
	title: string
	description?: string
	date: string
}): Promise<Buffer> {
	// Monospace at ~0.6em per character over a 1008px line: keep titles to two lines.
	const long = post.title.length > 32
	const titleSize = post.title.length > 60 ? 48 : long ? 56 : 80
	const year = new Date(post.date).getUTCFullYear()

	const tree = el(
		"div",
		{
			width: "100%",
			height: "100%",
			display: "flex",
			flexDirection: "column",
			backgroundColor: color.bg,
			borderTop: `6px solid ${color.accent}`,
			padding: "72px 96px 64px",
			fontFamily: "JetBrains Mono",
		},
		[
			el("div", { display: "flex", fontSize: 28, color: color.muted }, [
				el("span", { color: color.accent, marginRight: 16 }, "$"),
				el("span", {}, `cat ~/writing/${post.slug}`),
			]),
			el(
				"div",
				{
					display: "flex",
					marginTop: 40,
					fontSize: titleSize,
					fontWeight: 700,
					lineHeight: 1.12,
					color: color.text,
				},
				post.title
			),
			post.description
				? el(
						"div",
						{
							display: "flex",
							marginTop: 32,
							fontSize: 28,
							lineHeight: 1.45,
							color: color.muted,
						},
						clip(post.description, long ? 110 : 150)
					)
				: el("div", {}),
			el(
				"div",
				{
					display: "flex",
					marginTop: "auto",
					justifyContent: "space-between",
					fontSize: 26,
					color: color.faint,
				},
				[
					el("div", { display: "flex" }, [
						el("span", {}, "armanckeser.com"),
						el(
							"span",
							{ color: color.accent, marginLeft: 14 },
							"▋"
						),
					]),
					el("span", {}, `Armanc Keser · ${year}`),
				]
			),
		]
	)

	// biome-ignore lint/suspicious/noExplicitAny: satori takes React-shaped plain objects
	const svg = await satori(tree as any, { width: 1200, height: 630, fonts })
	return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
		.render()
		.asPng()
}
