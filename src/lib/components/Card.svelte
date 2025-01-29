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
	class="card-container relative h-[140px] w-[85vw] min-w-0 flex-shrink-0 cursor-pointer overflow-hidden border border-[#1A1A1A] bg-[#0F0F10] p-4 font-mono transition-all duration-300 hover:border-[#2A2A2A] md:h-[160px] md:w-[360px]"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<!-- Header -->
	<div class="mb-2 flex items-center justify-between">
		<div class="flex items-center gap-2 md:gap-3">
			<div class="text-xs text-[#00FF9D]">{tag}</div>
			{#if date}
				<div class="text-xs text-[#4D4D4D]">{date}</div>
			{/if}
			{#if stars !== undefined}
				<div class="flex items-center gap-1 text-xs text-[#4D4D4D]">
					<span>★</span>
					<span>{stars}</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Content -->
	<h3 class="mb-2 font-sans text-base font-medium text-white/90 md:text-lg">
		{title}
	</h3>
	<p class="text-xs leading-relaxed text-[#888888] md:text-sm">
		{description}
	</p>

	<!-- Hover Indicator -->
	<div
		class="absolute bottom-3 right-4 text-xs text-[#00FF9D] opacity-0 transition-opacity duration-300"
		class:opacity-100={isHovered}
	>
		→
	</div>
</div>

<style>
	.card-container {
		transform-style: preserve-3d;
		backface-visibility: hidden;
	}
</style>
