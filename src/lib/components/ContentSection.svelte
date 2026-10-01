<script lang="ts">
import type { Snippet } from "svelte"

const { title, link, children, id } = $props<{
	title: string
	/** Where the whole of it lives: the full listing, or my profile on the service it comes from. */
	link?: { href: string; label: string }
	children: Snippet
	id: string
}>()

const external = $derived(link?.href.startsWith("http"))
</script>

<section class="relative w-full space-y-6" aria-labelledby={id}>
  <!-- The label is the terminal's, the same in every room. -->
  <div class="flex items-center gap-3">
    <div class="h-px w-12 bg-accent/30 md:w-16"></div>
    <h2 {id} class="font-mono text-xl font-medium tracking-tight text-primary md:text-2xl">
      {title}
    </h2>
    {#if link}
      <a
        href={link.href}
        class="more -my-3 ml-auto py-3 font-mono text-sm text-muted-foreground"
        target={external ? "_blank" : undefined}
        rel={external ? "noopener" : undefined}
      >
        {link.label}&nbsp;<span class="arrow inline-block" aria-hidden="true">{external ? "↗" : "→"}</span>
      </a>
    {/if}
  </div>

  <div class="w-full">
    {@render children()}
  </div>
</section>

<style>
  .more {
    transition: color 150ms ease;
  }

  .arrow {
    transition: transform 200ms var(--ease-out);
  }

  .more:active {
    color: hsl(var(--accent));
  }

  @media (hover: hover) and (pointer: fine) {
    .more:hover {
      color: hsl(var(--accent));
    }

    .more:hover .arrow {
      transform: translateX(3px);
    }
  }
</style>
