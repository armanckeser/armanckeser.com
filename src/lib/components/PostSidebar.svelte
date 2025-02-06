<script lang="ts">
import { page } from "$app/state"
import { getPosts } from "$lib/utils/posts"
import type { BlogPost } from "../../types"

const props = $props<{
	currentSlug?: string
}>()

let posts = $state<BlogPost[]>([])

$effect(() => {
	posts = getPosts()
})

const formatDate = (date: string) =>
	new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	})
</script>

<aside
  class="space-y-4 lg:border-l lg:border-border/40 dark:lg:border-border/30 lg:pl-8"
>
  <h3
    class="mb-4 font-mono text-sm text-muted-foreground dark:text-muted-foreground"
  >
    More posts
  </h3>

  {#each posts as post}
    {#if post.slug !== page.url.pathname}
      <a
        href={post.slug}
        class="group flex items-center justify-between py-2 text-primary dark:text-primary transition-colors hover:text-accent dark:hover:text-accent"
      >
        <span class="truncate text-sm">{post.title}</span>
        {#if post.date}
          <span
            class="ml-4 text-xs text-muted-foreground dark:text-muted-foreground group-hover:text-accent dark:group-hover:text-accent"
          >
            {formatDate(post.date)}
          </span>
        {/if}
      </a>
    {/if}
  {/each}
</aside>
