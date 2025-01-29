<script lang="ts">
	import Card from "$lib/components/Card.svelte"
	import ContentSection from "$lib/components/ContentSection.svelte"
	import type { PageData } from "./$types"

	const props = $props<{ data: PageData }>()
	const posts = $derived(props.data.posts)

	const projects = [
		{
			title: "YouTube History",
			description: "Analyze and visualize your YouTube watching patterns",
			tag: "app",
			stars: 156,
		},
		{
			title: "Easy Hang",
			description:
				"Never mess up measurements when hanging pictures again",
			tag: "app",
			stars: 92,
		},
		{
			title: "Reading List",
			description: "Track and share your reading journey with notes",
			tag: "app",
			stars: 178,
		},
	]
</script>

<svelte:head>
	<title>Armanc Keser</title>
	<meta
		name="description"
		content="Engineer learning the skills for the next steps"
	/>
</svelte:head>

<main
	class="relative min-h-screen bg-background px-4 py-8 md:px-8 md:py-16 lg:px-16"
>
	<!-- Background subtle gradient -->
	<div class="pointer-events-none fixed inset-0 z-0">
		<div
			class="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--background)_100%)]"
		></div>
	</div>

	<div class="relative z-10 mx-auto max-w-[1200px] space-y-24">
		<!-- Hero Section -->
		<header class="animate-fade-in space-y-8">
			<div class="group flex items-center space-x-2">
				<div class="glass h-6 w-6 rounded-full p-1">
					<div
						class="h-full w-full rounded-full bg-emerald-500"
					></div>
				</div>
				<div
					class="font-mono text-sm text-muted-foreground transition-colors group-hover:text-primary md:text-base"
				>
					~/armanckeser
				</div>
			</div>

			<div class="space-y-4">
				<h1
					class="animate-slide-in font-mono text-4xl font-bold tracking-tight text-primary md:text-6xl lg:text-7xl"
				>
					Armanc Keser<span class="animate-pulse text-emerald-500"
						>_</span
					>
				</h1>

				<p
					class="max-w-2xl font-mono text-base text-muted-foreground md:text-lg"
				>
					<code class="text-primary">
						<span class="text-emerald-500">const</span> state =
						<span class="text-yellow-500">'learning'</span>
					</code>
				</p>
			</div>

			<!-- Quick links -->
			<div class="flex flex-wrap gap-4">
				<a
					href="https://github.com/armanckeser"
					class="glass hover:sharp-shadow-md group flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:border-emerald-500/20"
				>
					<span class="font-mono text-sm text-primary">github</span>
					<span
						class="font-mono text-xs text-muted-foreground transition-colors group-hover:text-emerald-500"
						>↗</span
					>
				</a>
			</div>
		</header>

		<!-- Blog Posts Section -->
		<ContentSection title="~/writing" subtitle="Insights, learnings, thoughts">
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each posts as post, i}
					<div
						class="animate-slide-in"
						style="animation-delay: {i * 100}ms"
					>
						<Card
							title={post.title}
							description={post.description}
							date={post.date}
							href={post.slug}
						/>
					</div>
				{/each}
			</div>
		</ContentSection>

		<!-- Projects Section -->
		<ContentSection title="~/projects" subtitle="Apps and tools I've built">
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each projects as project, i}
					<div
						class="animate-slide-in"
						style="animation-delay: {i * 100}ms"
					>
						<Card {...project} />
					</div>
				{/each}
			</div>
		</ContentSection>
	</div>
</main>

<style lang="postcss">
	:global(body) {
		@apply bg-background;
	}
</style>
