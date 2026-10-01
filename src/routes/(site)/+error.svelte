<script lang="ts">
import { page } from "$app/state"
import Seo from "$lib/components/Seo.svelte"

const errorData = $derived({
	status: page.status,
	message: page.error?.message ?? "Unknown error",
	code: page.status === 404 ? "NOT_FOUND" : (page.error?.code ?? "UNKNOWN"),
	path: page.url.pathname,
})
</script>

<Seo
  title="{errorData.status} {errorData.message}"
  description="That page does not exist on armanckeser.com."
  path={errorData.path}
  noindex
/>

<article class="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
  <h1 class="font-mono text-sm font-normal text-muted-foreground">
    <span class="text-blue-600 dark:text-blue-400" aria-hidden="true">❯</span> cat {errorData.path}
  </h1>

  <div class="terminal-block mt-4" data-variant="warning">
    <div class="space-y-4 p-5 sm:p-6">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 font-mono text-sm">
        <span class="text-muted-foreground">STATUS:</span>
        <span class="text-destructive">{errorData.status}</span>
        <span class="text-muted-foreground">CODE:</span>
        <span class="text-primary">{errorData.code}</span>
        <span class="text-muted-foreground">PATH:</span>
        <span class="truncate text-primary">{errorData.path}</span>
      </div>

      <p class="border-t border-accent/10 pt-4 font-mono text-sm text-muted-foreground">
        {errorData.status === 404
          ? 'No such file or directory.'
          : 'Something broke on the way here.'}
      </p>

      <div class="flex flex-wrap gap-3">
        <a href="/" class="way-out">cd ~</a>
        <a href="/writing" class="way-out">cd ~/writing</a>
      </div>
    </div>
  </div>
</article>

<style>
  .terminal-block[data-variant='warning'] {
    --tw-border-opacity: 0.3;
    border-left-color: hsl(var(--destructive) / var(--tw-border-opacity));
    background-color: hsl(var(--destructive) / 0.03);
  }

  .way-out {
    padding: 0.6rem 1rem;
    border-radius: 0.375rem;
    background-color: hsl(var(--accent) / 0.1);
    color: hsl(var(--accent));
    font-family: theme("fontFamily.mono");
    font-size: 0.875rem;
    transition:
      background-color 150ms ease,
      transform 160ms var(--ease-out);
  }

  .way-out:active {
    transform: scale(0.97);
  }

  @media (hover: hover) and (pointer: fine) {
    .way-out:hover {
      background-color: hsl(var(--accent) / 0.2);
    }
  }
</style>
