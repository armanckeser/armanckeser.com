<script lang="ts">
import { formatDate } from "$lib/utils"
import type { BlogPost } from "../../types"
import PostCard from "./PostCard.svelte"

type Opening = { excerpt: string[]; minutes: number }

const { posts, openings = {} } = $props<{
	posts: BlogPost[]
	/** Keyed by the post's file name, which is the last segment of its slug. */
	openings?: Record<string, Opening>
}>()

// The newest posts get cards; the rest stay one line each, like the projects.
const CARDS = 5
const shown = $derived(posts.slice(0, CARDS))
const rest = $derived(posts.slice(CARDS))

const opening = (slug: string): Opening | undefined =>
	openings[slug.split("/").pop() ?? slug]
const wide = (i: number, n: number) => i === 0 || (i === n - 1 && n % 2 === 0)
const month = (iso: string) =>
	formatDate(iso, { month: "short", year: "numeric" })
</script>

<!-- Phones: one swipeable row instead of a long scroll. -->
<div class="shelf -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:hidden" role="region" aria-label="Latest writing">
  {#each shown as post (post.slug)}
    <div class="shelf-slot w-[84%] shrink-0 snap-start">
      <PostCard title={post.title} description={post.description} date={post.date} href={post.slug} excerpt={opening(post.slug)?.excerpt} minutes={opening(post.slug)?.minutes} />
    </div>
  {/each}
</div>

<div class="hidden gap-5 md:grid md:grid-cols-2">
  {#each shown as post, i (post.slug)}
    <div class={wide(i, shown.length) ? "md:col-span-2" : ""}>
      <PostCard
        title={post.title}
        description={post.description}
        date={post.date}
        href={post.slug}
        excerpt={opening(post.slug)?.excerpt}
        minutes={opening(post.slug)?.minutes}
        featured={wide(i, shown.length)}
      />
    </div>
  {/each}
</div>

{#if rest.length}
  <div class="mt-10 font-mono text-sm">
    <p class="mb-3 text-muted-foreground">
      <span class="text-blue-600 dark:text-blue-400">❯</span> ls -l ~/writing
    </p>
    <ul class="divide-y divide-border/40 border-y border-border/40">
      {#each rest as post (post.slug)}
        <li>
          <a href={post.slug} class="ls-row grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-2.5 md:grid-cols-[6.5rem_1fr_auto]">
            <span class="hidden text-muted-foreground md:block">{month(post.date)}</span>
            <span class="col-start-1 font-bold text-primary md:col-start-auto">{post.title}</span>
            <span class="col-start-2 row-start-1 text-right text-muted-foreground md:col-start-auto md:row-start-auto">
              {#if opening(post.slug)}{opening(post.slug)?.minutes} min{/if}
              <span class="arrow inline-block" aria-hidden="true">→</span>
            </span>
          </a>
        </li>
      {/each}
    </ul>
    <a href="/writing" class="mt-3 inline-block text-muted-foreground transition-colors duration-150 hover:text-accent">cd ~/writing →</a>
  </div>
{/if}

<style>
  .shelf {
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 1rem;
    scrollbar-width: none;
    overscroll-behavior-x: contain;
  }

  .ls-row {
    transition: background-color 150ms ease;
  }

  .arrow {
    transition: transform 200ms var(--ease-out);
  }

  @media (hover: hover) and (pointer: fine) {
    .ls-row:hover {
      background-color: hsl(var(--accent) / 0.06);
    }
    .ls-row:hover .arrow {
      transform: translateX(3px);
    }
  }
</style>
