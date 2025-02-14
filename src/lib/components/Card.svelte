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
</script>

<svelte:element
  this={Component}
  {...componentProps}
  class="glass hover:sharp-shadow-md group relative flex md:h-[180px] w-full flex-col justify-between overflow-hidden rounded-lg border border-border/40 bg-white/5 dark:bg-black/5 p-3 transition-all duration-300 hover:border-accent/20"
>
  <div class="flex md:hidden h-full flex-col">
    <div class="flex-1 space-y-1.5">
      <div class="flex items-center justify-between gap-1.5 -mt-2 -ml-1.5">
        <div
          class={`rounded px-1.5 py-0.5 font-mono text-[0.65rem] ${tagClasses} relative z-10`}
        >
          {tag}
        </div>
        <div class="flex items-center gap-1">
          {#if date}
            <div
              class="font-mono text-[0.65rem] text-muted-foreground relative z-10"
            >
              {date}
            </div>
          {/if}
          {#if stars && stars > 0}
            <div class="flex items-center gap-1 text-xs text-muted-foreground">
              <span class="text-accent">★</span>
              <span>{stars}</span>
            </div>
          {/if}
        </div>
      </div>
      <h3 class="line-clamp-1 font-mono text-sm font-medium text-primary">
        {title}
      </h3>
      <p class="line-clamp-2 text-xs leading-snug text-muted-foreground">
        {description}
      </p>
    </div>
  </div>

  <div class="hidden md:flex p-3">
    <!-- Header -->
    <div>
      <div class="mb-3 flex items-center gap-3">
        <div class={`rounded px-2 py-0.5 font-mono text-xs ${tagClasses}`}>
          {tag}
        </div>
        {#if date}
          <div class="font-mono text-xs text-muted-foreground">
            {date}
          </div>
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
      <h3 class="mb-2 font-mono text-base font-medium text-primary md:text-lg">
        {title}
      </h3>
      <p class="text-xs leading-relaxed text-muted-foreground md:text-sm">
        {description}
      </p>
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

<style>
  .glass {
    position: relative;
    background: linear-gradient(
      180deg,
      hsl(var(--background) / 0.3) 0%,
      hsl(var(--background) / 0.2) 100%
    );
    backdrop-filter: blur(8px);
  }

  .glass::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(
      180deg,
      hsl(var(--border) / 0.3),
      hsl(var(--border) / 0.1)
    );
    mask:
      linear-gradient(black, black) content-box,
      linear-gradient(black, black);
    mask-composite: exclude;
    pointer-events: none;
  }

  :global(.dark) .glass {
    background: linear-gradient(
      180deg,
      hsl(var(--background) / 0.2) 0%,
      hsl(var(--background) / 0.1) 100%
    );
  }

  :global(.dark) .glass::before {
    background: linear-gradient(
      180deg,
      hsl(var(--border) / 0.2),
      hsl(var(--border) / 0.05)
    );
  }
</style>
