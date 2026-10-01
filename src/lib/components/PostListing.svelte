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
	/** Feed the paper out of the header when the page opens. */
	feed?: boolean
	/** A closing line that leads to the full listing. */
	more?: { href: string; label: string }
}>()

const fileOf = (slug: string) => slug.split("/").pop() ?? slug
const yearOf = (iso: string) => new Date(iso).getUTCFullYear()

// Continuous paper folds once a year.
const years = $derived.by(() => {
	const groups: { year: number; posts: { post: BlogPost; n: number }[] }[] =
		[]
	posts.forEach((post: BlogPost, n: number) => {
		const year = yearOf(post.date)
		const last = groups[groups.length - 1]
		if (last?.year === year) last.posts.push({ post, n })
		else groups.push({ year, posts: [{ post, n }] })
	})
	return groups
})
</script>

<!--
  A line-printer listing: continuous green-bar paper, with the sprocket holes
  down both margins and a perforated fold where the year changes.
  The wrapper carries the shadow so it can follow the torn bottom edge.
-->
<div class="printout" class:feed>
  <div class="paper sheet font-mono">
    {#each years as group, g (group.year)}
      <section aria-labelledby="year-{group.year}">
        <h2 id="year-{group.year}" class="fold" class:first={g === 0}>{group.year}</h2>
        <ol>
          {#each group.posts as { post, n } (post.slug)}
            <li class="row" class:bar={n % 2 === 0} class:selected={selected === post.slug} data-sheet={fileOf(post.slug)}>
              <a href={post.slug} aria-current={selected === post.slug ? "true" : undefined}>
                <p class="meta">
                  <time datetime={post.date}>{formatDate(post.date, { month: "short", day: "numeric" })}</time>{#if minutes[fileOf(post.slug)]}<span class="sep" aria-hidden="true">·</span><span>{minutes[fileOf(post.slug)]} min</span>{/if}
                </p>
                <h3 class="title">{post.title}</h3>
                {#if post.description}
                  <p class="dek font-sans">{post.description}</p>
                {/if}
                <span class="arrow" aria-hidden="true">→</span>
              </a>
            </li>
          {/each}
        </ol>
      </section>
    {/each}

    {#if more}
      <a href={more.href} class="more">{more.label} <span class="arrow" aria-hidden="true">→</span></a>
    {/if}
  </div>
</div>

<style>
  .printout {
    --strip: 1.125rem;
    --feed-line: 1.5rem;
    filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.08)) drop-shadow(0 14px 22px rgb(0 0 0 / 0.1));
  }

  :global(.dark) .printout {
    filter: drop-shadow(0 0 0.5px hsl(var(--paper-edge))) drop-shadow(0 18px 30px rgb(0 0 0 / 0.6));
  }

  .paper {
    position: relative;
    padding: 0 var(--strip) 1.75rem;
    /* A torn-off perforation along the bottom. */
    mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 12px 100%;
  }

  /* Sprocket holes: the desk shows through, with a hint of the paper's thickness. */
  .paper::before,
  .paper::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: var(--strip);
    background:
      radial-gradient(
        circle at 50% 50%,
        hsl(var(--background)) 0 0.22rem,
        hsl(var(--ink) / 0.22) 0.22rem 0.27rem,
        transparent 0.3rem
      )
      0 0.25rem / 100% var(--feed-line) repeat-y;
    pointer-events: none;
  }

  .paper::before {
    left: 0;
    border-right: 1px dashed hsl(var(--ink) / 0.14);
  }

  .paper::after {
    right: 0;
    border-left: 1px dashed hsl(var(--ink) / 0.14);
  }

  /* The fold between years: a perforation, and the crease it leaves below. */
  .fold {
    margin: 0;
    padding: 0.55rem 1rem 0.45rem;
    border-top: 1px dashed hsl(var(--ink) / 0.28);
    background: linear-gradient(hsl(var(--ink) / 0.055), transparent 0.6rem);
    color: hsl(var(--ink-soft));
    font-family: inherit;
    font-size: 0.6875rem;
    font-weight: 500;
    line-height: 1;
    letter-spacing: 0.16em;
  }

  /* The first one is the paper leaving the printer, so the shade is the slot's. */
  .fold.first {
    padding-top: 0.9rem;
    border-top: 0;
    background: linear-gradient(hsl(var(--ink) / 0.1), transparent 0.75rem);
  }

  .row a {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.3rem;
    padding: 0.9rem 1rem 1rem;
    color: inherit;
    transition: background-color 150ms ease;
  }

  .row.bar a {
    background-color: hsl(var(--bar));
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
    font-family: inherit;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.02em;
  }

  .dek {
    display: -webkit-box;
    overflow: hidden;
    color: hsl(var(--ink-soft));
    font-size: 0.875rem;
    line-height: 1.5;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  /* The arrow is a pointer's affordance; under a thumb the whole row is the target. */
  .row .arrow {
    display: none;
  }

  .arrow {
    transition: transform 200ms var(--ease-out);
  }

  .more {
    display: flex;
    gap: 0.5em;
    padding: 0.9rem 1rem 0.2rem;
    border-top: 1px dashed hsl(var(--ink) / 0.28);
    color: hsl(var(--ink-soft));
    font-size: 0.8125rem;
    transition: color 150ms ease;
  }

  /* Press: the answer is immediate, the release eases. */
  .row a:active {
    background-color: hsl(var(--ink) / 0.09);
    transition-duration: 0ms;
  }

  .row a:focus-visible,
  .more:focus-visible {
    outline: 2px solid hsl(var(--accent));
    outline-offset: -2px;
    box-shadow: none;
  }

  .row.selected a {
    background-color: hsl(var(--ink) / 0.06);
    box-shadow: inset 2px 0 0 var(--post-ink);
  }

  @media (min-width: 640px) {
    .printout {
      --strip: 1.5rem;
    }

    .fold {
      padding-inline: 1.5rem;
    }

    .row a {
      grid-template-columns: 5.5rem minmax(0, 1fr) auto;
      column-gap: 1.5rem;
      padding: 1rem 1.5rem 1.1rem;
    }

    /* The date and time-to-read split into the outer columns, `ls -l` style. */
    .meta {
      display: contents;
    }

    .meta .sep {
      display: none;
    }

    .meta time {
      grid-area: 1 / 1;
      padding-top: 0.3rem;
    }

    .meta span:last-child {
      grid-area: 1 / 3;
      padding-top: 0.3rem;
      text-align: right;
    }

    .title {
      grid-area: 1 / 2;
      font-size: 1.0625rem;
    }

    .dek {
      grid-area: 2 / 2;
    }

    .more {
      padding-inline: 1.5rem;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    .row a:hover {
      background-color: hsl(var(--ink) / 0.05);
    }

    .row .arrow {
      display: block;
      position: absolute;
      right: 1.5rem;
      bottom: 1rem;
      color: hsl(var(--ink-soft));
      opacity: 0;
      transition:
        transform 200ms var(--ease-out),
        opacity 150ms ease;
    }

    .row a:hover .arrow,
    .row.selected .arrow {
      opacity: 1;
      transform: translateX(3px);
    }

    .more:hover {
      color: hsl(var(--ink));
    }

    .more:hover .arrow {
      transform: translateX(3px);
    }
  }

  /* The page opens with the paper feeding out from under the header. */
  .printout.feed {
    animation: feed 560ms var(--ease-out) both;
  }

  @keyframes feed {
    from {
      clip-path: inset(0 -3rem 100% -3rem);
      transform: translateY(-3rem);
    }
    to {
      clip-path: inset(0 -3rem -3rem -3rem);
      transform: translateY(0);
    }
  }
</style>
