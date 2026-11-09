<!-- AI engineering words over time (Observable Plot), one view per figure:
     timeline: Hacker News mentions per term and month, each row scaled to its
       own peak month (heatmap).
     pairs: Hacker News mentions next to new GitHub repos (10+ stars) per
       month, each line scaled to its own peak (small multiples).
     conf: share of AI Engineer talks that mention each term, World's Fair
       (July 2026) to Code Summit (November 2026) (slope chart).
     video: share of new AI repos with 300+ stars that make video or motion
       graphics, per month.
     momentum: Hacker News mentions and new repos in the last three months
       over the three before (dot plot, log scale).
     The table under each chart carries the same numbers without JavaScript. -->
<script lang="ts">
import data from "$lib/data/ai-trends.json"
import * as Plot from "@observablehq/plot"

type View = "timeline" | "pairs" | "conf" | "video" | "momentum"
let { view = "timeline" }: { view?: View } = $props()

type Row = { name: string; counts: number[] }
type Pair = {
	name: string
	hn: number[]
	gh: number[]
	hnN: number[]
	ghN: number[]
}
type Conf = { name: string; a: number; b: number }
type Mom = {
	name: string
	hn: number | null
	gh: number | null
	hnN: number
	ghN: number
}

const hnMonths = data.hn.months as string[]
const rows = data.hn.terms as Row[]
const pairMonths = data.pairs.months as string[]
const pairs = data.pairs.terms as Pair[]
const confLabels = data.conf.labels as [string, string]
const confRows = data.conf.rows as Conf[]
const video = data.video as {
	months: string[]
	share: number[]
	n: number[]
	total: number[]
	top: [string, number, string][]
}
const momentum = data.momentum as Mom[]

const fmt = (n: number) => n.toLocaleString("en-US")
const date = (m: string) => new Date(`${m}-01T00:00:00Z`)
const monthLabel = (m: string) =>
	date(m).toLocaleDateString("en-US", {
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	})

let el: HTMLDivElement
let width = $state(640)
const narrow = $derived(width < 520)

// Comma syntax, because d3's color interpolation can't parse "hsl(h s l / a)".
function color(name: string, alpha = 1) {
	const [h, s, l] = getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim()
		.split(/\s+/)
	return `hsla(${h}, ${s}, ${l}, ${alpha})`
}
const base = () => ({
	fontFamily: "inherit",
	fontSize: "11px",
	color: color("--ink-soft"),
	background: "transparent",
	overflow: "visible",
})
const tipStyle = () => ({
	fill: color("--paper"),
	stroke: color("--ink", 0.18),
})

function timeline() {
	const cells = rows.flatMap(r => {
		const peak = Math.max(...r.counts) || 1
		return r.counts.map((c, i) => ({
			name: r.name,
			month: hnMonths[i],
			c,
			v: c / peak,
		}))
	})
	return Plot.plot({
		width,
		height: rows.length * (narrow ? 20 : 22) + 40,
		marginLeft: narrow ? 134 : 140,
		marginTop: 22,
		marginRight: 4,
		marginBottom: 4,
		style: base(),
		x: {
			type: "band",
			domain: hnMonths,
			axis: "top",
			tickSize: 0,
			label: null,
			tickFormat: (m: string) => (m.endsWith("-01") ? m.slice(0, 4) : ""),
			padding: 0.08,
		},
		y: {
			domain: rows.map(r => r.name),
			label: null,
			tickSize: 0,
			tickPadding: 6,
			padding: 0.08,
		},
		color: {
			type: "linear",
			domain: [0, 1],
			range: [color("--ink", 0.04), color("--accent")],
		},
		marks: [
			Plot.cell(cells, { x: "month", y: "name", fill: "v", rx: 1.5 }),
			Plot.tip(
				cells,
				Plot.pointer({
					x: "month",
					y: "name",
					title: d =>
						`${d.name}, ${monthLabel(d.month)}\n${fmt(d.c)} Hacker News stories and comments`,
					...tipStyle(),
				})
			),
		],
	})
}

function small() {
	const cols = narrow ? 2 : 3
	const lines = pairs.flatMap((p, k) =>
		pairMonths.flatMap((m, i) => [
			{
				k,
				name: p.name,
				src: "Hacker News",
				month: date(m),
				v: p.hn[i],
				n: p.hnN[i],
			},
			{
				k,
				name: p.name,
				src: "New repos",
				month: date(m),
				v: p.gh[i],
				n: p.ghN[i],
			},
		])
	)
	const fx = (d: { k: number }) => d.k % cols
	const fy = (d: { k: number }) => Math.floor(d.k / cols)
	const rowsN = Math.ceil(pairs.length / cols)
	return Plot.plot({
		width,
		height: rowsN * 96 + 30,
		marginLeft: 4,
		marginRight: 4,
		marginTop: 22,
		marginBottom: 22,
		style: base(),
		fx: { axis: null, padding: 0.12 },
		fy: { axis: null, padding: 0.32 },
		x: {
			type: "utc",
			ticks: narrow ? 2 : 3,
			tickFormat: "%Y",
			tickSize: 0,
			label: null,
		},
		y: { axis: null, domain: [0, 1] },
		color: {
			domain: ["Hacker News", "New repos"],
			range: [color("--ink", 0.45), color("--accent")],
		},
		marks: [
			Plot.ruleY([0], { stroke: color("--ink", 0.15) }),
			Plot.areaY(
				lines.filter(d => d.src === "New repos"),
				{
					x: "month",
					y: "v",
					fx,
					fy,
					fill: color("--accent", 0.14),
					curve: "monotone-x",
				}
			),
			Plot.lineY(lines, {
				x: "month",
				y: "v",
				z: "src",
				stroke: "src",
				fx,
				fy,
				strokeWidth: 1.75,
				curve: "monotone-x",
			}),
			Plot.text(
				pairs.map((p, k) => ({ k, name: p.name })),
				{
					fx,
					fy,
					frameAnchor: "top-left",
					dy: -14,
					text: "name",
					fill: color("--ink"),
					fontSize: 12,
				}
			),
			Plot.tip(
				lines,
				Plot.pointerX({
					x: "month",
					y: "v",
					fx,
					fy,
					title: d =>
						`${d.name}, ${monthLabel(d.month.toISOString().slice(0, 7))}\n${d.src}: ${fmt(d.n)}`,
					...tipStyle(),
				})
			),
		],
	})
}

// A dumbbell per word: July in gray, November in the accent when it grew.
function conf() {
	const pts = confRows.flatMap(r => [
		{ name: r.name, at: confLabels[0], v: r.a, first: true },
		{
			name: r.name,
			at: confLabels[1],
			v: r.b,
			first: false,
			up: r.b > r.a,
		},
	])
	return Plot.plot({
		width,
		height: confRows.length * 24 + 34,
		marginLeft: narrow ? 134 : 140,
		marginRight: 30,
		marginTop: 26,
		marginBottom: 6,
		style: base(),
		x: {
			axis: "top",
			grid: true,
			tickSize: 0,
			label: null,
			tickFormat: (v: number) => `${v}%`,
			ticks: 5,
		},
		y: {
			domain: confRows.map(r => r.name),
			label: null,
			tickSize: 0,
			tickPadding: 8,
		},
		marks: [
			Plot.gridX({ stroke: color("--ink", 0.08), strokeOpacity: 1 }),
			Plot.ruleY(confRows, {
				y: "name",
				x1: "a",
				x2: "b",
				stroke: r =>
					r.b > r.a ? color("--accent", 0.5) : color("--ink", 0.2),
				strokeWidth: 2,
			}),
			Plot.dot(pts, {
				x: "v",
				y: "name",
				r: 4.5,
				fill: d =>
					d.first
						? color("--ink", 0.3)
						: d.up
							? color("--accent")
							: color("--ink", 0.6),
				stroke: color("--paper"),
				strokeWidth: 1.5,
			}),
			Plot.tip(
				confRows,
				Plot.pointerY({
					x: "b",
					y: "name",
					title: r =>
						`${r.name}\n${confLabels[0]}: ${r.a}% of talks\n${confLabels[1]}: ${r.b}% of talks`,
					...tipStyle(),
				})
			),
		],
	})
}

function videoChart() {
	const pts = video.months.map((m, i) => ({
		month: date(m),
		m,
		v: video.share[i],
		n: video.n[i],
		t: video.total[i],
	}))
	return Plot.plot({
		width,
		height: 220,
		marginLeft: 34,
		marginRight: 8,
		marginTop: 16,
		marginBottom: 24,
		style: base(),
		x: {
			type: "band",
			domain: video.months,
			tickSize: 0,
			label: null,
			tickFormat: (m: string) =>
				m.endsWith("-01") || m === video.months[0] ? monthLabel(m) : "",
		},
		y: {
			grid: true,
			tickSize: 0,
			label: null,
			tickFormat: (v: number) => `${v}%`,
			ticks: 4,
		},
		marks: [
			Plot.gridY({ stroke: color("--ink", 0.08), strokeOpacity: 1 }),
			Plot.barY(pts, {
				x: "m",
				y: "v",
				fill: d =>
					d.m >= "2026-06" ? color("--accent") : color("--ink", 0.25),
				insetLeft: 2,
				insetRight: 2,
				rx: 2,
			}),
			Plot.tip(
				pts,
				Plot.pointerX({
					x: "m",
					y: "v",
					title: d =>
						`${monthLabel(d.m)}: ${d.n} of ${d.t} new AI repos (${d.v}%)`,
					...tipStyle(),
				})
			),
		],
	})
}

function momentumChart() {
	const pts = momentum
		.flatMap(m => [
			{ name: m.name, src: "Hacker News", r: m.hn, n: m.hnN },
			{ name: m.name, src: "New repos", r: m.gh, n: m.ghN },
		])
		.filter(d => d.r != null) as {
		name: string
		src: string
		r: number
		n: number
	}[]
	return Plot.plot({
		width,
		height: momentum.length * 24 + 40,
		marginLeft: narrow ? 134 : 140,
		marginRight: 14,
		marginTop: 26,
		marginBottom: 8,
		style: base(),
		x: {
			type: "log",
			domain: [0.125, 8],
			axis: "top",
			ticks: narrow ? [0.25, 1, 4] : [0.125, 0.25, 0.5, 1, 2, 4, 8],
			tickFormat: (v: number) => `${v}×`,
			tickSize: 0,
			label: null,
			grid: true,
		},
		y: {
			domain: momentum.map(m => m.name),
			label: null,
			tickSize: 0,
			tickPadding: 8,
		},
		color: {
			domain: ["Hacker News", "New repos"],
			range: [color("--ink", 0.5), color("--accent")],
		},
		marks: [
			Plot.gridX({ stroke: color("--ink", 0.08), strokeOpacity: 1 }),
			Plot.ruleX([1], { stroke: color("--ink", 0.35) }),
			Plot.ruleY(momentum, {
				y: "name",
				x1: d => Math.min(d.hn ?? 1, d.gh ?? 1),
				x2: d => Math.max(d.hn ?? 1, d.gh ?? 1),
				stroke: color("--ink", 0.15),
				strokeWidth: 2,
			}),
			Plot.dot(pts, {
				x: d => Math.min(8, Math.max(0.125, d.r)),
				y: "name",
				fill: "src",
				r: 4.5,
				stroke: color("--paper"),
				strokeWidth: 1.5,
			}),
			Plot.tip(
				pts,
				Plot.pointer({
					x: d => Math.min(8, Math.max(0.125, d.r)),
					y: "name",
					title: d =>
						`${d.name}, ${d.src}\n${d.r.toFixed(1)}× the three months before (${fmt(d.n)} in the last three)`,
					...tipStyle(),
				})
			),
		],
	})
}

function draw() {
	const make = {
		timeline,
		pairs: small,
		conf,
		video: videoChart,
		momentum: momentumChart,
	}[view]
	el.replaceChildren(make())
}

$effect(() => {
	width
	draw()
	const theme = new MutationObserver(draw)
	theme.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class", "data-theme", "style"],
	})
	return () => theme.disconnect()
})

const hints: Record<View, string> = {
	timeline:
		"Hacker News stories and comments per month. Each row is scaled to its own busiest month.",
	pairs: "Hacker News mentions and new GitHub repos with 10+ stars per month, each line scaled to its own peak.",
	conf: "Share of AI Engineer talks whose title, abstract or track mentions the word.",
	video: "Share of each month's new AI repos (300+ stars) that make video, animation or motion graphics.",
	momentum:
		"Last three months over the three before. Right of 1× is growing.",
}
</script>

<figure class="trends not-prose">
	<p class="hint font-mono">{hints[view]}</p>
	{#if view === "pairs" || view === "momentum"}
		<p class="key font-mono"><span><i class="hn"></i>Hacker News</span><span><i class="gh"></i>New repos</span></p>
	{:else if view === "conf"}
		<p class="key font-mono"><span><i class="dot jul"></i>{confLabels[0]}</span><span><i class="dot nov"></i>{confLabels[1]}</span></p>
	{/if}
	<div class="chart font-mono" bind:this={el} bind:clientWidth={width}></div>

	{#if view === "video"}
		<ol class="examples font-mono">
			{#each video.top as [repo, stars, desc]}
				<li><a href="https://github.com/{repo}" target="_blank" rel="noopener noreferrer">{repo}</a> <span>{fmt(stars)} stars</span><p>{desc}</p></li>
			{/each}
		</ol>
	{/if}

	<details class="font-mono">
		<summary>Table</summary>
		{#if view === "timeline"}
			<table>
				<thead><tr><th>Term</th><th>Busiest month</th><th>Mentions then</th><th>Last month</th></tr></thead>
				<tbody>
					{#each rows as r}
						{@const peak = Math.max(...r.counts)}
						<tr><td>{r.name}</td><td>{monthLabel(hnMonths[r.counts.indexOf(peak)])}</td><td>{fmt(peak)}</td><td>{fmt(r.counts[r.counts.length - 2])}</td></tr>
					{/each}
				</tbody>
			</table>
		{:else if view === "pairs"}
			<table>
				<thead><tr><th>Term</th><th>HN, last 3 months</th><th>New repos, last 3 months</th></tr></thead>
				<tbody>
					{#each pairs as p}
						<tr><td>{p.name}</td><td>{fmt(p.hnN.slice(-3).reduce((a, b) => a + b, 0))}</td><td>{fmt(p.ghN.slice(-3).reduce((a, b) => a + b, 0))}</td></tr>
					{/each}
				</tbody>
			</table>
		{:else if view === "conf"}
			<table>
				<thead><tr><th>Term</th><th>{confLabels[0]}</th><th>{confLabels[1]}</th></tr></thead>
				<tbody>
					{#each confRows as r}<tr><td>{r.name}</td><td>{r.a}%</td><td>{r.b}%</td></tr>{/each}
				</tbody>
			</table>
		{:else if view === "video"}
			<table>
				<thead><tr><th>Month</th><th>Video repos</th><th>New AI repos</th><th>Share</th></tr></thead>
				<tbody>
					{#each video.months as m, i}<tr><td>{monthLabel(m)}</td><td>{video.n[i]}</td><td>{video.total[i]}</td><td>{video.share[i]}%</td></tr>{/each}
				</tbody>
			</table>
		{:else}
			<table>
				<thead><tr><th>Term</th><th>Hacker News</th><th>New repos</th></tr></thead>
				<tbody>
					{#each momentum as m}<tr><td>{m.name}</td><td>{m.hn == null ? "–" : `${m.hn.toFixed(1)}×`}</td><td>{m.gh == null ? "–" : `${m.gh.toFixed(1)}×`}</td></tr>{/each}
				</tbody>
			</table>
		{/if}
	</details>
</figure>

<style>
	.trends {
		margin-block: 2rem;
	}

	.hint {
		margin-bottom: 0.25rem;
		color: hsl(var(--ink-soft));
		font-size: 0.6875rem;
	}

	.key {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.25rem;
		color: hsl(var(--ink-soft));
		font-size: 0.6875rem;
	}

	.key i {
		display: inline-block;
		width: 0.9rem;
		height: 2px;
		margin-right: 0.35rem;
		vertical-align: middle;
	}

	.key i.hn {
		background: hsl(var(--ink) / 0.45);
	}

	.key i.gh {
		background: hsl(var(--accent));
	}

	.key i.dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 50%;
	}

	.key i.jul {
		background: hsl(var(--ink) / 0.3);
	}

	.key i.nov {
		background: hsl(var(--accent));
	}

	.examples {
		margin: 0.75rem 0 0;
		padding: 0;
		list-style: none;
		font-size: 0.75rem;
		color: hsl(var(--ink-soft));
	}

	.examples li {
		padding: 0.35rem 0;
		border-top: 1px solid hsl(var(--ink) / 0.08);
	}

	.examples a {
		color: hsl(var(--ink));
	}

	.examples p {
		margin: 0.15rem 0 0;
	}

	details {
		margin-top: 0.75rem;
		color: hsl(var(--ink-soft));
		font-size: 0.75rem;
	}

	summary {
		cursor: pointer;
	}

	table {
		width: 100%;
		margin-top: 0.5rem;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}

	th,
	td {
		padding: 0.2rem 0.5rem 0.2rem 0;
		text-align: left;
		border-bottom: 1px solid hsl(var(--ink) / 0.08);
	}

	th {
		font-weight: 400;
	}
</style>
