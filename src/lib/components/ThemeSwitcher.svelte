<script lang="ts">
  import { toggleMode, mode } from 'mode-watcher';
</script>

<button
  onclick={toggleMode}
  class="group flex cursor-pointer items-center gap-2 font-mono text-sm text-muted-foreground dark:text-muted-foreground transition-colors hover:text-primary dark:hover:text-primary"
>
  <span class="text-xs text-emerald-500 dark:text-emerald-500">$</span>
  <span class="animate-fade-in"
    >v1.0.0-{$mode === 'dark' ? 'nightly' : 'stable'}</span
  >
  <span class="text-xs opacity-0 transition-opacity group-hover:opacity-100">
    // Click to toggle
  </span>
</button>
