<script lang="ts">
	const { title, subtitle, children } = $props<{
		title: string
		subtitle?: string
		children: any
	}>()

	let scrollContainer: HTMLDivElement
	const scrollAmount = 400

	function scrollLeft() {
		if (scrollContainer) {
			scrollContainer.scrollBy({
				left: -scrollAmount,
				behavior: "smooth",
			})
		}
	}

	function scrollRight() {
		if (scrollContainer) {
			scrollContainer.scrollBy({
				left: scrollAmount,
				behavior: "smooth",
			})
		}
	}
</script>

<section class="relative w-full">
	<!-- Section Header -->
	<div class="mb-6 px-4 md:mb-6 md:px-0">
		<div class="mb-3 flex items-center gap-3">
			<div class="h-px w-12 bg-white/20 md:w-16"></div>
			<h2
				class="font-mono text-xl font-medium tracking-tight text-white md:text-2xl"
			>
				{title}
			</h2>
		</div>
		{#if subtitle}
			<p class="font-mono text-sm text-[#888] md:text-base">
				{subtitle}
			</p>
		{/if}
	</div>

	<!-- Scroll Container -->
	<div class="group relative">
		<!-- Left Scroll Button (Hidden on Mobile) -->
		<button
			onclick={scrollLeft}
			class="hidden md:absolute md:-left-4 md:top-1/2 md:z-10 md:flex md:h-12 md:w-12 md:-translate-y-1/2 md:items-center md:justify-center md:bg-[#1A1A1A] md:text-white md:opacity-0 md:transition-opacity md:duration-300 md:hover:bg-[#2A2A2A] md:group-hover:opacity-100"
			aria-label="Scroll left"
		>
			←
		</button>

		<!-- Cards Container -->
		<div
			bind:this={scrollContainer}
			class="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-4 md:gap-6 md:px-0"
		>
			{@render children()}
		</div>

		<!-- Right Scroll Button (Hidden on Mobile) -->
		<button
			onclick={scrollRight}
			class="hidden md:absolute md:-right-4 md:top-1/2 md:z-10 md:flex md:h-12 md:w-12 md:-translate-y-1/2 md:items-center md:justify-center md:bg-[#1A1A1A] md:text-white md:opacity-0 md:transition-opacity md:duration-300 md:hover:bg-[#2A2A2A] md:group-hover:opacity-100"
			aria-label="Scroll right"
		>
			→
		</button>
	</div>
</section>

<style>
	/* Hide scrollbar but keep functionality */
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>
