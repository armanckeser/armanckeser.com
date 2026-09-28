<script lang="ts">
interface Suspect {
	name: string
	evidence: string
	guilty: boolean
}

const { suspects } = $props<{ suspects: Suspect[] }>()
</script>

<div class="terminal-block not-prose" data-variant="tip">
  <div class="flex items-center justify-between gap-4 px-4 py-2 border-b border-accent/20">
    <span class="font-mono text-sm text-muted-foreground">suspects, in the order we checked them</span>
  </div>
  <ul class="p-4 space-y-3">
    {#each suspects as suspect}
      <li class="flex gap-3">
        <span
          class="font-mono text-sm shrink-0 w-5 text-center {suspect.guilty ? 'text-destructive font-bold' : 'text-muted-foreground/50'}"
          aria-label={suspect.guilty ? "guilty" : "ruled out"}
        >{suspect.guilty ? "!" : "✗"}</span>
        <div class="min-w-0">
          <span class="font-mono text-sm {suspect.guilty ? 'text-foreground font-semibold' : 'text-muted-foreground line-through decoration-muted-foreground/40'}">{suspect.name}</span>
          <p class="font-mono text-xs text-muted-foreground mt-0.5">{suspect.evidence}</p>
        </div>
      </li>
    {/each}
  </ul>
</div>
