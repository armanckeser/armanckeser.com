<script lang="ts">
interface Counts {
	live: number
	zombies: number
}

const {
	before,
	after,
	perDot = 100,
} = $props<{
	before: Counts
	after: Counts
	perDot?: number
}>()

let fixed = $state(false)

const current = $derived(fixed ? after : before)
const liveDots = $derived(Math.max(1, Math.round(before.live / perDot)))
const maxZombieDots = $derived(Math.round(before.zombies / perDot))
const zombieDots = $derived(Math.round(current.zombies / perDot))
</script>

<div class="terminal-block not-prose" data-variant="warning">
  <div class="flex items-center justify-between gap-4 px-4 py-2 border-b border-accent/20">
    <span class="font-mono text-sm text-muted-foreground">programs my PC was keeping track of</span>
    <span class="font-mono text-xs text-muted-foreground">1 dot = {perDot}</span>
  </div>
  <div class="p-4 space-y-4">
    <div class="flex flex-wrap gap-[3px]" aria-hidden="true">
      {#each { length: liveDots } as _}
        <div class="w-2 h-2 rounded-full bg-accent"></div>
      {/each}
      {#each { length: maxZombieDots } as _, i}
        <div
          class="w-2 h-2 rounded-full bg-destructive/70 transition-opacity duration-700"
          style="opacity: {i < zombieDots ? 1 : 0}; transition-delay: {fixed ? (i % 40) * 12 : 0}ms"
        ></div>
      {/each}
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-4" aria-live="polite">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-accent"></div>
          <span class="font-mono text-xs text-muted-foreground">actually running: <span class="text-foreground tabular-nums">{current.live.toLocaleString()}</span></span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-destructive/70"></div>
          <span class="font-mono text-xs text-muted-foreground">dead, but never cleaned up: <span class="text-foreground tabular-nums">{current.zombies.toLocaleString()}</span></span>
        </div>
      </div>
      <button
        type="button"
        class="font-mono text-xs px-3 py-1.5 rounded border border-accent/40 text-accent hover:bg-accent/10 transition-colors"
        onclick={() => (fixed = !fixed)}
      >
        {fixed ? "↺ put them back" : "stop Razer's services →"}
      </button>
    </div>
  </div>
</div>
