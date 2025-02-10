<script lang="ts">
const {
	title,
	description,
	tag = "blog",
	date,
	href,
	isSelected = false,
} = $props<{
	title: string
	description: string
	tag?: string
	date?: string
	href?: string
	isSelected?: boolean
}>()

import { getTagClasses } from "$lib/state/tags.svelte"
const tagClasses = $derived(getTagClasses(tag))

const formattedDate = $derived(
	date
		? new Date(date).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			})
		: null
)
</script>

<a
  {href}
  class="group block cursor-pointer border-l-2 transition-all hover:bg-accent/5 {isSelected ? 'border-accent/20' : 'border-transparent'}"
  aria-selected={isSelected}
  on:click
>
  <div class="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-2 sm:px-4 py-3">
    <div class={`px-1.5 py-0.5 font-mono text-xs ${tagClasses}`}>
      {tag}
    </div>
    
    <h3 class="truncate font-mono text-base text-primary">
      {title}
    </h3>

    {#if formattedDate}
      <div class="font-mono text-sm text-muted-foreground">
        {formattedDate}
      </div>
    {/if}
  </div>

  {#if isSelected}
    <div class="overflow-hidden transition-all" 
      in:slide={{ duration: 200 }} 
      out:slide={{ duration: 200 }}
    >
      <p class="px-2 sm:px-4 pb-3 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  {/if}
</a>

<script lang="ts" context="module">
import { slide } from 'svelte/transition'
</script> 