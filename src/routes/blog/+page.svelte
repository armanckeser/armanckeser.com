<script lang="ts">
	import type { PageData } from "./$types"
	import Card from "$lib/components/Card.svelte"

	const props = $props<{ data: PageData }>()
	const posts = $derived(props.data.posts)
</script>

<svelte:head>
	<title>Blog - Armanc Keser</title>
	<meta
		name="description"
		content="Product insights, book notes, and learnings"
	/>
</svelte:head>

<main class="mx-auto max-w-[1200px] px-4 py-16">
	<header class="mb-16">
		<h1 class="mb-4 font-mono text-4xl font-bold">~/writing</h1>
		<p class="text-muted-foreground">
			Product insights, book notes, and learnings
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each posts as post, i}
			<div class="animate-slide-in" style="animation-delay: {i * 100}ms">
				<Card
					title={post.title}
					description={post.description}
					date={post.date}
					href={post.slug}
				/>
			</div>
		{/each}
	</div>
</main>
