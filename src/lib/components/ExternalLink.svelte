<script lang="ts">
const { href, label, icon } = $props<{
	href: string
	label: string
	icon?: string
}>()
</script>

<a
  {href}
  class="glass hover:sharp-shadow-md group flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:border-accent/20"
  target="_blank"
  rel="noopener"
>
  {#if icon}
    <span class="font-mono text-sm text-primary">{icon}</span>
  {/if}
  <span class="font-mono text-sm text-primary">{label}</span>
  <span
    class="font-mono text-xs text-muted-foreground transition-colors group-hover:text-accent"
    >↗</span
  >
</a> 