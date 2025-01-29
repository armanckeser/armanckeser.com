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
	<div class="mb-12 px-8">
		<div class="mb-8 flex items-center gap-4">
			<div class="h-px w-12 bg-white/20"></div>
			<h2 class="text-2xl font-bold tracking-widest text-white">
				{title}
			</h2>
		</div>
		{#if subtitle}
			<p class="text-lg font-light text-gray-400">{subtitle}</p>
		{/if}
	</div>

	<!-- Scroll Container -->
	<div class="group relative">
		<!-- Left Scroll Button -->
		<button
			onclick={scrollLeft}
			class="absolute -left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-[#1A1A1A] text-white opacity-0 transition-opacity duration-300 hover:bg-[#FF3E3E] group-hover:opacity-100"
			aria-label="Scroll left"
		>
			←
		</button>

		<!-- Cards Container -->
		<div
			bind:this={scrollContainer}
			class="scrollbar-hide flex gap-6 overflow-x-auto px-8 pb-4"
		>
			{@render children()}
		</div>

		<!-- Right Scroll Button -->
		<button
			onclick={scrollRight}
			class="absolute -right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-[#1A1A1A] text-white opacity-0 transition-opacity duration-300 hover:bg-[#FF3E3E] group-hover:opacity-100"
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
