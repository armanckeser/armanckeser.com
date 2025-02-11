<script lang="ts">
import CompactCard from "$lib/components/CompactCard.svelte"
import type { BlogPost } from "../../types"
import type { PageData } from "./$types"

const props = $props<{ data: PageData }>()
const posts: BlogPost[] = $derived(props.data.posts)

let selectedPost = $state<string | null>(null)
let hoveredPost = $state<string | null>(null)

function handlePostClick(slug: string) {
	window.location.href = slug
}

function handlePostHover(slug: string | null) {
	hoveredPost = slug
}

$effect(() => {
	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === "j" || e.key === "ArrowDown") {
			e.preventDefault()
			const currentIndex = selectedPost
				? posts.findIndex(p => p.slug === selectedPost)
				: -1
			const nextIndex =
				currentIndex < posts.length - 1 ? currentIndex + 1 : 0
			selectedPost = posts[nextIndex].slug
		} else if (e.key === "k" || e.key === "ArrowUp") {
			e.preventDefault()
			const currentIndex = selectedPost
				? posts.findIndex(p => p.slug === selectedPost)
				: 0
			const prevIndex =
				currentIndex > 0 ? currentIndex - 1 : posts.length - 1
			selectedPost = posts[prevIndex].slug
		} else if (e.key === "Enter" && selectedPost) {
			e.preventDefault()
			window.location.href = selectedPost
		}
	}

	window.addEventListener("keydown", handleKeydown)
	return () => window.removeEventListener("keydown", handleKeydown)
})

// Scroll selected post into view when it changes
$effect(() => {
	if (selectedPost) {
		const article = document.querySelector(`div[aria-expanded="true"]`)
		article?.scrollIntoView({
			behavior: "smooth",
			block: "center",
		})
	}
})
</script>

<svelte:head>
  <title>~/writing - Armanc Keser</title>
  <meta
    name="description"
    content="Product insights, book notes, and learnings"
  />
</svelte:head>

<div class="relative mx-auto max-w-3xl px-2 sm:px-4 py-12 sm:py-16">
  <header class="mb-8 space-y-4">
    <div class="flex items-center gap-2 font-mono text-lg text-muted-foreground">
      <span>$</span>
      <span class="text-primary">~/writing</span>
      <span class="animate-pulse text-accent">▋</span>
    </div>
    <p class="font-mono text-base text-muted-foreground">
      Product insights, book notes, and learnings. <br>Use <kbd class="px-1.5 py-0.5 text-xs bg-accent/10 rounded">j</kbd>/<kbd class="px-1.5 py-0.5 text-xs bg-accent/10 rounded">k</kbd> or <kbd class="px-1.5 py-0.5 text-xs bg-accent/10 rounded">↑</kbd>/<kbd class="px-1.5 py-0.5 text-xs bg-accent/10 rounded">↓</kbd> to navigate, <kbd class="px-1.5 py-0.5 text-xs bg-accent/10 rounded">Enter</kbd> to read.
    </p>
  </header>

  <div class="space-y-px">
    {#each posts as post (post.slug)}
      <CompactCard
        title={post.title}
        date={post.date}
        description={post.description ?? ''}
        isSelected={selectedPost === post.slug || hoveredPost === post.slug}
        href={post.slug}
        onclick={() => handlePostClick(post.slug)}
        onmouseenter={() => handlePostHover(post.slug)}
        onmouseleave={() => handlePostHover(null)}
      />
    {/each}
  </div>
</div>
