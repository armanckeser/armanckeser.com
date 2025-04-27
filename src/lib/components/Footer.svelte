<script lang="ts">
import { base } from "$app/paths"
</script>

<footer class="border-t border-accent/10 py-6 font-mono text-sm">
  <div class="container mx-auto px-4 md:px-8">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <!-- Left: copyright -->
      <div class="text-muted-foreground">
        <span class="text-highlight">©</span> {new Date().getFullYear()} Armanc Keser
      </div>
      
      <!-- Right: links -->
      <div class="flex gap-6">
        <a 
          href="{base}/privacy" 
          class="text-primary border-b border-zinc-200 dark:border-zinc-800 hover:text-accent transition-colors"
        >
          privacy
        </a>
        <a 
          href="{base}/terms" 
          class="text-primary border-b border-zinc-200 dark:border-zinc-800 hover:text-accent transition-colors"
        >
          terms
        </a>
        <a
          href="https://github.com/armanckeser"
          class="text-primary border-b border-zinc-200 dark:border-zinc-800 hover:text-accent transition-colors"
          target="_blank"
          rel="noopener"
        >
          github
        </a>
      </div>
    </div>
  </div>
</footer> 