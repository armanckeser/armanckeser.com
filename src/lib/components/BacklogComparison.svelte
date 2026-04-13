<script lang="ts">
interface ProjectData {
	name: string
	openPRs: number
	activeMaintainers: string
	source: string
	sourceLink: string
}

const { projects } = $props<{
	projects: ProjectData[]
}>()

const maxPRs = $derived(Math.max(...projects.map(p => p.openPRs)))
</script>

<div class="terminal-block" data-variant="tip">
  <div class="flex items-center justify-between px-4 py-2 border-b border-accent/20">
    <span class="font-mono text-sm text-muted-foreground">open PRs across projects</span>
    <span class="font-mono text-xs text-muted-foreground">it is not just jellyfin</span>
  </div>
  <div class="p-4 space-y-4">
    {#each projects as project}
      {@const pct = (project.openPRs / maxPRs) * 100}
      <div class="space-y-1">
        <div class="flex items-baseline justify-between gap-4">
          <div class="flex items-baseline gap-2 min-w-0">
            <span class="font-mono text-sm text-foreground font-semibold shrink-0">{project.name}</span>
            <span class="font-mono text-xs text-muted-foreground/60 truncate">{project.activeMaintainers}</span>
          </div>
          <div class="flex items-baseline gap-2 shrink-0">
            <span class="font-mono text-sm text-accent tabular-nums font-bold">{project.openPRs.toLocaleString()}</span>
            <a
              href={project.sourceLink}
              class="font-mono text-xs text-muted-foreground/40 hover:text-accent transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >{project.source}</a>
          </div>
        </div>
        <div class="h-2 bg-accent/5 rounded-full overflow-hidden">
          <div
            class="h-full bg-accent/30 rounded-full transition-all duration-700"
            style="width: {pct}%"
          ></div>
        </div>
      </div>
    {/each}
  </div>
</div>
