<!-- AI repos with 300+ stars created 2023-2026, one panel per type, all panels
     on the same scale (Observable Plot facets). Bars are new repos per quarter:
     the ones still active in the accent, the ones that went quiet (archived, or
     no commit in six months) in gray, repos too young to tell in a
     light accent. Drawn in the browser; the table under the
     chart carries the same numbers without JavaScript. -->
<script lang="ts">
import * as Plot from "@observablehq/plot"
import waves from "$lib/data/ai-waves.json"

type Type = {
	name: string
	total: number
	active: number
	quiet: number
	counts: [number, number, number][]
	top: [string, number][][][]
}
const STATUS = ["active", "quiet", "new"]
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
const pct = (t: Type) => Math.round((t.active / (t.active + t.quiet)) * 100)

const bars = types.flatMap(t =>
	t.counts.flatMap((c, i) =>
		STATUS.map((status, k) => ({
			type: t.name,
			start: quarters[i],
			end: quarterEnd(quarters[i]),
			status,
			n: c[k],
		}))
	)
)
const perQuarter = types.flatMap((t, ti) =>
	t.counts.map(([active, quiet, fresh], i) => ({
		ti,
		qi: i,
		type: t.name,
		mid: new Date(
			(quarters[i].getTime() + quarterEnd(quarters[i]).getTime()) / 2
		),
		label: `Q${quarters[i].getUTCMonth() / 3 + 1} ${quarters[i].getUTCFullYear()}`,
		active,
		quiet,
		fresh,
		n: active + quiet + fresh,
	}))
)

let el: HTMLDivElement
let width = $state(640)
type Pick = (typeof perQuarter)[number]
let selected = $state<Pick | null>(null)
const picked = $derived(
	selected && { ...selected, top: types[selected.ti].top[selected.qi] }
)
// The card sits right under the tapped panel, scrolled into view if needed.
let cardTop = $state(0)
let card = $state<HTMLDivElement>()
const fmt = (n: number) => n.toLocaleString("en-US")

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
			domain: [quarters[0], new Date("2027-01-01T00:00:00Z")],
			ticks: "year",
			tickFormat: "%Y",
			label: null,
			tickSize: 0,
		},
		y: { axis: null },
		fy: { domain: types.map(t => t.name), axis: null, padding: 0.42 },
		color: {
			domain: STATUS,
			range: [
				color("--accent"),
				color("--ink", 0.2),
				color("--accent", 0.35),
			],
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
				order: ["active", "new", "quiet"],
			}),
			Plot.rect(selected ? [selected] : [], {
				className: "picked-bar",
				x1: d => quarters[d.qi],
				x2: d => quarterEnd(quarters[d.qi]),
				y1: 0,
				y2: "n",
				fy: "type",
				insetLeft: 0.5,
				insetRight: 0.5,
				fill: "none",
				stroke: ink,
				strokeWidth: 1.5,
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
			// The card replaces the tip while it is open.
			Plot.tip(
				selected ? [] : perQuarter,
				Plot.pointerX({
					x: "mid",
					y: "n",
					fy: "type",
					title: d =>
						`${d.type}, ${d.label}\n${d.n} new · ${d.active} active · ${d.quiet} quiet${d.fresh ? ` · ${d.fresh} too new to tell` : ""}`,
					fill: color("--paper"),
					stroke: color("--ink", 0.18),
				})
			),
		],
	})
	chart.style.cursor = "pointer"
	chart.addEventListener("click", () => {
		const v = (chart as unknown as { value?: Pick }).value
		selected =
			!v || (selected && v.ti === selected.ti && v.qi === selected.qi)
				? null
				: v
	})
	el.replaceChildren(chart)
	place()
}

function place() {
	const bar = el?.querySelector(".picked-bar rect")
	if (!bar) return
	cardTop =
		bar.getBoundingClientRect().bottom - el.getBoundingClientRect().top + 8
}

$effect(() => {
	if (!card || !cardTop) return
	const c = card
	// After the new top is laid out.
	requestAnimationFrame(() =>
		c.scrollIntoView({ block: "nearest", behavior: "smooth" })
	)
})

function onKey(e: KeyboardEvent) {
	if (e.key === "Escape") selected = null
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

<svelte:window onkeydown={onKey} />

<figure class="waves not-prose">
	<p class="hint font-mono">Tap a bar to see its biggest repos.</p>
	<div class="stage">
	<div class="chart font-mono" bind:this={el} bind:clientWidth={width} style:min-height="{height}px"></div>

	{#if picked}
	<div class="pick font-mono" aria-live="polite" style:top="{cardTop}px" bind:this={card}>
		<button class="close" type="button" aria-label="Close" onclick={() => (selected = null)}>×</button>
		<p><b>{picked.type}, {picked.label}</b>: {fmt(picked.n)} new repos</p>
		<div class="lists">
			{#each [["Biggest still active", 0], ["Biggest gone quiet", 1], ["Too new to tell", 2]] as const as [title, k]}
				{#if picked.top[k].length}
					<div>
						<h4><i class={["active", "quiet", "new"][k]}></i>{title}</h4>
						<ol>
							{#each picked.top[k] as [repo, stars]}
								<li>
									<a href="https://github.com/{repo}" target="_blank" rel="noopener noreferrer">{repo}</a>
									<span>{fmt(stars)}</span>
								</li>
							{/each}
						</ol>
					</div>
				{/if}
			{/each}
		</div>
	</div>
	{/if}
	</div>

	<div class="key font-mono">
		<span><i class="active"></i>still active</span>
		<span><i class="quiet"></i>quiet: archived, or no commit in 6 months (as of {waves.asOf})</span>
		<span><i class="new"></i>too new to tell: created after {waves.newAfter}</span>
		<a href="/data/ai-repos-2023-2026.csv" download>Data (CSV)</a>
	</div>

	<details class="font-mono">
		<summary>Table</summary>
		<table>
			<thead><tr><th>Type</th><th>Repos</th><th>Still active</th><th>Too new to tell</th></tr></thead>
			<tbody>
				{#each types as t}
					<tr><td>{t.name}</td><td>{t.total}</td><td>{t.active} ({pct(t)}%)</td><td>{t.total - t.active - t.quiet}</td></tr>
				{/each}
			</tbody>
		</table>
	</details>
</figure>

<style>
	.waves {
		margin-block: 2rem;
	}

	.hint {
		margin-bottom: 0.25rem;
		color: hsl(var(--ink-soft));
		font-size: 0.6875rem;
	}

	.stage {
		position: relative;
	}

	.pick {
		position: absolute;
		left: 0;
		right: 0;
		z-index: 2;
		padding: 0.75rem 2rem 0.75rem 0.9rem;
		background: hsl(var(--paper));
		box-shadow: 0 6px 24px hsl(var(--ink) / 0.12);
		border: 1px solid hsl(var(--ink) / 0.12);
		border-radius: 6px;
		font-size: 0.75rem;
		color: hsl(var(--ink-soft));
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

	.pick b {
		color: hsl(var(--ink));
		font-weight: 600;
	}

	.lists {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: 0.75rem 1.5rem;
		margin-top: 0.6rem;
	}

	.lists h4 {
		font-family: inherit;
		color: hsl(var(--ink-soft));
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin: 0 0 0.3rem;
		font-size: 0.6875rem;
		font-weight: 400;
	}

	.lists ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.lists li {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.15rem 0;
	}

	.lists li a {
		overflow: hidden;
		color: hsl(var(--ink));
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.lists li span {
		font-variant-numeric: tabular-nums;
	}

	.pick i,
	.key i {
		display: inline-block;
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 2px;
	}

	.pick i.active {
		background: hsl(var(--accent));
	}

	.pick i.quiet {
		background: hsl(var(--ink) / 0.2);
	}

	.pick i.new {
		background: hsl(var(--accent) / 0.35);
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

	.key i.new {
		background: hsl(var(--accent) / 0.35);
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
