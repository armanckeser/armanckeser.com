<!-- A post as a printed page: the sheet of paper, its masthead, and the prose.
     Shared by the post route and the editor's preview so the two cannot drift. -->
<script lang="ts">
import { inkHue } from "$lib/ink"
import { formatDate } from "$lib/utils"
import type { Snippet } from "svelte"

const {
	title,
	description,
	date,
	minutes,
	path,
	headingLevel = "h1",
	plain = false,
	children,
} = $props<{
	title: string
	description?: string
	date?: string
	minutes?: number
	/** The post's path. Its ink colour is picked from it. */
	path?: string
	/** The title is the document h1; editor previews pass a lower level. */
	headingLevel?: "h1" | "h2"
	/** A page that is not a piece of writing (a policy): no drop cap. */
	plain?: boolean
	children: Snippet
}>()

const hue = $derived(path ? inkHue(path) : undefined)
</script>

<article class="sheet post" class:plain style:--hue={hue}>
  <header class="masthead">
    {#if date}
      <p class="meta font-mono">
        <time datetime={date}>{formatDate(date)}</time>{#if minutes}<span aria-hidden="true">·</span>{minutes} min read{/if}
      </p>
    {/if}
    <svelte:element this={headingLevel} class="title font-serif">{title}</svelte:element>
    {#if description}
      <p class="dek font-serif">{description}</p>
    {/if}
  </header>

  <div class="prose-blog">
    {@render children()}
  </div>
</article>

<style>
  .post {
    --sheet-pad: 1.25rem;
    position: relative;
    padding: 0 var(--sheet-pad) 3.5rem;
  }

  /* The top of the page is what a card or a line of the listing grows into, so
     it carries its own paper, and the name the layout pairs them by. */
  .masthead {
    margin-inline: calc(var(--sheet-pad) * -1);
    padding: 2.25rem var(--sheet-pad) 2rem;
    /* The shade of the header the page comes out from under. */
    background:
      linear-gradient(hsl(var(--ink) / 0.07), transparent 0.75rem),
      hsl(var(--paper));
    view-transition-name: sheet;
  }

  .meta {
    display: flex;
    gap: 0.6em;
    color: hsl(var(--ink-soft));
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .title {
    margin-top: 0.9rem;
    color: hsl(var(--ink));
    font-size: clamp(1.9rem, 1.2rem + 3.6vw, 3rem);
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.022em;
    text-wrap: balance;
  }

  .dek {
    margin-top: 0.9rem;
    max-width: 34rem;
    color: hsl(var(--ink-soft));
    font-size: 1.1875rem;
    font-style: italic;
    line-height: 1.45;
    text-wrap: pretty;
  }

  /* A short rule in the post's ink closes the masthead. */
  .masthead::after {
    content: "";
    display: block;
    width: 2.5rem;
    height: 3px;
    margin-top: 1.75rem;
    background: var(--post-ink);
  }

  /* The first paragraph of the piece opens with a drop cap, as on its card. */
  .post:not(.plain) :global(.prose-blog > p:first-of-type::first-letter) {
    float: left;
    padding: 0.08em 0.1em 0 0;
    color: var(--post-ink);
    font-size: 3.35em;
    font-weight: 700;
    line-height: 0.82;
  }

  @media (min-width: 640px) {
    .post {
      --sheet-pad: 3.5rem;
      padding-bottom: 5rem;
      border-radius: 0 0 0.375rem 0.375rem;
      box-shadow:
        0 1px 1px rgb(0 0 0 / 0.06),
        0 18px 40px -12px rgb(0 0 0 / 0.14);
    }

    .masthead {
      padding-top: 3.5rem;
    }

    .post :global(.prose-blog) {
      font-size: 1.1875rem;
    }

    :global(.dark) .post {
      box-shadow:
        0 0 0 1px hsl(var(--paper-edge) / 0.6),
        0 24px 48px -12px rgb(0 0 0 / 0.7);
    }
  }
</style>
