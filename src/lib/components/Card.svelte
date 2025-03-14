<script lang="ts">
const {
	title,
	description,
	tag = "blog",
	date,
	stars,
	href,
} = $props<{
	title: string
	description: string
	tag?: Tag
	date?: string
	stars?: number
	href?: string
}>()

import { type Tag, getTagClasses } from "$lib/tags"
const tagClasses = getTagClasses(tag)

const Component = $derived(href ? "a" : "div")
const componentProps = $derived(href ? { href, class: "block" } : {})

// Generate a unique ID for view transitions
const viewId = $derived.by(() => {
	if (href) {
		// Extract the slug from the href and format it to match the post's viewId
		const slug = href.split("/").pop() // Get the last part of the path
		const id = `-writing-${slug}`
		return id
	}
	// Fallback for non-link cards (should not be used for blog posts)
	const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
	return id
})
</script>

<svelte:element
  this={Component}
  {...componentProps}
  class="glass-card hover:sharp-shadow-md group relative flex md:h-[180px] w-full flex-col justify-between overflow-hidden rounded-lg border border-border/40 bg-white/5 dark:bg-black/5 p-3 transition-all duration-300 hover:border-accent/20"
>
  <div class="flex md:hidden h-full flex-col">
    <div class="flex-1 space-y-1.5">
      <div class="flex items-center justify-between gap-1.5 -mt-2 -ml-1.5">
        <div
          class={`rounded px-1.5 py-0.5 font-mono text-[0.65rem] ${tagClasses} relative z-10`}
          style:view-transition-name="tag-{viewId}"
        >
          {tag}
        </div>
        <div class="flex items-center gap-1">
          {#if date}
            <time
              datetime={date}
              class="font-mono text-[0.65rem] text-muted-foreground relative z-10"
              style:view-transition-name="date-{viewId}"
            >
              {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </time>
          {/if}
          {#if stars && stars > 0}
            <div class="flex items-center gap-1 text-xs text-muted-foreground">
              <span class="text-accent">★</span>
              <span>{stars}</span>
            </div>
          {/if}
        </div>
      </div>
      <div style:view-transition-name="title-{viewId}">
        <h3 class="line-clamp-1 font-mono text-sm font-medium text-primary">
          {title}
        </h3>
      </div>
      <div style:view-transition-name="desc-{viewId}">
        <p class="line-clamp-2 text-xs leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  </div>

  <div class="hidden md:flex p-3">
    <!-- Header -->
    <div>
      <div class="mb-3 flex items-center gap-3">
        <div class={`rounded px-2 py-0.5 font-mono text-xs ${tagClasses}`} style:view-transition-name="tag-{viewId}">
          {tag}
        </div>
        {#if date}
          <time
            datetime={date}
            class="font-mono text-xs text-muted-foreground"
            style:view-transition-name="date-{viewId}"
          >
            {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </time>
        {/if}
        {#if stars && stars > 0}
          <div
            class="flex items-center gap-1 font-mono text-xs text-muted-foreground"
          >
            <span class="text-accent">★</span>
            <span>{stars}</span>
          </div>
        {/if}
      </div>

      <!-- Content -->
      <div style:view-transition-name="title-{viewId}">
        <h3 class="mb-2 font-mono text-base font-medium text-primary md:text-lg">
          {title}
        </h3>
      </div>
      <div style:view-transition-name="desc-{viewId}">
        <p class="text-xs leading-relaxed text-muted-foreground md:text-sm">
          {description}
        </p>
      </div>
    </div>

    <!-- Hover Indicator -->
    {#if href}
      <div
        class="absolute bottom-2 right-4 font-mono text-xs text-accent opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
      >
        →
      </div>
    {/if}
  </div>
</svelte:element>
