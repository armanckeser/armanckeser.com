<script lang="ts">
import { base } from "$app/paths"
import { buttondown } from "$lib/config"
</script>

<!-- Under each post: the one place a reader who liked it can ask for the next one. -->
<aside class="mt-10 px-5 sm:px-0" aria-labelledby="follow-along">
  <h2 id="follow-along" class="mb-3 font-mono text-sm font-normal text-muted-foreground">
    <span class="text-accent" aria-hidden="true">❯</span> follow along
  </h2>
  {#if buttondown}
    <form
      action="https://buttondown.com/api/emails/embed-subscribe/{buttondown}"
      method="post"
      class="flex flex-wrap gap-2"
    >
      <input type="hidden" name="embed" value="1" />
      <label class="sr-only" for="follow-email">Email</label>
      <input
        id="follow-email"
        type="email"
        name="email"
        required
        autocomplete="email"
        placeholder="you@example.com"
        class="min-w-0 flex-1 rounded-md border border-border bg-transparent px-3 py-2 font-mono text-sm"
      />
      <button type="submit" class="rounded-md bg-primary px-4 py-2 font-mono text-sm text-primary-foreground">
        email me new posts
      </button>
    </form>
    <p class="mt-2 font-mono text-xs text-muted-foreground">
      One email per post, nothing else. <a href="{base}/privacy#newsletter">Privacy</a>, or use <a href="{base}/rss.xml">RSS</a>.
    </p>
  {:else}
    <p class="font-mono text-sm text-muted-foreground">
      New posts land in the <a href="{base}/rss.xml">RSS feed</a>. <a href="{base}/subscribe">Other ways to follow</a>.
    </p>
  {/if}
</aside>

<style>
  a {
    color: hsl(var(--primary));
    text-decoration: underline;
    text-decoration-color: hsl(var(--border));
    text-underline-offset: 0.3em;
  }
</style>
