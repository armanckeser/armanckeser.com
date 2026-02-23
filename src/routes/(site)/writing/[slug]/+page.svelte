<script lang="ts">
import { page } from "$app/state"
import PostSidebar from "$lib/components/PostSidebar.svelte"
import ScrollTracker from "$lib/components/ScrollTracker.svelte"
import TerminalHeader from "$lib/components/TerminalHeader.svelte"
import { cn, formatDate } from "$lib/utils"
import Giscus from "@giscus/svelte"
import { Clock } from "lucide-svelte"
import { mode } from "mode-watcher"
import { scrollY } from "svelte/reactivity/window"
import type { PageData } from "./$types"

const { data } = $props<{ data: PageData }>()

let scrollProgress = $state<number>(0)

$effect(() => {
	const height = document.documentElement.scrollHeight - window.innerHeight
	if (height > 0) {
		scrollProgress = Math.round(((scrollY.current || 0) / height) * 100)
	}
})

const getTagClasses = (tag: string) => {
	return cn(
		"font-mono text-xs px-1.5 py-0.5 rounded",
		"bg-accent/10 text-accent"
	)
}

const viewId = $derived(`-writing-${page.params.slug}`)
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
    <style>
        /* Anchor link styles */
        .anchor-link {
            opacity: 0;
            color: var(--color-accent);
            margin-left: 0.25rem;
            font-size: 0.75em;
            text-decoration: none;
            transition: opacity 0.2s ease;
            cursor: pointer;
        }
        
        h1:hover .anchor-link,
        h2:hover .anchor-link,
        h3:hover .anchor-link,
        h4:hover .anchor-link,
        h5:hover .anchor-link,
        h6:hover .anchor-link {
            opacity: 1;
        }
    </style>
</svelte:head>

<!-- Include scroll tracker for section detection -->
<ScrollTracker />

<!-- Reading progress bar -->
<div class="sticky top-14 z-10 bg-background/80 backdrop-blur border-b border-accent/10">
    <!-- Progress bar spans full width -->
    <div class="h-1 bg-accent/5">
        <div 
            class="h-full bg-gradient-to-r from-transparent to-accent transition-all duration-1" 
            style="width: {scrollProgress}%"
            aria-hidden="true"
        ></div>
    </div>
    <!-- Content stays in container -->
    <div class="container mx-auto px-4 sm:px-8">
        <div class="font-mono text-xs text-muted-foreground py-1.5 flex items-center gap-2" role="status" aria-live="polite">
            <Clock class="h-3 w-3" aria-hidden="true" />
            <span>READING [<span class="tabular-nums">{scrollProgress}</span>%]</span>
        </div>
    </div>
</div>

<article class="container mx-auto px-4 py-8 md:px-8 md:py-16">
    <div class="max-w-[85rem] mx-auto flex flex-col lg:flex-row gap-8">
        <div class="flex-1 max-w-[65ch] lg:max-w-[75ch] xl:max-w-[85ch]">
            <TerminalHeader
                command="cat {page.params.slug}.md"
                title={data.meta.title}
                description={data.meta.description}
                viewId={viewId}
            />

            <div class="prose-blog">
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
            <Giscus
            id="comments"
            term="comments"
            repo="armanckeser/armanckeser.com"
            repoId="R_kgDOMS8yoA"
            category="General"
            categoryId="DIC_kwDOMS8yoM4CpgZA"
            mapping="pathname"
            strict="0"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="bottom"
            theme={mode.current === "dark" ? "noborder_dark" : "noborder_light"}
            lang="en"
            loading="lazy">
            </Giscus>
        </div>
        <div class="lg:w-64 sticky top-[7.5rem] h-fit">
            <PostSidebar />
        </div>
    </div>
</article>
