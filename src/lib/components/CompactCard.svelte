<script lang="ts">
const {
	title,
	description,
	tag = "blog",
	date,
	href,
	isSelected = false,
	onclick = () => {},
	onmouseenter = () => {},
	onmouseleave = () => {},
} = $props<{
	title: string
	description: string
	tag?: string
	date?: string
	href?: string
	isSelected?: boolean
	onclick?: () => void
	onmouseenter?: () => void
	onmouseleave?: () => void
}>()

import { getTagClasses } from "$lib/tags"
const tagClasses = getTagClasses(tag)

const formattedDate = $derived(
	date
		? new Date(date).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			})
		: null
)

// Generate unique IDs for ARIA attributes
const descriptionId = $derived(
	`description-${title.toLowerCase().replace(/\s+/g, "-")}`
)
</script>

<article 
  class="group border-l-2 transition-all {isSelected ? 'border-accent/20' : 'border-transparent'}" onmouseenter={onmouseenter} onmouseleave={onmouseleave}
>
  <!-- Header section - clickable to expand -->
  <div 
    class="grid grid-cols-[1fr_auto] items-center gap-3 px-2 sm:px-4 py-3 cursor-pointer hover:bg-accent/5"
    onclick={onclick}
    role="button"
    tabindex="0"
    aria-expanded={isSelected}
    onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && onclick()}
  >
    <div class="flex items-center gap-3 min-w-0">
      <div class={`shrink-0 px-1.5 py-0.5 font-mono text-xs ${tagClasses}`}>
        {tag}
      </div>
      
      <h3 class="truncate font-mono text-base text-primary">
        {title}
      </h3>
    </div>

    <div class="flex items-center gap-3">
      {#if formattedDate}
        <time datetime={date} class="font-mono text-sm text-muted-foreground">
          {formattedDate}
        </time>
      {/if}
    </div>
  </div>

  <!-- Expanded content -->
  {#if isSelected}
    <div 
      id={descriptionId}
      class="overflow-hidden transition-all" 
      in:slide={{ duration: 200 }} 
      out:slide={{ duration: 200 }}
      role="region"
      aria-label="Additional details"
    >
      <div class="grid grid-cols-[1fr_auto] items-center gap-4 px-2 sm:px-4 pb-3">
        <p class="text-sm text-muted-foreground">
          {description}
        </p>
        
        {#if href}
          <a
            {href}
            class="glass hover:sharp-shadow-md group/link flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:border-accent/20"
            aria-label="Go to article"
          >
            <span class="font-mono text-accent transition-transform duration-200 group-hover/link:translate-x-0.5">→</span>
          </a>
        {/if}
      </div>
    </div>
  {/if}
</article>

<script lang="ts" module>
import { slide } from 'svelte/transition'
</script> 