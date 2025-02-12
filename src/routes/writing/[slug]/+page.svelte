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
	class="px-4 py-12 sm:py-16 flex flex-col lg:flex-row gap-4 justify-between"
>
    <div class="prose max-w-[100ch] prose-lg prose-invert prose-slate
        hover:prose-a:text-accent prose-a:transition-colors prose-a:duration-300
        prose-pre:bg-background/50 prose-pre:border prose-pre:border-accent/20
        prose-headings:text-primary prose-headings:font-mono
        prose-code:text-accent prose-code:font-mono
        prose-strong:text-primary prose-strong:font-normal
        prose-blockquote:border-accent/40 prose-blockquote:text-accent/80 flex-1">
        <data.content />
    </div>

    <div 
        role="complementary"
        class="md:w-[19rem]"
    >
        <PostSidebar />
    </div>
</article>
