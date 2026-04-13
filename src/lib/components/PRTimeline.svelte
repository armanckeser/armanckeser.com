<script lang="ts">
interface Segment {
	label: string
	days: number
	kind: "active" | "waiting"
}

const { segments, total } = $props<{
	segments: Segment[]
	total: number
}>()

const activeDays = $derived(
	segments
		.filter(s => s.kind === "active")
		.reduce((sum, s) => sum + s.days, 0)
)
const waitingDays = $derived(total - activeDays)
const activePercent = $derived(Math.round((activeDays / total) * 100))
</script>

<div class="terminal-block" data-variant="tip">
  <div class="flex items-center justify-between px-4 py-2 border-b border-accent/20">
    <span class="font-mono text-sm text-muted-foreground">where {total} days went</span>
  </div>
  <div class="p-4 space-y-4">
    <!-- The bar -->
    <div class="relative h-10 rounded bg-muted/30 overflow-hidden flex">
      {#each segments as segment}
        {@const pct = (segment.days / total) * 100}
        {#if pct > 0.5}
          <div
            class="h-full relative group flex items-center justify-center overflow-hidden transition-all duration-300 {segment.kind === 'active' ? 'bg-accent/40' : ''}"
            style="width: {pct}%"
            title="{segment.label}: {segment.days} days"
          >
            {#if pct > 8}
              <span class="font-mono text-xs {segment.kind === 'active' ? 'text-accent' : 'text-muted-foreground/40'} truncate px-1">
                {segment.days}d
              </span>
            {/if}
          </div>
        {/if}
      {/each}
    </div>

    <!-- Legend -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-sm bg-accent/40"></div>
          <span class="font-mono text-xs text-muted-foreground">active review or response ({activeDays} days)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-sm bg-muted/30"></div>
          <span class="font-mono text-xs text-muted-foreground">waiting ({waitingDays} days)</span>
        </div>
      </div>
      <span class="font-mono text-sm text-accent font-bold">{activePercent}% active</span>
    </div>
  </div>
</div>
