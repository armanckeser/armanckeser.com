<script lang="ts">
	import Card from "$lib/components/Card.svelte"
	import ContentSection from "$lib/components/ContentSection.svelte"

	// Sample data - we can move this to a separate store or API later
	const blogPosts = [
		{
			title: "Svelte 5 Runes Deep Dive",
			description:
				"Performance implications and internal workings of the new reactivity system",
			tag: "tech",
			date: "2024-03",
		},
		{
			title: "Building Efficient CLIs",
			description:
				"Architecture patterns for scalable command-line applications",
			tag: "eng",
			date: "2024-02",
		},
		{
			title: "TypeScript Type System",
			description:
				"Advanced type manipulation techniques and performance considerations",
			tag: "tech",
			date: "2024-01",
		},
	]

	const projects = [
		{
			title: "dev-toolkit",
			description: "CLI utilities for accelerating development workflows",
			tag: "cli",
			stars: 142,
		},
		{
			title: "ts-codegen",
			description: "Type-safe code generation from OpenAPI specs",
			tag: "lib",
			stars: 89,
		},
		{
			title: "perf-analyzer",
			description:
				"Runtime performance analysis for Node.js applications",
			tag: "tool",
			stars: 234,
		},
	]
</script>

<svelte:head>
	<title>Armanc Keser</title>
</svelte:head>

<main class="min-h-screen bg-[#0A0A0B] px-4 py-8 md:px-8 md:py-16 lg:px-16">
	<div class="mx-auto max-w-[1200px] space-y-8 md:space-y-16">
		<!-- Hero Section -->
		<header class="mb-8 md:mb-12">
			<div class="mb-2 font-mono text-sm text-[#4D4D4D] md:text-base">
				~/armanckeser
			</div>
			<h1
				class="mb-4 font-heading text-4xl font-bold tracking-tight text-white/90 md:text-6xl lg:text-7xl"
			>
				Armanc Keser<span class="text-[#00FF9D]">_</span>
			</h1>
			<p class="font-mono text-base text-[#4D4D4D] md:text-lg">
				$ Engineering efficient solutions through code
			</p>
		</header>

		<!-- Blog Posts Section -->
		<ContentSection
			title="~/writing"
			subtitle="Technical deep-dives and engineering notes"
		>
			{#each blogPosts as post}
				<Card {...post} />
			{/each}
		</ContentSection>

		<!-- Projects Section -->
		<ContentSection
			title="~/projects"
			subtitle="Open-source tools and libraries"
		>
			{#each projects as project}
				<Card {...project} />
			{/each}
		</ContentSection>
	</div>
</main>

<style>
	:global(body) {
		background-color: #0a0a0b;
	}
</style>
