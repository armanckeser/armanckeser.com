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
                class="h-full bg-gradient-to-r from-transparent to-accent transition-all duration-1" 
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

        <!-- Updated article content with consolidated Tailwind classes -->
        <div class="prose dark:prose-invert max-w-none prose-lg
            // Base typography
            prose-headings:font-heading prose-headings:tracking-tight
            prose-strong:text-primary prose-strong:font-semibold
            prose-lead:text-muted-foreground/80
            prose-p:leading-relaxed prose-p:opacity-85

            // Links
            hover:prose-a:text-accent prose-a:transition-colors prose-a:duration-300
            [&_a]:border-b-2 [&_a]:border-accent/30 [&_a:hover]:border-accent

            // Headings
            [&_h1]:text-3xl [&_h1]:relative [&_h1]:pb-2 [&_h1]:border-b-0
            [&_h1]:before:content-[''] [&_h1]:before:absolute [&_h1]:before:-bottom-0.5 
            [&_h1]:before:left-0 [&_h1]:before:w-12 [&_h1]:before:h-px 
            [&_h1]:before:bg-gradient-to-r [&_h1]:before:from-accent [&_h1]:before:to-transparent
            prose-h2:text-2xl prose-h2:border-b prose-h2:border-accent/10 prose-h2:pb-2 prose-h2:mt-10 prose-h2:opacity-90
            prose-h3:text-xl prose-h3:font-semibold prose-h3:opacity-80

            // Code blocks
            prose-code:px-1.5 prose-code:py-1 prose-code:rounded prose-code:font-mono 
            prose-code:text-sm prose-code:border prose-code:border-accent/20
            [&_pre]:p-6 [&_pre]:border-2 [&_pre>code]:bg-transparent [&_pre>code]:border-none [&_pre>code]:p-0
            prose-pre:rounded-xl prose-pre:border prose-pre:border-accent/20 
            prose-pre:shadow-sm prose-pre:text-primary prose-pre:bg-background

            // Lists
            

            // Blockquotes
            prose-blockquote:border-l-4 prose-blockquote:border-accent/40 
            prose-blockquote:pl-4 prose-blockquote:bg-gradient-to-b 
            prose-blockquote:from-background/5

            // Images
            prose-img:rounded-xl prose-img:border prose-img:border-accent/20">
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
