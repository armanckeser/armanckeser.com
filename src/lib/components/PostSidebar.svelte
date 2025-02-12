<script lang="ts">
import { getPosts } from "$lib/posts"
import { page } from "$app/state"

const posts = getPosts()

const formatDate = (date: string) =>
	new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	})

// Helper function to normalize paths by removing extra dots, hashes, and query params
const normalizePath = (path: string) => {
	// Remove any trailing dots
	let normalized = path.replace(/\.+/g, "")
	// Remove hash and query parameters
	normalized = normalized.split(/[#?]/)[0]
	// Remove any remaining consecutive dots
	return normalized.replace(/\.+/g, "")
}
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
    {#if normalizePath(post.slug) !== normalizePath(page.url.pathname)}
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
