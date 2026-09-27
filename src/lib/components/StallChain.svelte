<script lang="ts">
interface Step {
	plain: string
	kernel: string
	stat?: string
}

const { steps } = $props<{ steps: Step[] }>()

let shown = $state(1)
</script>

<div class="terminal-block not-prose" data-variant="tip">
  <div class="flex items-center justify-between gap-4 px-4 py-2 border-b border-accent/20">
    <span class="font-mono text-sm text-muted-foreground">why a mouse app made everything stutter</span>
    <span class="font-mono text-xs text-muted-foreground tabular-nums">{shown}/{steps.length}</span>
  </div>
  <ol class="p-4 space-y-3">
    {#each steps.slice(0, shown) as step, i}
      <li class="flex gap-3">
        <span class="font-mono text-xs text-accent tabular-nums pt-0.5 shrink-0">{i + 1}.</span>
        <div class="space-y-1 min-w-0">
          <p class="text-sm text-foreground">{step.plain}</p>
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <code class="font-mono text-xs text-muted-foreground break-all">{step.kernel}</code>
            {#if step.stat}
              <span class="font-mono text-xs text-destructive font-bold">{step.stat}</span>
            {/if}
          </div>
        </div>
      </li>
    {/each}
  </ol>
  <div class="flex justify-end gap-2 px-4 pb-4">
    {#if shown < steps.length}
      <button
        type="button"
        class="font-mono text-xs px-3 py-1.5 rounded text-muted-foreground hover:text-accent transition-colors"
        onclick={() => (shown = steps.length)}
      >show all</button>
      <button
        type="button"
        class="font-mono text-xs px-3 py-1.5 rounded border border-accent/40 text-accent hover:bg-accent/10 transition-colors"
        onclick={() => (shown += 1)}
      >next →</button>
    {:else}
      <button
        type="button"
        class="font-mono text-xs px-3 py-1.5 rounded text-muted-foreground hover:text-accent transition-colors"
        onclick={() => (shown = 1)}
      >↺ start over</button>
    {/if}
  </div>
</div>
