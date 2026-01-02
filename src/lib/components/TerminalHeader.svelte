<script lang="ts">
/**
 * Terminal-style header component for consistent page headers.
 * Used on blog posts, privacy page, error page, etc.
 */
const { command, title, description, viewId } = $props<{
	command: string
	title?: string
	description?: string
	viewId?: string
}>()
</script>

<div class="font-mono border-b border-accent/20 pb-4 mb-8">
  <div class="text-sm text-muted-foreground flex items-center gap-4">
    <span>$ {command}</span>
  </div>
  {#if title}
    <div class="w-fit" style:view-transition-name={viewId ? `title-${viewId}` : undefined}>
      <h3 class="text-2xl font-mono font-bold text-primary mt-2">
        {title}
      </h3>
    </div>
  {/if}
  {#if description}
    <div class="w-fit" style:view-transition-name={viewId ? `desc-${viewId}` : undefined}>
      <p class="text-muted-foreground mt-2 text-sm">
        {description}
      </p>
    </div>
  {/if}
</div>
