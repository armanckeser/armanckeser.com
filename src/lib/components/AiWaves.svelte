<!-- AI repos with 300+ stars created 2023-2025, one panel per type, all panels
     on the same scale (Observable Plot facets). Bars are new repos per month:
     the ones still active in the accent, the ones that went quiet (archived, or
     no commit in six months) in gray. Drawn in the browser; the table under the
     chart carries the same numbers without JavaScript. -->
<script lang="ts">
import * as Plot from "@observablehq/plot"
import waves from "$lib/data/ai-waves.json"

type Type = {
	name: string
	total: number
	active: number
	counts: [number, number][]
}
const quarters = (waves.months as string[]).map(
	m => new Date(`${m}-01T00:00:00Z`)
)
const quarterEnd = (d: Date) =>
	new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 3, 1))
const types = waves.types as Type[]
const events = (waves.events as { month: string; label: string }[]).map(e => ({
	...e,
	date: new Date(`${e.month}-15T00:00:00Z`),
}))

const PANEL = 70
const height = types.length * PANEL + 56
const pct = (t: Type) => Math.round((t.active / t.total) * 100)

const bars = types.flatMap(t =>
	t.counts.flatMap(([active, quiet], i) => [
		{
			type: t.name,
			start: quarters[i],
			end: quarterEnd(quarters[i]),
			status: "active",
			n: active,
		},
		{
			type: t.name,
			start: quarters[i],
			end: quarterEnd(quarters[i]),
			status: "quiet",
			n: quiet,
		},
	])
)
const perQuarter = types.flatMap(t =>
	t.counts.map(([active, quiet], i) => ({
		type: t.name,
		mid: new Date(
			(quarters[i].getTime() + quarterEnd(quarters[i]).getTime()) / 2
		),
		label: `Q${quarters[i].getUTCMonth() / 3 + 1} ${quarters[i].getUTCFullYear()}`,
		active,
		quiet,
		n: active + quiet,
	}))
)

let el: HTMLDivElement
let width = $state(640)

function color(name: string, alpha = 1) {
	const v = getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim()
	return `hsl(${v} / ${alpha})`
}

function draw() {
	const ink = color("--ink")
	const soft = color("--ink-soft")
	const chart = Plot.plot({
		width,
		height,
		marginTop: 44,
		marginLeft: 0,
		marginRight: 0,
		marginBottom: 22,
		style: {
			fontFamily: "inherit",
			fontSize: "11px",
			color: soft,
			background: "transparent",
			overflow: "visible",
		},
		x: {
			type: "utc",
			domain: [quarters[0], new Date("2026-01-01T00:00:00Z")],
			ticks: "year",
			tickFormat: "%Y",
			label: null,
			tickSize: 0,
		},
		y: { axis: null },
		fy: { domain: types.map(t => t.name), axis: null, padding: 0.42 },
		color: {
			domain: ["active", "quiet"],
			range: [color("--accent"), color("--ink", 0.2)],
		},
		marks: [
			Plot.ruleX(events, { x: "date", stroke: color("--ink", 0.12) }),
			Plot.text(events, {
				x: "date",
				fy: () => types[0].name,
				frameAnchor: "top",
				dy: -30,
				text: "label",
				fill: soft,
			}),
			Plot.ruleY([0], { stroke: color("--ink", 0.15) }),
			Plot.rectY(bars, {
				x1: "start",
				x2: "end",
				y: "n",
				fill: "status",
				fy: "type",
				insetLeft: 2,
				insetRight: 2,
				order: ["active", "quiet"],
			}),
			Plot.text(types, {
				fy: "name",
				frameAnchor: "top-left",
				dy: -12,
				text: "name",
				fill: ink,
				fontSize: 12.5,
			}),
			Plot.text(types, {
				fy: "name",
				frameAnchor: "top-right",
				dy: -12,
				text: (t: Type) =>
					width < 520
						? `${pct(t)}% active`
						: `${t.total.toLocaleString("en-US")} repos · ${pct(t)}% still active`,
				fill: soft,
			}),
			Plot.tip(
				perQuarter,
				Plot.pointerX({
					x: "mid",
					y: "n",
					fy: "type",
					title: d =>
						`${d.type}, ${d.label}\n${d.n} new · ${d.active} active · ${d.quiet} quiet`,
					fill: color("--paper"),
					stroke: color("--ink", 0.18),
				})
			),
		],
	})
	el.replaceChildren(chart)
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
</script>

<figure class="waves not-prose">
	<div class="chart font-mono" bind:this={el} bind:clientWidth={width} style:min-height="{height}px"></div>

	<div class="key font-mono">
		<span><i class="active"></i>still active</span>
		<span><i class="quiet"></i>quiet: archived, or no commit in 6 months (as of {waves.asOf})</span>
		<a href="/data/ai-repos-2023-2025.csv" download>Data (CSV)</a>
	</div>

	<details class="font-mono">
		<summary>Table</summary>
		<table>
			<thead><tr><th>Type</th><th>Repos</th><th>Still active</th></tr></thead>
			<tbody>
				{#each types as t}
					<tr><td>{t.name}</td><td>{t.total}</td><td>{t.active} ({pct(t)}%)</td></tr>
				{/each}
			</tbody>
		</table>
	</details>
</figure>

<style>
	.waves {
		margin-block: 2rem;
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

	.key span {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.key i {
		display: inline-block;
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 2px;
	}

	.key i.active {
		background: hsl(var(--accent));
	}

	.key i.quiet {
		background: hsl(var(--ink) / 0.22);
	}

	details {
		margin-top: 0.8rem;
		color: hsl(var(--ink-soft));
		font-size: 0.75rem;
	}

	summary {
		cursor: pointer;
	}

	table {
		margin-top: 0.5rem;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.25rem 1rem 0.25rem 0;
		text-align: left;
		font-weight: 400;
		font-variant-numeric: tabular-nums;
	}
</style>
