<!-- One real run, as logged: the GPU's clock every two seconds, and under it
     the reason the driver gave for holding the clock down. -->
<script lang="ts">
import run from "$lib/data/throttle-run.json"

// Each sample: seconds in, clock MHz, GPU °C, package °C, reason bits, load %.
type Sample = [number, number, number, number, number, number]
const samples = run as Sample[]

const THERMAL = 0x20
const POWER = 0x04
const reason = (bits: number) =>
	bits & THERMAL ? "thermal" : bits & POWER ? "power" : "none"
const label = {
	thermal: "thermal slowdown",
	power: "power cap",
	none: "not held back",
}

const W = 640
const H = 232
const plot = { left: 46, right: 630, top: 12, bottom: 166 }
const band = { top: 178, height: 9 }
const end = samples[samples.length - 1][0]
const [low, high] = [400, 2000]

const x = (t: number) => plot.left + (t / end) * (plot.right - plot.left)
const y = (mhz: number) =>
	plot.bottom - ((mhz - low) / (high - low)) * (plot.bottom - plot.top)

const line = samples
	.map(
		([t, mhz], i) =>
			`${i ? "L" : "M"}${x(t).toFixed(1)} ${y(mhz).toFixed(1)}`
	)
	.join("")

// Runs of the same reason, for the band.
const runs: { kind: keyof typeof label; from: number; to: number }[] = []
samples.forEach(([t, , , , bits], i) => {
	const kind = reason(bits)
	const to = samples[i + 1]?.[0] ?? t
	const last = runs[runs.length - 1]
	if (last?.kind === kind) last.to = to
	else runs.push({ kind, from: t, to })
})

const firstThermal = samples.find(s => s[4] & THERMAL) ?? samples[0]
const slowest = samples.reduce((a, b) => (b[1] < a[1] ? b : a))
const clock = (t: number) =>
	`${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, "0")}`

let hovered = $state<Sample | null>(null)

function point(event: PointerEvent) {
	const box = (event.currentTarget as SVGElement).getBoundingClientRect()
	const at = ((event.clientX - box.left) / box.width) * W
	const t = ((at - plot.left) / (plot.right - plot.left)) * end
	hovered = samples.reduce((a, b) =>
		Math.abs(b[0] - t) < Math.abs(a[0] - t) ? b : a
	)
}
</script>

<figure class="trace not-prose">
	<div class="chart">
		<svg
			viewBox="0 0 {W} {H}"
			role="img"
			aria-label="GPU clock over a 7.6 minute run. It holds near 1,700 MHz under a power cap for 2.6 minutes, drops to 555 MHz when thermal slowdown begins, and stays near 1,500 MHz under thermal slowdown for the rest of the run."
			onpointermove={point}
			onpointerleave={() => (hovered = null)}
		>
			{#each [500, 1000, 1500, 2000] as mhz}
				<line class="grid" x1={plot.left} x2={plot.right} y1={y(mhz)} y2={y(mhz)} />
				<text class="tick" x={plot.left - 8} y={y(mhz) + 3.5} text-anchor="end">
					{mhz.toLocaleString("en-US")}
				</text>
			{/each}

			{#each [0, 2, 4, 6] as minute}
				<text class="tick" x={x(minute * 60)} y={H - 4} text-anchor={minute ? "middle" : "start"}>
					{minute} min
				</text>
			{/each}

			<!-- The stretch spent too hot, shaded up through the plot. -->
			{#each runs.filter(r => r.kind === "thermal") as r}
				<rect class="wash" x={x(r.from)} y={plot.top} width={x(r.to) - x(r.from)} height={plot.bottom - plot.top} />
			{/each}

			<path class="clock" d={line} />

			{#each runs.filter(r => r.kind !== "none") as r}
				<rect
					class="reason {r.kind}"
					x={x(r.from) + 1}
					y={band.top}
					width={Math.max(x(r.to) - x(r.from) - 2, 1)}
					height={band.height}
					rx="2"
				/>
			{/each}
			<text class="name" x={x(4)} y={band.top + band.height + 13}>power cap</text>
			<text class="name" x={x(firstThermal[0]) + 2} y={band.top + band.height + 13}>thermal slowdown</text>

			<text class="name" x={x(slowest[0]) + 8} y={y(slowest[1]) + 2}>
				{slowest[1]} MHz, {clock(firstThermal[0])} in
			</text>
			<text class="tick" x={plot.right} y={plot.top + 2} text-anchor="end">GPU clock, MHz</text>

			{#if hovered}
				<line class="cross" x1={x(hovered[0])} x2={x(hovered[0])} y1={plot.top} y2={band.top + band.height} />
				<circle class="dot" cx={x(hovered[0])} cy={y(hovered[1])} r="4" />
			{/if}
		</svg>

		{#if hovered}
			<div class="tip font-mono" class:flip={hovered[0] > end * 0.6} style:left="{(x(hovered[0]) / W) * 100}%">
				<b>{clock(hovered[0])}</b>
				<span>{hovered[1].toLocaleString("en-US")} MHz</span>
				<span>GPU {hovered[2]} °C · package {hovered[3]} °C</span>
				<span>{label[reason(hovered[4])]}</span>
			</div>
		{/if}
	</div>

	<figcaption class="font-serif">
		Subnautica 2 at 1440p on September 7, with the fans already at their 4,400 RPM limit. Thermal slowdown
		starts 2.6 minutes in and holds for 61% of the run.
		<a href="/data/gpu_20260907_205011.csv">The log.</a>
	</figcaption>
</figure>

<style>
	.trace {
		margin-block: 2rem;
	}

	.chart {
		position: relative;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
		touch-action: pan-y;
	}

	text {
		font-family: theme("fontFamily.mono");
		font-size: 10.5px;
		fill: hsl(var(--ink-soft));
	}

	.grid {
		stroke: hsl(var(--ink) / 0.1);
	}

	.wash {
		fill: hsl(var(--accent) / 0.09);
	}

	.clock {
		fill: none;
		stroke: hsl(var(--ink));
		stroke-width: 1.75;
		stroke-linejoin: round;
	}

	.reason.power {
		fill: hsl(var(--ink) / 0.32);
	}

	.reason.thermal {
		fill: hsl(var(--accent));
	}

	.name {
		fill: hsl(var(--ink));
	}

	.cross {
		stroke: hsl(var(--ink) / 0.4);
	}

	.dot {
		fill: hsl(var(--ink));
		stroke: hsl(var(--paper));
		stroke-width: 2;
	}

	.tip {
		position: absolute;
		top: 0;
		display: grid;
		gap: 0.1rem;
		padding: 0.45rem 0.6rem;
		border: 1px solid hsl(var(--ink) / 0.18);
		border-radius: 4px;
		background: hsl(var(--paper));
		color: hsl(var(--ink-soft));
		font-size: 0.6875rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		pointer-events: none;
		transform: translateX(0.75rem);
	}

	.tip.flip {
		transform: translateX(calc(-100% - 0.75rem));
	}

	.tip b {
		color: hsl(var(--ink));
		font-weight: 600;
	}

	figcaption {
		margin-top: 0.9rem;
		color: hsl(var(--ink-soft));
		font-size: 0.9375rem;
		font-style: italic;
		line-height: 1.5;
	}

	figcaption a {
		color: hsl(var(--ink));
		text-decoration: underline;
		text-decoration-color: hsl(var(--accent) / 0.5);
		text-underline-offset: 0.2em;
	}
</style>
