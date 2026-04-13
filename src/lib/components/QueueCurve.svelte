<script lang="ts">
const CHART_WIDTH = 600
const CHART_HEIGHT = 320
const PADDING = { top: 20, right: 30, bottom: 50, left: 60 }
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom

const MAX_UTILIZATION = 0.98
const MAX_QUEUE_MULTIPLIER = 20

let hoveredUtilization = $state<number | null>(null)
let isDragging = $state(false)

function queueMultiplier(utilization: number): number {
	if (utilization >= 1) return Infinity
	return utilization / (1 - utilization)
}

function utilizationToX(u: number): number {
	return PADDING.left + (u / MAX_UTILIZATION) * PLOT_WIDTH
}

function multiplierToY(m: number): number {
	const clamped = Math.min(m, MAX_QUEUE_MULTIPLIER)
	return (
		PADDING.top +
		PLOT_HEIGHT -
		(clamped / MAX_QUEUE_MULTIPLIER) * PLOT_HEIGHT
	)
}

const curvePath = $derived.by(() => {
	const points: string[] = []
	for (let i = 0; i <= 200; i++) {
		const u = (i / 200) * MAX_UTILIZATION
		const m = queueMultiplier(u)
		const x = utilizationToX(u)
		const y = multiplierToY(m)
		points.push(`${i === 0 ? "M" : "L"}${x},${y}`)
	}
	return points.join(" ")
})

const fillPath = $derived.by(() => {
	const bottomY = PADDING.top + PLOT_HEIGHT
	const startX = utilizationToX(0)
	const endX = utilizationToX(MAX_UTILIZATION)
	return `${curvePath} L${endX},${bottomY} L${startX},${bottomY} Z`
})

const hoveredData = $derived.by(() => {
	if (hoveredUtilization === null) return null
	const m = queueMultiplier(hoveredUtilization)
	return {
		utilization: hoveredUtilization,
		multiplier: Math.min(m, MAX_QUEUE_MULTIPLIER),
		x: utilizationToX(hoveredUtilization),
		y: multiplierToY(m),
		displayMultiplier:
			m > MAX_QUEUE_MULTIPLIER
				? `${MAX_QUEUE_MULTIPLIER}+`
				: m.toFixed(1),
	}
})

const milestones = [
	{ u: 0.5, label: "50%", note: "1x wait" },
	{ u: 0.8, label: "80%", note: "4x wait" },
	{ u: 0.9, label: "90%", note: "9x wait" },
	{ u: 0.95, label: "95%", note: "19x wait" },
]

function handlePointerMove(event: PointerEvent) {
	const svg = event.currentTarget as SVGElement
	const rect = svg.getBoundingClientRect()
	const mouseX = event.clientX - rect.left
	const scaleX = CHART_WIDTH / rect.width
	const scaledX = mouseX * scaleX

	const u = Math.max(
		0,
		Math.min(
			MAX_UTILIZATION,
			((scaledX - PADDING.left) / PLOT_WIDTH) * MAX_UTILIZATION
		)
	)
	hoveredUtilization = u
}

function handlePointerDown(event: PointerEvent) {
	isDragging = true
	;(event.currentTarget as SVGElement).setPointerCapture(event.pointerId)
	handlePointerMove(event)
}

function handlePointerUp() {
	isDragging = false
}
</script>

<div class="terminal-block" data-variant="tip">
  <div class="flex items-center justify-between px-4 py-2 border-b border-accent/20">
    <span class="font-mono text-sm text-muted-foreground">utilization vs queue wait time</span>
    <span class="font-mono text-xs text-muted-foreground">drag or hover to explore</span>
  </div>
  <div class="p-4">
    <svg
      viewBox="0 0 {CHART_WIDTH} {CHART_HEIGHT}"
      class="w-full h-auto select-none touch-none"
      role="img"
      aria-label="Chart showing exponential relationship between resource utilization and queue wait time"
      onpointermove={handlePointerMove}
      onpointerdown={handlePointerDown}
      onpointerup={handlePointerUp}
      onpointerleave={() => { if (!isDragging) hoveredUtilization = null }}
    >
      <!-- Grid lines -->
      {#each [0, 5, 10, 15, 20] as tick}
        <line
          x1={PADDING.left}
          y1={multiplierToY(tick)}
          x2={PADDING.left + PLOT_WIDTH}
          y2={multiplierToY(tick)}
          class="stroke-current text-border"
          stroke-width="1"
          stroke-dasharray={tick === 0 ? "none" : "4,4"}
          opacity={tick === 0 ? 0.4 : 0.15}
        />
        <text
          x={PADDING.left - 8}
          y={multiplierToY(tick)}
          text-anchor="end"
          dominant-baseline="middle"
          class="fill-current text-muted-foreground font-mono"
          font-size="11"
        >{tick}x</text>
      {/each}

      <!-- X axis ticks -->
      {#each [0, 25, 50, 75, 100] as pct}
        <text
          x={utilizationToX(pct / 100 * MAX_UTILIZATION)}
          y={PADDING.top + PLOT_HEIGHT + 20}
          text-anchor="middle"
          class="fill-current text-muted-foreground font-mono"
          font-size="11"
        >{pct}%</text>
      {/each}

      <!-- Axis labels -->
      <text
        x={PADDING.left + PLOT_WIDTH / 2}
        y={CHART_HEIGHT - 4}
        text-anchor="middle"
        class="fill-current text-muted-foreground font-mono"
        font-size="12"
      >maintainer utilization</text>
      <text
        x={14}
        y={PADDING.top + PLOT_HEIGHT / 2}
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-90, 14, {PADDING.top + PLOT_HEIGHT / 2})"
        class="fill-current text-muted-foreground font-mono"
        font-size="12"
      >queue wait</text>

      <!-- Fill under curve -->
      <path
        d={fillPath}
        class="fill-current text-accent"
        opacity="0.06"
      />

      <!-- The curve -->
      <path
        d={curvePath}
        fill="none"
        class="stroke-current text-accent"
        stroke-width="2.5"
        stroke-linecap="round"
      />

      <!-- Milestone dots -->
      {#each milestones as { u, note }}
        {@const m = queueMultiplier(u)}
        <circle
          cx={utilizationToX(u)}
          cy={multiplierToY(m)}
          r="4"
          class="fill-current text-accent"
          opacity="0.6"
        />
        <text
          x={utilizationToX(u)}
          y={multiplierToY(m) - 12}
          text-anchor="middle"
          class="fill-current text-accent font-mono"
          font-size="11"
          font-weight="600"
        >{note}</text>
      {/each}

      <!-- Hover crosshair and tooltip -->
      {#if hoveredData}
        <line
          x1={hoveredData.x}
          y1={PADDING.top}
          x2={hoveredData.x}
          y2={PADDING.top + PLOT_HEIGHT}
          class="stroke-current text-muted-foreground"
          stroke-width="1"
          stroke-dasharray="3,3"
          opacity="0.4"
        />
        <line
          x1={PADDING.left}
          y1={hoveredData.y}
          x2={PADDING.left + PLOT_WIDTH}
          y2={hoveredData.y}
          class="stroke-current text-muted-foreground"
          stroke-width="1"
          stroke-dasharray="3,3"
          opacity="0.4"
        />
        <circle
          cx={hoveredData.x}
          cy={hoveredData.y}
          r="6"
          class="fill-current text-accent"
        />
        <rect
          x={Math.min(hoveredData.x + 12, CHART_WIDTH - PADDING.right - 130)}
          y={Math.max(hoveredData.y - 36, PADDING.top)}
          width="120"
          height="28"
          rx="4"
          class="fill-current text-background"
          opacity="0.9"
        />
        <rect
          x={Math.min(hoveredData.x + 12, CHART_WIDTH - PADDING.right - 130)}
          y={Math.max(hoveredData.y - 36, PADDING.top)}
          width="120"
          height="28"
          rx="4"
          fill="none"
          class="stroke-current text-accent"
          stroke-width="1"
          opacity="0.3"
        />
        <text
          x={Math.min(hoveredData.x + 12, CHART_WIDTH - PADDING.right - 130) + 60}
          y={Math.max(hoveredData.y - 36, PADDING.top) + 18}
          text-anchor="middle"
          class="fill-current text-foreground font-mono"
          font-size="12"
        >{(hoveredData.utilization * 100).toFixed(0)}% = {hoveredData.displayMultiplier} wait</text>
      {/if}
    </svg>
  </div>
</div>
