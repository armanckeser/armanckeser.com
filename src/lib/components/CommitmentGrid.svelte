<script lang="ts">
interface CommitmentItem {
	title: string
	status: "planned" | "in-progress" | "completed" | "cancelled"
	note?: string
	progress?: number
	completedDate?: Date
	link?: string
}

interface CategoryConfig {
	id: string
	label: string
	icon: string
	items: CommitmentItem[]
}

const { categories } = $props<{
	categories: CategoryConfig[]
}>()

let selectedCategory = $state(categories[0].id)
</script>

<div class="terminal-block" data-variant="tip">
  <div class="flex flex-wrap gap-4 p-4 border-b border-accent/20">
    {#each categories as { id, label, icon }}
      <button
        class="font-mono text-sm px-3 py-1 rounded-lg transition-all {selectedCategory === id ? 'bg-accent/10 text-accent' : ''}"
        onclick={() => selectedCategory = id}
      >
        {icon} {label}
      </button>
    {/each}
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
    {#each categories.find((c: { id: any; }) => c.id === selectedCategory)?.items as item}
      <div class="flex items-start gap-3 group">
        <div class="shrink-0 w-6 h-6 text-accent mt-1">
          {#if item.status === 'completed'}✓
          {:else if item.status === 'in-progress'}↻
          {:else if item.status === 'cancelled'}✗
          {:else}⌛{/if}
        </div>
        <div class="flex-1">
          {#if item.link}
            <a 
              href={item.link}
              class="font-mono text-primary underline hover:text-accent transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.title}
            </a>
          {:else}
            <div class="font-mono text-primary">{item.title}</div>
          {/if}
          {#if item.note}
            <div class="mt-1 text-xs text-muted-foreground">
              {item.note}
            </div>
          {/if}
          {#if item.completedDate}
            <div class="mt-1 text-xs text-muted-foreground">
              {new Date(item.completedDate).toLocaleDateString()}
            </div>
          {/if}
          {#if item.status === 'in-progress' && item.progress}
            <div class="h-1 mt-2 bg-accent/10 rounded-full overflow-hidden">
              <div 
                class="h-full bg-accent transition-all duration-500" 
                style={`width: ${item.progress}%`}
              ></div>
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div> 