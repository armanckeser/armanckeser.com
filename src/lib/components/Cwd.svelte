<!-- Where you are, written the way a prompt writes it: ~/writing/some-post.
     Every directory on the way is a link, so the path is also the way back. -->
<script lang="ts">
import { base } from "$app/paths"
import { page } from "$app/state"

const segments = $derived.by(() => {
	const parts = page.url.pathname.split("/").filter(Boolean)
	let path = base
	return parts.map((text: string, i: number) => {
		path += `/${text}`
		return { text, href: path, last: i === parts.length - 1 }
	})
})
</script>

<nav class="flex min-w-0 items-center font-mono text-sm" aria-label="Current path">
  <a href="{base}/" class="crumb shrink-0 pr-0.5" aria-label="Home" aria-current={segments.length ? undefined : "page"}>~</a>
  {#each segments as segment (segment.href)}
    <span class="shrink-0 text-muted-foreground" aria-hidden="true">/</span>
    {#if segment.last}
      <span class="truncate px-0.5 text-muted-foreground" aria-current="page">{segment.text}</span>
    {:else}
      <a href={segment.href} class="crumb shrink-0 px-0.5">{segment.text}</a>
    {/if}
  {/each}
</nav>

<style>
  /* Tall enough for a thumb: the link fills the header's height. */
  .crumb {
    padding-block: 1.1rem;
    color: hsl(var(--primary));
    text-decoration: underline;
    text-decoration-color: hsl(var(--border));
    text-underline-offset: 0.3em;
    transition:
      color 150ms ease,
      text-decoration-color 150ms ease;
  }

  .crumb:active {
    color: hsl(var(--accent));
  }

  @media (hover: hover) and (pointer: fine) {
    .crumb:hover {
      color: hsl(var(--accent));
      text-decoration-color: hsl(var(--accent) / 0.5);
    }
  }
</style>
