<script lang="ts">
import PostListing from "$lib/components/PostListing.svelte"
import PostSheet from "$lib/components/PostSheet.svelte"
import ScrollTracker from "$lib/components/ScrollTracker.svelte"
import Seo from "$lib/components/Seo.svelte"
import { getPosts } from "$lib/posts"
import { blogPostingJsonLd, breadcrumbJsonLd } from "$lib/seo"
import Giscus from "@giscus/svelte"
import { mode } from "mode-watcher"
import type { PageData } from "./$types"

const { data } = $props<{ data: PageData }>()

const file = $derived(data.meta.slug.split("/").pop() ?? "")

// What to read next: the newest posts that are not this one.
const others = $derived(
	getPosts()
		.filter(post => post.slug !== data.meta.slug)
		.slice(0, 3)
)

const structuredData = $derived([
	blogPostingJsonLd(data.meta),
	breadcrumbJsonLd([
		{ name: "Home", path: "/" },
		{ name: "Writing", path: "/writing" },
		{ name: data.meta.title, path: data.meta.slug },
	]),
])
</script>

<Seo
	title={data.meta.title}
	description={data.meta.description}
	path={data.meta.slug}
	type="article"
	publishedTime={data.meta.date}
	tags={data.meta.tags}
	jsonLd={structuredData}
/>

<!-- Include scroll tracker for section detection -->
<ScrollTracker />

<!-- How far through the page you are, drawn along the header's bottom edge. -->
<div class="progress" aria-hidden="true"></div>

<div class="column mx-auto max-w-[46rem] pb-16 sm:px-6">
	<PostSheet
		title={data.meta.title}
		description={data.meta.description}
		date={data.meta.date}
		minutes={data.minutes[file]}
	>
		<data.content />
	</PostSheet>

	<div class="mt-10 px-5 sm:px-0">
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
			loading="lazy"
		></Giscus>
	</div>

	{#if others.length}
		<aside class="mt-12 px-3 sm:px-0" aria-labelledby="more-writing">
			<h2 id="more-writing" class="mb-3 px-1 font-mono text-sm font-normal text-muted-foreground sm:px-0">
				<span class="text-accent" aria-hidden="true">❯</span> ls -t ~/writing | head -{others.length}
			</h2>
			<PostListing posts={others} minutes={data.minutes} more={{ href: "/writing", label: "cd ~/writing" }} />
		</aside>
	{/if}
</div>

<style>
	/* Anchor links beside headings: there for a pointer, out of the way otherwise. */
	:global(.anchor-link) {
		margin-left: 0.25rem;
		color: hsl(var(--accent));
		font-size: 0.75em;
		text-decoration: none;
		opacity: 0;
		transition: opacity 150ms ease;
	}

	@media (hover: hover) and (pointer: fine) {
		:global(:is(h1, h2, h3, h4):hover .anchor-link) {
			opacity: 1;
		}
	}

	.progress {
		display: none;
	}

	/* A post with a laptop beside its text (see Story.svelte) is set as a
	   spread: a wider sheet, the text in its usual measure on the left. */
	@media (min-width: 1180px) {
		.column:has(:global(.rig-track)) {
			/* The sheet's padding, the text, the gap, and the laptop's lane. */
			max-width: calc(47rem + clamp(22rem, 100vw - 54rem, 27rem));
		}

		.column:has(:global(.rig-track)) :global(.prose-blog > :not(.pair)) {
			max-width: 37.5rem;
		}
	}

	/* Driven by the scroll position itself, so it costs no script and never lags. */
	@supports (animation-timeline: scroll()) {
		.progress {
			display: block;
			position: fixed;
			top: var(--header-height);
			left: 0;
			z-index: 40;
			width: 100%;
			height: 2px;
			background: hsl(var(--accent));
			transform-origin: left;
			animation: progress linear both;
			animation-timeline: scroll(root);
		}

		@keyframes progress {
			from {
				transform: scaleX(0);
			}
			to {
				transform: scaleX(1);
			}
		}
	}
</style>
