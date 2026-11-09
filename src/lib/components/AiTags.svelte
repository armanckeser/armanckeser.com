<!-- GitHub topics on AI repos with 300+ stars, 2023-2026 (Observable Plot).
     view="anchors": share of each half-year's new repos that carry a tag, one
     line per tag, the current one in the accent.
     view="health": median health score (0-10, Stars Organizer's formula) of
     the repos under each tag, one bar per tag; tap a bar for its biggest repos.
     The table under each chart carries the same numbers without JavaScript. -->
<script lang="ts">
import data from "$lib/data/ai-tags.json"
import * as Plot from "@observablehq/plot"

let { view = "anchors" }: { view?: "anchors" | "tree" | "health" } = $props()

type Family = {
	parent: string
	n: number
	accent?: boolean
	children: { tag: string; n: number; pct: number }[]
}
const families = data.families as Family[]

type Anchor = {
	tag: string
	share: number[]
	counts: number[]
	accent?: boolean
}
type Tag = {
	tag: string
	n: number
	health: number
	vs: number
	active: number
	accent?: boolean
	top: [string, number, number][]
}
const halves = data.halves as string[]
const totals = data.totals as number[]
const anchors = data.anchors as Anchor[]
const tags = data.tags as Tag[]
const fmt = (n: number) => n.toLocaleString("en-US")
const signed = (v: number, digits = 1) =>
	`${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(digits)}`

// Parent tags and the tags that mostly appear with them. A leaf's label is the
// share of its repos that also carry the parent.
const treePaths = families.flatMap(f =>
	f.children.map(c => ({
		path: `/${f.parent}/${c.tag} ${c.pct}%`,
	}))
)
const leaves = treePaths.length

let el: HTMLDivElement
let width = $state(640)
let selected = $state<Tag | null>(null)

function color(name: string, alpha = 1) {
	const v = getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim()
	return `hsl(${v} / ${alpha})`
}

const ROW = 26
const height = $derived(
	view === "anchors"
		? 300
		: view === "tree"
			? leaves * 19 + 16
			: tags.length * ROW + 40
)

function anchorsChart() {
	const ink = color("--ink")
	const soft = color("--ink-soft")
	const points = anchors.flatMap(a =>
		a.share.map((s, i) => ({
			tag: a.tag,
			half: halves[i],
			share: s,
			count: a.counts[i],
			total: totals[i],
			accent: !!a.accent,
		}))
	)
	const peaks = anchors.map(a => {
		const i = a.share.indexOf(Math.max(...a.share))
		return {
			tag: a.tag,
			half: halves[i],
			share: a.share[i],
			accent: !!a.accent,
		}
	})
	const stroke = (d: { accent: boolean }) =>
		d.accent ? color("--accent") : color("--ink", 0.55)
	return Plot.plot({
		width,
		height,
		marginTop: 24,
		marginLeft: 36,
		marginRight: 8,
		marginBottom: 28,
		style: {
			fontFamily: "inherit",
			fontSize: "11px",
			color: soft,
			background: "transparent",
			overflow: "visible",
		},
		x: {
			type: "point",
			domain: halves,
			label: null,
			tickSize: 0,
			tickFormat: (h: string, i: number) =>
				width < 520 ? (h.endsWith("H1") ? h.slice(0, 4) : "") : h,
			padding: 0.2,
		},
		y: {
			domain: [0, 50],
			ticks: 5,
			tickFormat: (v: number) => `${v}%`,
			label: null,
			grid: true,
			tickSize: 0,
		},
		marks: [
			Plot.gridY({ stroke: color("--ink", 0.08), strokeOpacity: 1 }),
			Plot.line(points, {
				x: "half",
				y: "share",
				z: "tag",
				stroke,
				strokeWidth: (d: { accent: boolean }) =>
					d.accent ? 2.5 : 1.75,
				curve: "monotone-x",
			}),
			Plot.dot(points, { x: "half", y: "share", fill: stroke, r: 2.5 }),
			Plot.text(peaks, {
				x: "half",
				y: "share",
				text: "tag",
				dy: -10,
				fill: (d: { accent: boolean }) =>
					d.accent ? color("--accent") : ink,
				fontWeight: 600,
				fontSize: 12,
			}),
			Plot.tip(
				halves.map((h, i) => ({ h, i })),
				Plot.pointerX({
					x: "h",
					y: () => 48,
					title: ({ h, i }: { h: string; i: number }) =>
						`${h}: ${fmt(totals[i])} new repos\n` +
						anchors
							.map(
								a =>
									`${a.tag} ${a.share[i]}% (${fmt(a.counts[i])})`
							)
							.join("\n"),
					fill: color("--paper"),
					stroke: color("--ink", 0.18),
				})
			),
		],
	})
}

function healthChart() {
	const ink = color("--ink")
	const soft = color("--ink-soft")
	const chart = Plot.plot({
		width,
		height,
		marginTop: 26,
		marginLeft: width < 520 ? 132 : 150,
		marginRight: 16,
		marginBottom: 14,
		style: {
			fontFamily: "inherit",
			fontSize: "11px",
			color: soft,
			background: "transparent",
			overflow: "visible",
		},
		x: {
			domain: [-2, 2],
			axis: "top",
			ticks: [-2, -1, 0, 1, 2],
			tickFormat: (v: number) => signed(v, 0),
			label: null,
			tickSize: 0,
		},
		y: {
			domain: tags.map(t => t.tag),
			label: null,
			tickSize: 0,
			tickPadding: 8,
		},
		marks: [
			Plot.gridX({ stroke: color("--ink", 0.08), strokeOpacity: 1 }),
			Plot.ruleX([0], { stroke: color("--ink", 0.35) }),
			Plot.ruleY(tags, {
				x1: 0,
				x2: "vs",
				y: "tag",
				stroke: (t: Tag) =>
					t.accent ? color("--accent") : color("--ink", 0.3),
				strokeWidth: 2,
			}),
			Plot.dot(tags, {
				x: "vs",
				y: "tag",
				r: 4.5,
				fill: (t: Tag) =>
					t.accent ? color("--accent") : color("--ink", 0.5),
				stroke: color("--paper"),
				strokeWidth: 2,
			}),
			Plot.dot(selected ? [selected] : [], {
				x: "vs",
				y: "tag",
				r: 7,
				stroke: ink,
				strokeWidth: 1.5,
			}),
			Plot.text(
				tags.filter(t => t.vs >= 0),
				{
					x: "vs",
					y: "tag",
					text: (t: Tag) => signed(t.vs),
					textAnchor: "start",
					dx: 10,
					fill: soft,
				}
			),
			Plot.text(
				tags.filter(t => t.vs < 0),
				{
					x: "vs",
					y: "tag",
					text: (t: Tag) => signed(t.vs),
					textAnchor: "end",
					dx: -10,
					fill: soft,
				}
			),
			Plot.tip(
				selected ? [] : tags,
				Plot.pointerY({
					x: "vs",
					y: "tag",
					title: (t: Tag) =>
						`${t.tag}: ${fmt(t.n)} repos\n${signed(t.vs)} vs repos the same age (health ${t.health.toFixed(1)} of 10)\n${t.active}% still active`,
					fill: color("--paper"),
					stroke: color("--ink", 0.18),
				})
			),
		],
	})
	chart.style.cursor = "pointer"
	chart.addEventListener("click", () => {
		const v = (chart as unknown as { value?: Tag }).value
		selected = !v || selected?.tag === v.tag ? null : v
	})
	return chart
}

function treeChart() {
	const ink = color("--ink")
	return Plot.plot({
		width,
		height,
		margin: 8,
		marginLeft: 0,
		marginRight: width < 520 ? 158 : 170,
		axis: null,
		style: {
			fontFamily: "inherit",
			fontSize: width < 520 ? "10px" : "11.5px",
			color: ink,
			background: "transparent",
			overflow: "visible",
		},
		marks: [
			Plot.cluster(treePaths, {
				path: "path",
				delimiter: "/",
				stroke: color("--ink", 0.25),
				fill: color("--ink", 0.55),
				r: 2.5,
				textStroke: color("--paper"),
			}),
		],
	})
}

function draw() {
	el.replaceChildren(
		view === "anchors"
			? anchorsChart()
			: view === "tree"
				? treeChart()
				: healthChart()
	)
}

function onKey(e: KeyboardEvent) {
	if (e.key === "Escape") selected = null
}

$effect(() => {
	width
	selected
	draw()
	const theme = new MutationObserver(draw)
	theme.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class", "data-theme", "style"],
	})
	return () => theme.disconnect()
})
</script>

<svelte:window onkeydown={onKey} />

<figure class="tags not-prose">
	{#if view === "health"}
		<p class="hint font-mono">Median health score of the tag's repos minus the median for all repos created in the same half-year. Tap a row for its biggest repos.</p>
	{:else if view === "tree"}
		<p class="hint font-mono">Parent tag, then the tags that mostly appear with it and the share of their repos that also carry the parent.</p>
	{:else}
		<p class="hint font-mono">Share of each half-year's new AI repos that carry the tag.</p>
	{/if}

	<div class="chart font-mono" bind:this={el} bind:clientWidth={width} style:min-height="{height}px"></div>

	{#if view === "health" && selected}
		<div class="pick font-mono" aria-live="polite">
			<button class="close" type="button" aria-label="Close" onclick={() => (selected = null)}>×</button>
			<p><b>{selected.tag}</b>: {fmt(selected.n)} repos, {selected.active}% still active</p>
			<ol>
				{#each selected.top as [repo, stars, health]}
					<li>
						<a href="https://github.com/{repo}" target="_blank" rel="noopener noreferrer">{repo}</a>
						<span>{fmt(stars)} stars · health {health.toFixed(1)}</span>
					</li>
				{/each}
			</ol>
		</div>
	{/if}

	<div class="key font-mono">
		{#if view === "health"}
			<span>Health: commit recency 30%, issues closed 20%, contributors 20%, stars per month 15%, release recency 15%. Archived repos score 0. Active: a commit in the last 6 months (as of {data.asOf}).</span>
		{/if}
		<a href="/data/ai-repo-tags-2023-2026.csv" download>Data (CSV)</a>
	</div>

	<details class="font-mono">
		<summary>Table</summary>
		{#if view === "anchors"}
			<table>
				<thead><tr><th>Half</th><th>New repos</th>{#each anchors as a}<th>{a.tag}</th>{/each}</tr></thead>
				<tbody>
					{#each halves as h, i}
						<tr><td>{h}</td><td>{fmt(totals[i])}</td>{#each anchors as a}<td>{a.share[i]}%</td>{/each}</tr>
					{/each}
				</tbody>
			</table>
		{:else if view === "tree"}
			<table>
				<thead><tr><th>Parent</th><th>Tag</th><th>Repos</th><th>Also tag the parent</th></tr></thead>
				<tbody>
					{#each families as f}
						{#each f.children as c}
							<tr><td>{f.parent}</td><td>{c.tag}</td><td>{fmt(c.n)}</td><td>{c.pct}%</td></tr>
						{/each}
					{/each}
				</tbody>
			</table>
		{:else}
			<table>
				<thead><tr><th>Tag</th><th>Repos</th><th>vs same age</th><th>Health</th><th>Still active</th></tr></thead>
				<tbody>
					{#each tags as t}
						<tr><td>{t.tag}</td><td>{fmt(t.n)}</td><td>{signed(t.vs)}</td><td>{t.health.toFixed(1)}</td><td>{t.active}%</td></tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</details>
</figure>

<style>
	.tags {
		margin-block: 2rem;
	}

	.hint {
		margin-bottom: 0.25rem;
		color: hsl(var(--ink-soft));
		font-size: 0.6875rem;
	}

	.pick {
		position: relative;
		margin-top: 0.5rem;
		padding: 0.75rem 2rem 0.75rem 0.9rem;
		background: hsl(var(--paper));
		box-shadow: 0 6px 24px hsl(var(--ink) / 0.12);
		border: 1px solid hsl(var(--ink) / 0.12);
		border-radius: 6px;
		font-size: 0.75rem;
		color: hsl(var(--ink-soft));
	}

	.pick b {
		color: hsl(var(--ink));
		font-weight: 600;
	}

	.close {
		position: absolute;
		top: 0.35rem;
		right: 0.5rem;
		padding: 0.25rem 0.5rem;
		color: hsl(var(--ink-soft));
		font-size: 1rem;
		line-height: 1;
		background: none;
		border: 0;
		cursor: pointer;
	}

	.pick ol {
		margin: 0.5rem 0 0;
		padding: 0;
		list-style: none;
	}

	.pick li {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.15rem 0;
	}

	.pick li a {
		overflow: hidden;
		color: hsl(var(--ink));
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.pick li span {
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
	}

	.key {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.25rem;
		margin-top: 0.6rem;
		color: hsl(var(--ink-soft));
		font-size: 0.6875rem;
	}

	.key a {
		color: hsl(var(--ink));
		text-decoration: underline;
		text-underline-offset: 3px;
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
