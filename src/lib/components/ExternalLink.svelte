<script lang="ts">
const { href, label } = $props<{
	href: string
	label: string
}>()
</script>

<a {href} class="link glass flex items-center gap-2 rounded-lg px-4 py-2.5" target="_blank" rel="noopener">
  <span class="font-mono text-sm text-primary">{label}</span>
  <span class="arrow font-mono text-xs text-muted-foreground" aria-hidden="true">↗</span>
</a>

<style>
  .link {
    transition:
      transform 160ms var(--ease-out),
      border-color 150ms ease;
  }

  .arrow {
    transition:
      transform 200ms var(--ease-out),
      color 150ms ease;
  }

  .link:active {
    transform: scale(0.97);
  }

  @media (hover: hover) and (pointer: fine) {
    .link:hover {
      border-color: hsl(var(--accent) / 0.3);
    }

    .link:hover .arrow {
      color: hsl(var(--accent));
      transform: translate(2px, -2px);
    }
  }
</style>
