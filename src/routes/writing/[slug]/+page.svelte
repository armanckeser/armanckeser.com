<script lang="ts">
import PostSidebar from "$lib/components/PostSidebar.svelte"
import { Clock, GitBranch } from "lucide-svelte"
import { cn } from "$lib/utils"
import { scrollY } from "svelte/reactivity/window"
import type { PageData } from "./$types"

const { data } = $props<{ data: PageData }>()

// Reading progress state
let scrollProgress = $state<number>(0)

// Calculate reading progress using window scrollY
$effect(() => {
	const height = document.documentElement.scrollHeight - window.innerHeight
	if (height > 0) {
		scrollProgress = Math.round(((scrollY.current || 0) / height) * 100)
	}
})

// Format date for terminal display
const formatDate = (date: string) => {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	})
}

// Get tag classes based on tag name
const getTagClasses = (tag: string) => {
	return cn(
		"font-mono text-xs px-1.5 py-0.5 rounded",
		"bg-accent/10 text-accent"
	)
}
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

<!-- Reading progress bar -->
<div class="sticky top-14 z-10 bg-background/80 backdrop-blur border-b border-accent/10">
    <div class="container px-4">
        <div class="h-1 bg-accent/5">
            <div 
                class="h-full bg-accent/30 transition-all duration-100" 
                style="width: {scrollProgress}%"
                aria-hidden="true"
            ></div>
        </div>
        <div class="font-mono text-xs text-muted-foreground py-1.5 flex items-center gap-2">
            <Clock class="h-3 w-3" />
            <span>READING [{scrollProgress}%]</span>
        </div>
    </div>
</div>

<article 
	class="container px-4 py-12 sm:py-16 flex flex-col lg:flex-row gap-8 justify-between"
>
    <div class="flex-1 max-w-[100ch]">
        <!-- Terminal-style header -->
        <div class="font-mono border-b border-accent/20 pb-4 mb-8">
            <div class="text-sm text-muted-foreground flex items-center gap-4">
                <span>$ cat {data.meta.title}.md</span>
            </div>
            {#if data.meta.description}
                <p class="text-muted-foreground mt-2 font-mono text-sm">
                    // {data.meta.description}
                </p>
            {/if}
        </div>

        <!-- Article content with enhanced terminal styling -->
        <div class="prose max-w-none prose-lg prose-invert 
            hover:prose-a:text-accent prose-a:transition-colors prose-a:duration-300
            prose-pre:bg-background/50 prose-pre:border prose-pre:border-accent/20
            prose-headings:text-primary prose-headings:font-mono prose-headings:before:content-['#_']
            prose-code:text-accent prose-code:font-mono
            prose-strong:text-primary prose-strong:font-normal
            prose-blockquote:border-l-4 prose-blockquote:border-accent/40 prose-blockquote:text-accent/80
            prose-blockquote:pl-4 prose-blockquote:italic
            prose-li:text-primary">
            <data.content />
        </div>

        <!-- Terminal-style metadata footer -->
        <div class="font-mono text-sm border-t border-accent/20 pt-4 mt-8">
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <span class="text-muted-foreground">LAST_MODIFIED:</span>
                <span>{formatDate(data.meta.date)}</span>
                {#if data.meta.tags}
                    <span class="text-muted-foreground">TAGS:</span>
                    <div class="flex flex-wrap gap-2">
                        {#each data.meta.tags as tag}
                            <span class={getTagClasses(tag)}>
                                #{tag}
                            </span>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <div class="lg:w-64 sticky top-[7.5rem] h-fit">
        <PostSidebar />
    </div>
</article>

<style>
/* Terminal-style link underlines */
:global(.prose a) {
    background-image: linear-gradient(var(--accent), var(--accent));
    background-size: 0% 1px;
    background-position: 0% 100%;
    background-repeat: no-repeat;
    transition: background-size 0.3s ease;
}

:global(.prose a:hover) {
    background-size: 100% 1px;
}
</style>
