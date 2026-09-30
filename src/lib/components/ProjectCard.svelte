<script lang="ts">
import { formatDate } from "$lib/utils"

const { title, description, stars, url, homepage, language, updated } = $props<{
	title: string
	description: string
	stars?: number
	url: string | null
	homepage: string | null
	language?: string | null
	updated?: string
}>()

// GitHub's own language colours, for the handful used here.
const LANGUAGE_COLORS: Record<string, string> = {
	TypeScript: "#3178c6",
	JavaScript: "#f1e05a",
	Python: "#3572A5",
	Svelte: "#ff3e00",
	"C#": "#178600",
	Rust: "#dea584",
	Go: "#00ADD8",
}

// The whole card opens the live app when there is one, the source otherwise.
const primary = $derived(homepage ?? url)
const host = $derived(
	homepage ? new URL(homepage).host.replace(/^www\./, "") : null
)
</script>

<article
  class="project-card glass-card group relative flex h-full flex-col gap-3 rounded-lg border border-border/40 p-5"
>
  <div class="flex items-center gap-3 font-mono text-xs text-muted-foreground">
    {#if language}
      <span class="flex items-center gap-1.5">
        <span
          class="h-2 w-2 rounded-full"
          style:background-color={LANGUAGE_COLORS[language] ?? "hsl(var(--muted-foreground))"}
          aria-hidden="true"
        ></span>
        {language}
      </span>
    {/if}
    {#if stars && stars > 0}
      <span class="flex items-center gap-1" aria-label="{stars} stars">
        <span class="text-accent" aria-hidden="true">★</span>
        <span class="tabular-nums">{stars}</span>
      </span>
    {/if}
    {#if updated}
      <time datetime={updated} class="ml-auto">{formatDate(updated)}</time>
    {/if}
  </div>

  <h3 class="font-mono text-base font-bold text-primary md:text-lg">
    {#if primary}
      <!-- Stretched link: its ::after covers the card, so the whole card is one target. -->
      <a href={primary} target="_blank" rel="noopener" class="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none">
        {title}
      </a>
    {:else}
      {title}
    {/if}
  </h3>

  <p class="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
    {description}
  </p>

  <div class="flex items-center gap-4 font-mono text-xs">
    {#if host}
      <span class="text-accent">
        {host}<span class="arrow inline-block" aria-hidden="true">&nbsp;↗</span>
      </span>
    {/if}
    {#if url}
      <!-- Sits above the stretched link so the source stays reachable on its own. -->
      <a
        href={url}
        target="_blank"
        rel="noopener"
        class="relative z-10 text-muted-foreground transition-colors duration-150 hover:text-primary"
        aria-label="{title} source on GitHub"
      >
        {homepage ? "source" : "github.com"}<span class="src-arrow inline-block" aria-hidden="true">&nbsp;↗</span>
      </a>
    {/if}
  </div>
</article>

<style>
  .project-card {
    transition:
      border-color 200ms ease,
      transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  /* Keyboard focus lands on the stretched link; show it on the whole card. */
  .project-card:has(a:focus-visible) {
    outline: 2px solid hsl(var(--accent));
    outline-offset: 2px;
  }

  .project-card:active {
    transform: scale(0.99);
  }

  .arrow,
  .src-arrow {
    transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    .project-card:hover {
      border-color: hsl(var(--accent) / 0.3);
    }
    .project-card:hover .arrow {
      transform: translate(2px, -2px);
    }
    .project-card a:hover .src-arrow {
      transform: translate(2px, -2px);
    }
  }
</style>
