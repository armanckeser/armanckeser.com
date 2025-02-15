<script lang="ts">
import PostSidebar from "$lib/components/PostSidebar.svelte"
import { cn } from "$lib/utils"
import { Clock } from "lucide-svelte"
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
    <div>
        <div class="h-1 bg-accent/5">
            <div 
                class="h-full bg-accent/30 transition-all duration-100" 
                style="width: {scrollProgress}%"
                aria-hidden="true"
            ></div>
        </div>
        <div class="font-mono text-xs text-muted-foreground px-4 py-1.5 flex items-center gap-2">
            <Clock class="h-3 w-3" />
            <span>READING [{scrollProgress}%]</span>
        </div>
    </div>
</div>

<article 
	class="container justify-around p-4 flex flex-col lg:flex-row gap-8"
>
    <div class="flex-1 max-w-[65ch] lg:max-w-[75ch] xl:max-w-[85ch]">
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
        <div class="prose dark:prose-invert max-w-none prose-lg
            hover:prose-a:text-accent prose-a:transition-colors prose-a:duration-300
            prose-headings:font-heading prose-headings:tracking-tight 
            prose-strong:text-primary prose-strong:font-semibold
            prose-blockquote:border-l-4 prose-blockquote:border-accent/40 prose-blockquote:pl-4 prose-blockquote:bg-gradient-to-b prose-blockquote:from-background/5 prose-blockquote:to-transparent
            prose-lead:text-muted-foreground/80
            prose-code:px-1.5 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:bg-background/10 prose-code:border prose-code:border-accent/20
            prose-pre:rounded-xl prose-pre:border prose-pre:border-accent/20 prose-pre:bg-gradient-to-br prose-pre:from-background prose-pre:to-background/50 prose-pre:shadow-sm prose-pre:backdrop-blur
            prose-ul:space-y-2 prose-ol:space-y-2
            prose-li:pl-4 prose-li:border-l prose-li:border-accent/20 prose-li:bg-gradient-to-r prose-li:from-accent/5
            prose-li:hover:border-accent/40 prose-li:hover:from-accent/10
            prose-h2:text-2xl prose-h2:border-b prose-h2:border-accent/10 prose-h2:pb-2
            prose-h3:text-xl prose-h3:font-semibold
            prose-img:rounded-xl prose-img:border prose-img:border-accent/20 prose-img:bg-background/5">
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
/* Dynamic color hierarchy */
:global(.prose) {
    --base-primary: var(--primary);
    --base-muted: var(--muted-foreground);
}

:global(.prose h1) { 
    color: var(--base-primary);
    font-size: 2.5rem;
    position: relative;
    padding-bottom: 0.5rem;
}

:global(.prose h1::after) {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 3rem;
    height: 2px;
    background: linear-gradient(90deg, var(--accent), transparent);
}

:global(.prose h2) { 
    color: var(--base-primary);
    opacity: 0.9;
    margin-top: 2.5rem;
}

:global(.prose h3) { 
    color: var(--base-primary);
    opacity: 0.8;
}

:global(.prose p) { 
    color: var(--base-muted);
    opacity: 0.85;
    line-height: 1.7;
}

/* Enhanced list architecture */
:global(.prose ul) {
    counter-reset: list-item;
}

:global(.prose li) {
    position: relative;
    padding: 1rem 1.25rem;
    margin: 0.75rem 0;
    border-radius: 6px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-left-width: 3px;
    box-shadow: 1px 1px 0px var(--background)/5;
}

:global(.prose li:hover) {
    transform: translateX(4px);
    box-shadow: 2px 2px 8px var(--accent)/5;
}

:global(.prose li::before) {
    content: '▹';
    position: absolute;
    left: -1.25rem;
    color: var(--accent);
    font-size: 1.1em;
    top: 0.9rem;
}

/* Nested list indentation */
:global(.prose li > ul) {
    margin-left: 1.5rem;
    margin-top: 0.75rem;
}

:global(.prose li > ul li) {
    border-left-style: dashed;
    opacity: 0.9;
}

/* Code block enhancements */
:global(.prose pre) {
    padding: 1.5rem;
    border-width: 1.5px;
}

:global(.prose pre code) {
    background: transparent;
    border: none;
    padding: 0;
    font-size: 0.9em;
}

/* Interactive elements */
:global(.prose a) {
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1.5px solid var(--accent)/30;
    transition: border-color 0.2s ease;
}

:global(.prose a:hover) {
    border-bottom-color: var(--accent);
}
</style>
