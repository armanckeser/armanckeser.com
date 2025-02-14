<script lang="ts">
import { page } from "$app/state"
import PostSidebar from "$lib/components/PostSidebar.svelte"

const errorData = $derived({
	status: page.status,
	message: page.error?.message ?? "Unknown error",
	code: page.status === 404 ? "NOT_FOUND" : (page.error?.code ?? "UNKNOWN"),
	path: page.url.pathname,
})
</script>

<svelte:head>
  <title>{errorData.status} - {errorData.message}</title>
</svelte:head>

<article class="container justify-around p-4 flex flex-col lg:flex-row gap-8">
  <div class="flex-1 max-w-[65ch] lg:max-w-[75ch] xl:max-w-[85ch]">
    <!-- Terminal-style error header -->
    <div class="font-mono border-b border-accent/20 pb-4 mb-8">
      <div class="text-sm text-muted-foreground flex items-center gap-4">
        <span>$ error --code {errorData.status}</span>
      </div>
    </div>

    <!-- Error content -->
    <div class="terminal-block" data-variant="warning">
      <div class="p-6 space-y-4">
        <div
          class="font-mono text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-2"
        >
          <span class="text-muted-foreground">STATUS:</span>
          <span class="text-destructive">{errorData.status}</span>
          <span class="text-muted-foreground">CODE:</span>
          <span class="text-primary">{errorData.code}</span>
          <span class="text-muted-foreground">PATH:</span>
          <span class="text-primary truncate">{errorData.path}</span>
        </div>

        <p
          class="font-mono text-sm text-muted-foreground pt-4 border-t border-accent/10"
        >
          {errorData.status === 404
            ? '// Resource not found in current namespace'
            : '// System encountered unexpected condition'}
        </p>

        <div class="flex gap-4 pt-4">
          <a
            href="/"
            class="font-mono text-sm px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded transition-colors"
          >
            ← RETURN_TO_TERMINAL
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="lg:w-64 sticky top-[7.5rem] h-fit">
    <PostSidebar />
  </div>
</article>

<style>
  .terminal-block[data-variant='warning'] {
    --tw-border-opacity: 0.3;
    border-left-color: hsl(var(--destructive) / var(--tw-border-opacity));
    background-color: hsl(var(--destructive) / 0.03);
  }
</style>
