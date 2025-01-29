<script lang="ts">
	import type { PageData } from "./$types"
	import { page } from "$app/state"
	import Card from "$lib/components/Card.svelte"
	import Breadcrumbs from "$lib/components/Breadcrumbs.svelte"

	const props = $props<{ data: PageData }>()
	const posts = $derived(props.data.posts)
	const isPostPage = $derived(page.url.pathname !== "/blog")
</script>

<svelte:head>
	<title>Blog - Armanc Keser</title>
	<meta
		name="description"
		content="Product insights, book notes, and learnings"
	/>
</svelte:head>

<div class="min-h-screen bg-background">
	<nav
		class="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur"
	>
		<div class="mx-auto flex max-w-3xl items-center px-4 py-4">
			<Breadcrumbs path={page.url.pathname} {isPostPage} />
		</div>
	</nav>

	<div class="relative mx-auto max-w-7xl px-4">
		<article class="mx-auto max-w-3xl py-16">
			<header class="mb-12">
				<p class="mt-4 text-xl text-muted-foreground">
					Product insights, book notes, and learnings
				</p>
			</header>

			<div class="grid gap-4 sm:grid-cols-2">
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
		</article>
	</div>
</div>
