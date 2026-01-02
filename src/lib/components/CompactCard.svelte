<script lang="ts">
import { slide } from "svelte/transition"
import { getTagClasses } from "$lib/tags"
import { formatDate, getViewTransitionId } from "$lib/utils"

const {
	title,
	description,
	tag = "blog",
	date,
	href,
	isSelected = false,
	onclick = () => void 0,
	onmouseenter = () => void 0,
	onmouseleave = () => void 0,
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

const tagClasses = getTagClasses(tag)
const formattedDate = $derived(date ? formatDate(date) : null)
const descriptionId = $derived(
	`description-${title.toLowerCase().replace(/\s+/g, "-")}`
)
const viewId = $derived(getViewTransitionId(href, title))
</script>

<article
  class="group border-l-2 transition-all {isSelected
    ? 'border-accent/20'
    : 'border-transparent'}"
  {onmouseenter}
  {onmouseleave}
>
  <!-- Header section - clickable to expand -->
  <a
    {href}
    class="grid grid-cols-[1fr_auto] items-center gap-3 px-2 sm:px-4 py-3 cursor-pointer hover:bg-accent/5"
    {onclick}
    role="button"
    tabindex="0"
    aria-expanded={isSelected}
    onkeydown={(e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onclick())}
    data-sveltekit-preload-data="hover"
    data-sveltekit-preload-code="hover"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div 
        class={`shrink-0 px-1.5 py-0.5 w-fit font-mono text-xs ${tagClasses}`}
        style:view-transition-name="tag-{viewId}"
      >
        {tag}
      </div>

      <div class="w-fit" style:view-transition-name="title-{viewId}">
        <h3 class="truncate font-mono text-base font-bold text-primary">
          {title}
        </h3>
      </div>
    </div>

    <div class="flex items-center gap-3">
      {#if formattedDate}
        <time 
          datetime={date} 
          class="font-mono text-sm text-muted-foreground"
          style:view-transition-name="date-{viewId}"
        >
          {formattedDate}
        </time>
      {/if}
    </div>
  </a>

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
      <div
        class="grid grid-cols-[1fr_auto] items-center gap-4 px-2 sm:px-4 pb-3"
      >
        <div class="w-fit" style:view-transition-name="desc-{viewId}">
          <p class="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {#if href}
          <a
            {href}
            class="glass hover:sharp-shadow-md group/link flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:border-accent/20"
            aria-label="Go to article"
            data-sveltekit-preload-data="hover"
            data-sveltekit-preload-code="hover"
          >
            <span
              class="font-mono text-accent transition-transform duration-200 group-hover/link:translate-x-0.5"
              >→</span
            >
          </a>
        {/if}
      </div>
    </div>
  {/if}
</article>
