<script lang="ts">
import PostSidebar from "$lib/components/PostSidebar.svelte"
import type { PageData } from "./$types"

const { data } = $props<{ data: PageData }>()

// Enhanced date format
const formattedDate = $derived(
	data.meta.date
		? new Date(data.meta.date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				timeZoneName: "short",
			})
		: null
)
</script>

<svelte:head>
	<title
		>{data.meta.title
			? `${data.meta.title} - Armanc Keser`
			: 'Blog - Armanc Keser'}</title
	>
	{#if data.meta.description}
		<meta name="description" content={data.meta.description} />
	{/if}
	<link rel="canonical" href={data.meta.slug} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:url" content={data.meta.slug} />
	<meta property="og:site_name" content="Armanc Keser" />
	<meta property="article:published_time" content={data.meta.date} />
	<meta property="article:author" content="Armanc Keser" />
</svelte:head>

<article 
	class="relative px-4 sm:mx-auto max-w-3xl py-12 sm:py-16"
>
	<header class="mb-12 space-y-6 border-b border-border/40 pb-8">
		<div class="flex items-baseline gap-3 font-mono text-accent">
			<span class="text-lg">$</span>
			<h1 class="text-4xl font-bold tracking-tight text-primary">
				{data.meta.title}
			</h1>
		</div>

		<div class="flex flex-wrap gap-4 text-muted-foreground">
			{#if formattedDate}
				<div class="flex items-center gap-2">
					<span class="h-px w-8 bg-accent/20"></span>
					<time datetime={data.meta.date} class="text-sm">
						{formattedDate}
					</time>
				</div>
			{/if}
			
			{#if data.meta.description}
				<div class="flex items-center gap-2">
					<span class="h-px w-8 bg-accent/20"></span>
					<p class="text-sm italic">
						{data.meta.description}
					</p>
				</div>
			{/if}
		</div>
	</header>


	<div class="prose prose-lg dark:prose-invert hover:prose-a:text-accent prose-a:transition-colors prose-a:duration-300 prose-a:ease-[cubic-bezier(0.25,0.1,0.25,1.5)]">
		<data.content />
	</div>

	<div 
		class="fixed right-[max(0px,calc(50%-45rem))] top-[3.8125rem] hidden w-[19rem] xl:block"
		role="complementary"
	>
		<PostSidebar currentSlug={data.meta.slug} />
	</div>
</article>
