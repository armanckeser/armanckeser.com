<script lang="ts">
import { ACTORS, type Actor } from "$lib/studio/types"

type Props = { actor: Actor; size?: number; dim?: boolean; ring?: boolean }
const { actor, size = 24, dim = false, ring = false }: Props = $props()
</script>

<span
	class="studio-avatar"
	class:opacity-40={dim}
	class:studio-avatar-ring={ring}
	style="--size:{size}px; --tone:{ACTORS[actor].color}"
	title={ACTORS[actor].name}
	aria-label={ACTORS[actor].name}
>
	{#if actor === "claude"}
		<svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} aria-hidden="true">
			<path
				fill="currentColor"
				d="M12 2.5l1.6 6.1 5.6-3-3 5.6 6.1 1.6-6.1 1.6 3 5.6-5.6-3-1.6 6.1-1.6-6.1-5.6 3 3-5.6-6.1-1.6 6.1-1.6-3-5.6 5.6 3z"
			/>
		</svg>
	{:else}
		{ACTORS[actor].name[0]}
	{/if}
</span>

<style>
	.studio-avatar {
		display: inline-grid;
		place-items: center;
		flex-shrink: 0;
		width: var(--size);
		height: var(--size);
		border-radius: 999px;
		background: var(--tone);
		color: white;
		font-size: calc(var(--size) * 0.46);
		font-weight: 600;
		line-height: 1;
		user-select: none;
		transition: opacity 200ms ease;
	}
	.studio-avatar-ring {
		box-shadow: 0 0 0 2px hsl(var(--background));
	}
</style>
