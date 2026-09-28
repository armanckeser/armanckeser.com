<script lang="ts">
import { onMount } from "svelte"

const {
	live = 306,
	zombiesPerDay = 1635,
	maxDays = 20,
	entriesPerSecond = 30000,
} = $props<{
	live?: number
	zombiesPerDay?: number
	maxDays?: number
	entriesPerSecond?: number
}>()

let days = $state(20)
let running = $state(true)
let cursor = $state(0)
let target = $state(0)
let lookups = $state(0)
let windowStart = 0
let lookupsInWindow = 0
let perSecond = $state(0)

const zombies = $derived(Math.round(days * zombiesPerDay))
const total = $derived(live + zombies)
const maxTotal = $derived(live + maxDays * zombiesPerDay)
const listPct = $derived((total / maxTotal) * 100)
const slowdown = $derived(total / live)
// The list is drawn as 30 repeating tiles; the green share of each tile is the
// live share of the list, so the colour ratio stays honest at every size.
const livePct = $derived((live / total) * 100)

function newTarget() {
	target = Math.random() * total
	cursor = 0
}

$effect(() => {
	// restart the scan whenever the list size changes
	const n = total
	target = Math.random() * n
	cursor = 0
	lookupsInWindow = 0
	windowStart = performance.now()
})

onMount(() => {
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
		running = false
	let last = performance.now()
	let frame = requestAnimationFrame(function tick(now) {
		const dt = (now - last) / 1000
		last = now
		if (running) {
			cursor += entriesPerSecond * dt
			while (cursor >= target) {
				lookups += 1
				lookupsInWindow += 1
				const overshoot = cursor - target
				newTarget()
				cursor = Math.min(overshoot, target)
			}
			if (now - windowStart > 1000) {
				perSecond = lookupsInWindow / ((now - windowStart) / 1000)
				lookupsInWindow = 0
				windowStart = now
			}
		}
		frame = requestAnimationFrame(tick)
	})
	return () => cancelAnimationFrame(frame)
})
</script>

<div class="terminal-block not-prose" data-variant="warning">
  <div class="flex items-center justify-between gap-4 px-4 py-2 border-b border-accent/20">
    <span class="font-mono text-sm text-muted-foreground">one lookup = walk the list until you find it</span>
    <button
      type="button"
      class="font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
      onclick={() => (running = !running)}
    >{running ? "❚❚ pause" : "▶ play"}</button>
  </div>
  <div class="p-4 space-y-4">
    <label class="block space-y-1">
      <span class="font-mono text-xs text-muted-foreground">
        days since last restart: <span class="text-foreground tabular-nums">{days}</span>
      </span>
      <input type="range" min="0" max={maxDays} step="1" bind:value={days} class="w-full accent-[hsl(var(--accent))]" />
    </label>

    <div class="relative h-8 rounded bg-muted/20 overflow-hidden" aria-hidden="true">
      <div
        class="absolute inset-y-0 left-0 transition-[width] duration-300"
        style="width: {listPct}%;
          background-image: linear-gradient(90deg,
            hsl(var(--accent)) 0 max(1.5px, {livePct}%),
            hsl(var(--destructive) / 0.55) max(1.5px, {livePct}%) 100%);
          background-size: {100 / 30}% 100%;"
      ></div>
      <div
        class="absolute inset-y-0 w-0.5 bg-foreground"
        style="left: {(cursor / maxTotal) * 100}%"
      ></div>
      <div
        class="absolute inset-y-0 w-0.5 bg-accent"
        style="left: {(target / maxTotal) * 100}%"
      ></div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs" aria-live="polite">
      <div>
        <div class="text-muted-foreground">entries in list</div>
        <div class="text-foreground tabular-nums text-sm">{total.toLocaleString()}</div>
      </div>
      <div>
        <div class="text-muted-foreground">dead ones</div>
        <div class="text-destructive tabular-nums text-sm font-bold">{zombies.toLocaleString()}</div>
      </div>
      <div>
        <div class="text-muted-foreground">avg comparisons / lookup</div>
        <div class="text-foreground tabular-nums text-sm">{Math.round(total / 2).toLocaleString()}</div>
      </div>
      <div>
        <div class="text-muted-foreground">vs. fresh boot</div>
        <div class="text-foreground tabular-nums text-sm">{slowdown.toFixed(slowdown < 10 ? 1 : 0)}× slower</div>
      </div>
    </div>
    <p class="font-mono text-xs text-muted-foreground/70">
      lookups finished: <span class="tabular-nums">{lookups}</span>
      · this speed: <span class="tabular-nums">{perSecond.toFixed(1)}</span>/s.
      Slowed way down so you can watch it; the real one is fast, but it's the same shape, and every GPU memory trim pays for a walk.
    </p>
  </div>
</div>
