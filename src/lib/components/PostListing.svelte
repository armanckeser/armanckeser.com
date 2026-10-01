<script lang="ts">
import { formatDate } from "$lib/utils"
import type { BlogPost } from "../../types"

const {
	posts,
	minutes = {},
	selected = null,
	feed = false,
	more,
} = $props<{
	posts: BlogPost[]
	/** Reading time, keyed by the post's file name (the last segment of its slug). */
	minutes?: Record<string, number>
	/** The slug of the row the keyboard is on, if any. */
	selected?: string | null
	/** Slide the sheet out from under the header when the page opens. */
	feed?: boolean
	/** A closing line that leads to the full index. */
	more?: { href: string; label: string }
}>()

const fileOf = (slug: string) => slug.split("/").pop() ?? slug
const yearOf = (iso: string) => new Date(iso).getUTCFullYear()

const years = $derived.by(() => {
	const groups: { year: number; posts: BlogPost[] }[] = []
	for (const post of posts as BlogPost[]) {
		const year = yearOf(post.date)
		const last = groups[groups.length - 1]
		if (last?.year === year) last.posts.push(post)
		else groups.push({ year, posts: [post] })
	}
	return groups
})
</script>

<!--
  The index of posts, set as a contents page on the same paper the posts are
  printed on: year, then each title with its line of description.
-->
<div class="index sheet" class:feed>
  {#each years as group (group.year)}
    <section aria-labelledby="year-{group.year}">
      <h2 id="year-{group.year}" class="year font-mono">{group.year}</h2>
      <ol>
        {#each group.posts as post (post.slug)}
          <li class="row" class:selected={selected === post.slug} data-sheet={fileOf(post.slug)}>
            <a href={post.slug} aria-current={selected === post.slug ? "true" : undefined}>
              <p class="meta font-mono">
                <time datetime={post.date}>{formatDate(post.date, { month: "short", day: "numeric" })}</time>{#if minutes[fileOf(post.slug)]}<span class="sep" aria-hidden="true">·</span><span>{minutes[fileOf(post.slug)]} min</span>{/if}
              </p>
              <h3 class="title font-serif">{post.title}</h3>
              {#if post.description}
                <p class="dek font-serif">{post.description}</p>
              {/if}
            </a>
          </li>
        {/each}
      </ol>
    </section>
  {/each}

  {#if more}
    <a href={more.href} class="more font-mono">{more.label} <span class="arrow" aria-hidden="true">→</span></a>
  {/if}
</div>

<style>
  .index {
    --pad: 1.25rem;
    padding-bottom: 0.75rem;
    border-radius: 0 0 0.375rem 0.375rem;
    box-shadow:
      0 1px 1px rgb(0 0 0 / 0.06),
      0 14px 30px -12px rgb(0 0 0 / 0.16);
  }

  :global(.dark) .index {
    box-shadow:
      0 0 0 1px hsl(var(--paper-edge) / 0.6),
      0 18px 36px -12px rgb(0 0 0 / 0.7);
  }

  .year {
    margin: 0;
    padding: 1.75rem var(--pad) 0.6rem;
    color: hsl(var(--ink-soft));
    font-size: 0.6875rem;
    font-weight: 500;
    line-height: 1;
    letter-spacing: 0.16em;
  }

  /* The first one sits under the header the sheet comes out from. */
  section:first-child .year {
    background: linear-gradient(hsl(var(--ink) / 0.07), transparent 0.75rem);
  }

  .row a {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.35rem;
    margin-inline: var(--pad);
    padding-block: 1rem 1.1rem;
    border-top: 1px solid hsl(var(--ink) / 0.12);
    color: inherit;
  }

  .meta {
    display: flex;
    gap: 0.5em;
    color: hsl(var(--ink-soft));
    font-size: 0.6875rem;
    line-height: 1.3;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-variant-numeric: tabular-nums;
  }

  .title {
    color: hsl(var(--ink));
    font-size: 1.3125rem;
    font-weight: 700;
    line-height: 1.18;
    letter-spacing: -0.015em;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-decoration-thickness: 0.07em;
    text-underline-offset: 0.18em;
    transition: text-decoration-color 150ms ease;
  }

  .dek {
    display: -webkit-box;
    overflow: hidden;
    color: hsl(var(--ink-soft));
    font-size: 1rem;
    line-height: 1.45;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  .more {
    display: flex;
    gap: 0.5em;
    margin-inline: var(--pad);
    padding-block: 1rem 0.5rem;
    border-top: 1px solid hsl(var(--ink) / 0.12);
    color: hsl(var(--ink-soft));
    font-size: 0.8125rem;
    transition: color 150ms ease;
  }

  .arrow {
    transition: transform 200ms var(--ease-out);
  }

  /* Press: the answer is immediate. */
  .row a:active .title {
    text-decoration-color: hsl(var(--accent));
    transition-duration: 0ms;
  }

  .row a:focus-visible,
  .more:focus-visible {
    outline: 2px solid hsl(var(--accent));
    outline-offset: 2px;
    box-shadow: none;
  }

  /* The keyboard's place in the list: a mark in the margin, in the room's ink. */
  .row.selected a {
    box-shadow: calc(var(--pad) * -0.5) 0 0 -0.3rem hsl(var(--accent));
  }

  .row.selected .title {
    text-decoration-color: hsl(var(--accent));
  }

  @media (min-width: 640px) {
    .index {
      --pad: 2.5rem;
    }

    .row a {
      grid-template-columns: 5rem minmax(0, 1fr) auto;
      column-gap: 1.5rem;
    }

    /* The date and the time to read move to the outer columns. */
    .meta {
      display: contents;
    }

    .meta .sep {
      display: none;
    }

    .meta time {
      grid-area: 1 / 1;
      padding-top: 0.5rem;
    }

    .meta span:last-child {
      grid-area: 1 / 3;
      padding-top: 0.5rem;
      text-align: right;
    }

    .title {
      grid-area: 1 / 2;
      font-size: 1.4375rem;
    }

    .dek {
      grid-area: 2 / 2;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    .row a:hover .title {
      text-decoration-color: hsl(var(--accent));
    }

    .more:hover {
      color: hsl(var(--ink));
    }

    .more:hover .arrow {
      transform: translateX(3px);
    }
  }

  /* The page opens with the sheet coming out from under the header. */
  .index.feed {
    animation: feed 480ms var(--ease-out) both;
  }

  @keyframes feed {
    from {
      clip-path: inset(0 -3rem 100% -3rem);
      transform: translateY(-2rem);
    }
    to {
      clip-path: inset(0 -3rem -3rem -3rem);
      transform: translateY(0);
    }
  }
</style>
