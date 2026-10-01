<script lang="ts">
import { base } from "$app/paths"
</script>

<footer class="border-t border-accent/10 py-6 font-mono text-sm">
  <div class="container mx-auto px-4 md:px-8">
    <div class="flex flex-col items-center justify-between gap-2 sm:flex-row sm:gap-4">
      <div class="text-muted-foreground">
        <span class="text-highlight">©</span> {new Date().getFullYear()} Armanc Keser
      </div>

      <nav class="flex" aria-label="Site">
        <a href="{base}/rss.xml">rss</a>
        <a href="{base}/privacy">privacy</a>
        <a href="{base}/terms">terms</a>
        <a href="https://github.com/armanckeser" target="_blank" rel="noopener">github</a>
      </nav>
    </div>
  </div>
</footer>

<style>
  /* Padded out to a thumb-sized target; the underline stays on the word. */
  a {
    padding: 0.75rem;
    color: hsl(var(--primary));
    text-decoration: underline;
    text-decoration-color: hsl(var(--border));
    text-underline-offset: 0.3em;
    transition:
      color 150ms ease,
      text-decoration-color 150ms ease;
  }

  a:active {
    color: hsl(var(--accent));
  }

  @media (hover: hover) and (pointer: fine) {
    a:hover {
      color: hsl(var(--accent));
      text-decoration-color: hsl(var(--accent) / 0.5);
    }
  }
</style>
