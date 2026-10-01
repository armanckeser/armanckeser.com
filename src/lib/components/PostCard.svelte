<script lang="ts">
import { tilt } from "$lib/tilt"
import { formatDate } from "$lib/utils"

const {
	title,
	description,
	date,
	href,
	excerpt = [],
	minutes,
	featured = false,
} = $props<{
	title: string
	description?: string
	date: string
	href: string
	/** The post's opening paragraphs, which run off the bottom of the card. */
	excerpt?: string[]
	minutes?: number
	featured?: boolean
}>()
</script>

<!--
  A post's card is the top of its page at a smaller size: the same paper, the
  same masthead, the same opening lines. Opening it grows this sheet into the
  page itself (data-sheet; see the root layout).
-->
<article class="card sheet" class:featured data-sheet={href.split("/").pop()} use:tilt>
  <div class="masthead">
    <p class="meta font-mono">
      <time datetime={date}>{formatDate(date)}</time>{#if minutes}<span aria-hidden="true">·</span>{minutes} min read{/if}
    </p>
    <h3 class="title font-serif">
      <!-- Stretched link: its ::after covers the card, so the whole card is one target. -->
      <a {href} class="after:absolute after:inset-0 after:z-10 focus-visible:outline-none">{title}</a>
    </h3>
    {#if description}
      <p class="dek font-serif">{description}</p>
    {/if}
  </div>

  {#if excerpt.length}
    <div class="opening font-serif" aria-hidden="true">
      {#each excerpt as paragraph}
        <p>{paragraph}</p>
      {/each}
    </div>
  {/if}
</article>

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    height: 25rem;
    padding: 1.5rem 1.5rem 0;
    overflow: hidden;
    border-radius: 0.375rem;
    box-shadow:
      0 1px 1px rgb(0 0 0 / 0.06),
      0 12px 28px -10px rgb(0 0 0 / 0.18);
    transition:
      box-shadow 200ms ease,
      scale 160ms var(--ease-out);
  }

  :global(.dark) .card {
    box-shadow:
      0 0 0 1px hsl(var(--paper-edge) / 0.7),
      0 16px 32px -12px rgb(0 0 0 / 0.7);
  }

  /* Pressed: the card gives a little, so the tap is felt before the page changes. */
  .card:active {
    scale: 0.985;
  }

  .masthead {
    flex-shrink: 0;
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
    margin-top: 0.7rem;
    color: hsl(var(--ink));
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.12;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .dek {
    display: -webkit-box;
    margin-top: 0.6rem;
    overflow: hidden;
    color: hsl(var(--ink-soft));
    font-size: 1rem;
    font-style: italic;
    line-height: 1.4;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    line-clamp: 4;
  }

  /* The page carries on below: its first lines, fading out where the card ends. */
  .opening {
    flex: 1;
    min-height: 0;
    padding-top: 1.1rem;
    border-top: 1px solid hsl(var(--ink) / 0.12);
    overflow: hidden;
    font-size: 0.875rem;
    line-height: 1.65;
    mask-image: linear-gradient(#000 35%, transparent 96%);
  }

  /* Ink on paper, whatever the site says paragraphs look like. */
  .opening p {
    color: hsl(var(--ink) / 0.82);
    line-height: inherit;
  }

  .opening p + p {
    margin-top: 0.6em;
  }

  .opening p:first-child::first-letter {
    float: left;
    padding: 0.08em 0.1em 0 0;
    color: hsl(var(--accent));
    font-size: 3.1em;
    font-weight: 700;
    line-height: 0.82;
  }

  .card:has(a:focus-visible) {
    outline: 2px solid hsl(var(--accent));
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    .card:hover {
      box-shadow:
        0 1px 1px rgb(0 0 0 / 0.06),
        0 22px 40px -12px rgb(0 0 0 / 0.26);
    }

    :global(.dark) .card:hover {
      box-shadow:
        0 0 0 1px hsl(var(--paper-edge)),
        0 24px 44px -12px rgb(0 0 0 / 0.8);
    }
  }

  /* The newest post leads at full width: masthead on the left, the page beside it. */
  @media (min-width: 768px) {
    .card {
      height: 24rem;
      padding: 2rem 2rem 0;
    }

    .card.featured {
      flex-direction: row;
      gap: 3rem;
      height: 22rem;
      padding: 2.5rem 2.5rem 0;
    }

    .featured .masthead {
      width: 44%;
    }

    .featured .title {
      font-size: clamp(2rem, 3vw, 2.75rem);
      line-height: 1.06;
    }

    .featured .dek {
      font-size: 1.125rem;
    }

    .featured .opening {
      padding-top: 0;
      padding-left: 3rem;
      border-top: 0;
      border-left: 1px solid hsl(var(--ink) / 0.12);
      font-size: 0.9375rem;
    }
  }
</style>
