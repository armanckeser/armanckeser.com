<script lang="ts">
	const { title, description, tag, date, stars } = $props<{
		title: string
		description: string
		tag: string
		date?: string
		stars?: number
	}>()

	let container: HTMLDivElement
	let isHovered = $state(false)
</script>

<div
	bind:this={container}
	role="article"
	class="glass hover:sharp-shadow-md group relative flex h-[180px] w-full flex-col justify-between overflow-hidden rounded-lg border border-border/40 p-5 transition-all duration-300 hover:border-emerald-500/20"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<!-- Header -->
	<div>
		<div class="mb-3 flex items-center gap-3">
			<div
				class="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-xs text-emerald-500"
			>
				{tag}
			</div>
			{#if date}
				<div class="font-mono text-xs text-muted-foreground">
					{date}
				</div>
			{/if}
			{#if stars !== undefined}
				<div
					class="flex items-center gap-1 font-mono text-xs text-muted-foreground"
				>
					<span class="text-emerald-500">★</span>
					<span>{stars}</span>
				</div>
			{/if}
		</div>

		<!-- Content -->
		<h3
			class="mb-2 font-mono text-base font-medium text-primary md:text-lg"
		>
			{title}
		</h3>
		<p class="text-xs leading-relaxed text-muted-foreground md:text-sm">
			{description}
		</p>
	</div>

	<!-- Hover Indicator -->
	<div class="flex items-center justify-end">
		<div
			class="font-mono text-xs text-emerald-500 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
		>
			→
		</div>
	</div>
</div>

<style>
	.glass {
		position: relative;
		background: linear-gradient(
			180deg,
			hsl(var(--background) / 0.3) 0%,
			hsl(var(--background) / 0.2) 100%
		);
		backdrop-filter: blur(8px);
	}

	.glass::before {
		content: "";
		position: absolute;
		inset: 0;
		border-radius: inherit;
		padding: 1px;
		background: linear-gradient(
			180deg,
			hsl(var(--border) / 0.3),
			hsl(var(--border) / 0.1)
		);
		mask:
			linear-gradient(black, black) content-box,
			linear-gradient(black, black);
		mask-composite: exclude;
		pointer-events: none;
	}
</style>
