<script lang="ts">
import type { BlogPost } from "../../types"
import PostCard from "./PostCard.svelte"

type Opening = { excerpt: string[]; minutes: number }

const { posts, openings = {} } = $props<{
	posts: BlogPost[]
	/** Keyed by the post's file name, which is the last segment of its slug. */
	openings?: Record<string, Opening>
}>()

// The newest posts get cards; the full index is one link away.
const CARDS = 5
const shown = $derived(posts.slice(0, CARDS))

const opening = (slug: string): Opening | undefined =>
	openings[slug.split("/").pop() ?? slug]
const wide = (i: number, n: number) => i === 0 || (i === n - 1 && n % 2 === 0)
</script>

<!-- Phones: one swipeable row instead of a long scroll. -->
<div class="shelf -mx-4 flex gap-3 overflow-x-auto px-4 pb-6 pt-1 md:hidden" role="region" aria-label="Latest writing">
  {#each shown as post (post.slug)}
    <div class="shelf-slot w-[84%] shrink-0 snap-start">
      <PostCard title={post.title} description={post.description} date={post.date} href={post.slug} excerpt={opening(post.slug)?.excerpt} minutes={opening(post.slug)?.minutes} />
    </div>
  {/each}
</div>

<div class="hidden gap-6 md:grid md:grid-cols-2">
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

<style>
  .shelf {
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 1rem;
    scrollbar-width: none;
    overscroll-behavior-x: contain;
  }
</style>
