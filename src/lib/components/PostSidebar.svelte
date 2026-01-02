<script lang="ts">
import { page } from "$app/state"
import { getPosts } from "$lib/posts"
import { formatDateShort } from "$lib/utils"
import type { BlogPost } from "../../types"

const normalizePath = (path: string) => {
	let normalized = path.replace(/\.+/g, "")
	normalized = normalized.split(/[#?]/)[0]
	return normalized.replace(/\.+/g, "")
}

let posts = $state<BlogPost[]>([])

$effect(() => {
	posts = getPosts().filter(
		post => normalizePath(post.slug) !== normalizePath(page.url.pathname)
	)
})
</script>

{#if posts.length > 0}
<aside
  class="space-y-4 lg:border-l lg:border-border/40 dark:lg:border-border/30 lg:pl-8"
>
  <h3
    class="mb-4 font-mono text-sm text-muted-foreground dark:text-muted-foreground"
  >
    More posts
  </h3>

  {#each posts as post}
      <a
        href={post.slug}
        class="group flex items-center justify-between py-2 text-primary dark:text-primary transition-colors hover:text-accent dark:hover:text-accent"
      >
        <span class="truncate font-mono text-sm">{post.title}</span>
        {#if post.date}
          <span
            class="ml-4 font-mono text-xs text-muted-foreground dark:text-muted-foreground group-hover:text-accent dark:group-hover:text-accent"
          >
            {formatDateShort(post.date)}
          </span>
        {/if}
      </a>
  {/each}
 </aside>
{/if}
