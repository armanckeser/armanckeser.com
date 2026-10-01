<!-- The laptop's screen: the game, repainted at the pace of the step it is on,
     and over it whatever instruments I had learned to read by then. -->
<script lang="ts">
import { LIST_FULL, type Step } from "$lib/data/laptop-story"
import { createPacer } from "$lib/rig/pacing"
import { createScene } from "$lib/rig/scene"
import { onMount } from "svelte"

const {
	step,
	detail = "full",
	paused = false,
} = $props<{
	step: Step
	/** "fps" shows the counter alone, for a small screen. */
	detail?: "full" | "fps"
	paused?: boolean
}>()

// Frame times kept for the strip, and the longest one it can show.
const KEPT = 44
const CEILING = 500

let canvas: HTMLCanvasElement
let strip = $state<SVGPathElement>()
let scan = $state<HTMLElement>()
let cursor = $state<HTMLElement>()

let moving = $state(false)
let smoothed = $state(0)
// Set once mounted: starts or stops the loop to match what is true now.
let sync = () => {}

$effect(() => {
	paused
	sync()
})

const range = $derived(
	step.fps
		? step.fps[0] === step.fps[1]
			? `${step.fps[0]}`
			: `${step.fps[0]}–${step.fps[1]}`
		: "??"
)
// While it runs, the counter reads the pace on screen, held to what was
// measured. Standing still, it states the measurement.
const counter = $derived(
	step.fps && moving && smoothed
		? `${Math.round(Math.min(step.fps[1], Math.max(step.fps[0], 1000 / smoothed)))}`
		: range
)
const listShare = $derived(
	step.list ? Math.max(step.list / LIST_FULL, 0.02) : 0
)

// The strip plots time per frame on a square-root scale, so a 16 ms frame and
// a 400 ms stall are both readable.
const height = (ms: number) =>
	20 - Math.sqrt(Math.min(ms, CEILING) / CEILING) * 19

function plot(times: number[]) {
	if (!strip) return
	let d = ""
	for (let i = 0; i < times.length; i++) {
		const x = KEPT - times.length + i
		d += `${i ? "L" : "M"}${x} ${height(times[i]).toFixed(1)}H${x + 1}`
	}
	strip.setAttribute("d", d)
}

onMount(() => {
	const scene = createScene(canvas)
	const pacer = createPacer()
	const still = matchMedia("(prefers-reduced-motion: reduce)")
	const times: number[] = []
	let onScreen = false
	let frame = 0
	let lastRead = 0
	let average = 0
	let current = step.id

	function loop(now: number) {
		frame = requestAnimationFrame(loop)

		if (step.id !== current) {
			current = step.id
			average = 0
		}

		const painted = pacer.tick(now, step.pace)
		if (!painted) return

		scene.draw(now / 1000)
		times.push(painted.dt)
		if (times.length > KEPT) times.shift()
		plot(times)

		average = average ? average + (painted.dt - average) * 0.25 : painted.dt
		if (now - lastRead > 250) {
			smoothed = average
			lastRead = now
		}

		// A stall is the kernel walking its list: sweep the list for as long as
		// the picture holds.
		if (painted.hold && scan && cursor) {
			cursor.animate(
				[
					{ transform: "translateX(0)", opacity: 1 },
					{
						transform: `translateX(${scan.clientWidth * listShare}px)`,
						opacity: 1,
					},
				],
				{ duration: painted.hold, easing: "linear" }
			)
		}
	}

	sync = () => {
		const run = onScreen && !paused && !still.matches && !document.hidden
		if (run === moving) return
		moving = run
		if (run) {
			pacer.reset(performance.now())
			frame = requestAnimationFrame(loop)
		} else {
			cancelAnimationFrame(frame)
		}
	}

	// One picture to stand on, for when it never moves.
	scene.draw(12)

	const watcher = new IntersectionObserver(entries => {
		onScreen = entries.some(entry => entry.isIntersecting)
		sync()
	})
	watcher.observe(canvas)
	document.addEventListener("visibilitychange", sync)
	still.addEventListener("change", sync)

	return () => {
		cancelAnimationFrame(frame)
		watcher.disconnect()
		document.removeEventListener("visibilitychange", sync)
		still.removeEventListener("change", sync)
	}
})
</script>

<div class="screen" data-detail={detail}>
	<canvas bind:this={canvas} aria-hidden="true"></canvas>

	<div class="panel top">
		<p class="fps" class:unknown={!step.fps}>
			<b>{counter}</b> fps
		</p>

		{#if detail === "full"}
			<ul class="readings">
				{#each step.readings as reading (reading.key)}
					<li class:bad={reading.bad}>
						<span class="key">{reading.key}</span>
						<span>{reading.value}</span>
						{#if reading.key === "kernel" && step.list}
							<span class="scan" bind:this={scan} aria-hidden="true">
								<span class="list" style:transform="scaleX({listShare})"></span>
								<span class="cursor" bind:this={cursor}></span>
							</span>
							<span class="count">{step.list.toLocaleString("en-US")} process objects</span>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="panel bottom">
		<svg class="strip" viewBox="0 0 {KEPT} 20" preserveAspectRatio="none" aria-hidden="true">
			<!-- Where a 60 fps frame sits. -->
			<line x1="0" x2={KEPT} y1={height(16.7)} y2={height(16.7)} />
			<path bind:this={strip} />
		</svg>
		{#if detail === "full"}
			{#key step.id}
				<p class="log"><span aria-hidden="true">❯</span> {step.log}</p>
			{/key}
		{/if}
	</div>
</div>

<style>
	/* A screen is lit from inside: the same in either theme. */
	.screen {
		--glass: 158 43% 4%;
		--phosphor: 153 68% 63%;
		--alarm: 18 86% 68%;

		container-type: inline-size;
		position: relative;
		overflow: hidden;
		aspect-ratio: 16 / 10;
		background: hsl(var(--glass));
		color: hsl(var(--phosphor));
		font-family: theme("fontFamily.mono");
		font-variant-numeric: tabular-nums;
		line-height: 1.35;
	}

	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		image-rendering: pixelated;
	}

	.panel {
		position: absolute;
		left: 0;
		font-size: clamp(7px, 3.3cqw, 13px);
	}

	.top {
		top: 0;
		max-width: 86%;
		padding: 1.6cqw 2.4cqw 1.8cqw;
		background: hsl(var(--glass) / 0.84);
	}

	.bottom {
		right: 0;
		bottom: 0;
		background: hsl(var(--glass) / 0.84);
	}

	.fps {
		color: hsl(var(--phosphor) / 0.7);
	}

	.fps b {
		color: hsl(var(--phosphor));
		font-size: 2.3em;
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.03em;
	}

	.fps.unknown b {
		color: hsl(var(--phosphor) / 0.45);
	}

	.readings {
		margin-top: 0.5em;
	}

	.readings li {
		display: grid;
		grid-template-columns: 3.9em 1fr;
		column-gap: 0.6em;
		white-space: pre;
		transition:
			opacity 260ms var(--ease-out),
			transform 260ms var(--ease-out);

		@starting-style {
			opacity: 0;
			transform: translateY(0.5em);
		}
	}

	.key {
		color: hsl(var(--phosphor) / 0.55);
	}

	.bad {
		color: hsl(var(--alarm));
	}

	.scan,
	.count {
		grid-column: 2;
	}

	.scan {
		position: relative;
		width: 40cqw;
		height: 0.55em;
		margin-block: 0.25em 0.15em;
		background: hsl(var(--phosphor) / 0.14);
	}

	.list,
	.cursor {
		position: absolute;
		inset-block: 0;
		left: 0;
	}

	.list {
		width: 100%;
		background: currentColor;
		opacity: 0.55;
		transform-origin: left;
		transition: transform 700ms var(--ease-in-out);
	}

	.cursor {
		width: 2px;
		background: hsl(0 0% 100%);
		opacity: 0;
	}

	.count {
		color: hsl(var(--phosphor) / 0.55);
	}

	.strip {
		display: block;
		width: 100%;
		height: 6cqw;
	}

	.strip line {
		stroke: hsl(var(--phosphor) / 0.3);
		stroke-dasharray: 1 1;
		vector-effect: non-scaling-stroke;
	}

	.strip path {
		fill: none;
		stroke: hsl(var(--phosphor));
		stroke-width: 1.25;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}

	.log {
		overflow: hidden;
		padding: 0.5em 2.4cqw 0.9em;
		color: hsl(var(--phosphor) / 0.85);
		text-overflow: ellipsis;
		white-space: nowrap;
		animation: arrive 320ms var(--ease-out);
	}

	.log span {
		color: hsl(var(--phosphor) / 0.5);
	}

	@keyframes arrive {
		from {
			opacity: 0;
			filter: blur(2px);
			transform: translateY(0.4em);
		}
	}

	/* The small screen: the counter and the strip, nothing else. */
	[data-detail="fps"] .top {
		padding-bottom: 1.2cqw;
	}

	[data-detail="fps"] .panel {
		font-size: clamp(7px, 4.2cqw, 13px);
	}
</style>
