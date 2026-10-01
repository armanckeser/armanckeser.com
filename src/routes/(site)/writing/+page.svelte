<script lang="ts">
import { goto, preloadData } from "$app/navigation"
import PostListing from "$lib/components/PostListing.svelte"
import Seo from "$lib/components/Seo.svelte"
import { blogJsonLd, breadcrumbJsonLd } from "$lib/seo"
import type { BlogPost } from "../../../types"
import type { PageData } from "./$types"

const { data } = $props<{ data: PageData }>()
const posts: BlogPost[] = data.posts

/** The row the keyboard is on. Nothing is selected until a key asks for it. */
let selected = $state<string | null>(null)

function move(step: number) {
	const current = posts.findIndex(p => p.slug === selected)
	const next =
		current === -1
			? step > 0
				? 0
				: posts.length - 1
			: (current + step + posts.length) % posts.length
	selected = posts[next].slug
}

function handleKeydown(e: KeyboardEvent) {
	// Letters typed into the command line (or any field) are text, not navigation.
	const target = e.target as HTMLElement
	if (
		target.isContentEditable ||
		/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
		e.metaKey ||
		e.ctrlKey ||
		e.altKey
	)
		return
	if (e.key === "j" || e.key === "ArrowDown") {
		e.preventDefault()
		move(1)
	} else if (e.key === "k" || e.key === "ArrowUp") {
		e.preventDefault()
		move(-1)
	} else if (e.key === "Enter" && selected && target.tagName !== "A") {
		e.preventDefault()
		goto(selected)
	}
}

// Have the selected post ready, and keep its row on screen. No smooth scroll:
// a held key should move as fast as the key repeats.
$effect(() => {
	if (!selected) return
	preloadData(selected)
	document
		.querySelector('[aria-current="true"]')
		?.scrollIntoView({ block: "nearest" })
})
</script>

<svelte:window onkeydown={handleKeydown} />

<Seo
  title="~/writing"
  description="Product insights, book notes, and learnings"
  path="/writing"
  jsonLd={[
    blogJsonLd(posts),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Writing', path: '/writing' },
    ]),
  ]}
/>

<!-- The header says where you are; the page is what `ls -l` printed there. -->
<div class="mx-auto max-w-3xl px-2.5 pb-16 sm:px-6">
  <h1 class="sr-only">Writing</h1>

  <PostListing {posts} minutes={data.minutes} {selected} feed />

  <p class="mt-5 flex items-center justify-between gap-4 px-1 font-mono text-xs text-muted-foreground">
    <span>total {posts.length}</span>
    <span class="keys hidden items-center gap-1.5">
      <kbd>j</kbd><kbd>k</kbd> move <kbd class="ml-2">↵</kbd> open
    </span>
  </p>
</div>

<style>
  kbd {
    min-width: 1.4rem;
    padding: 0.1rem 0.3rem;
    border: 1px solid hsl(var(--border));
    border-radius: 0.25rem;
    font-family: inherit;
    text-align: center;
  }

  /* Keys are only worth mentioning to someone who has them. */
  @media (hover: hover) and (pointer: fine) {
    .keys {
      display: flex;
    }
  }
</style>
