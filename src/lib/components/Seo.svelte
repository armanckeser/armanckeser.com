<script lang="ts">
/**
 * Single source of truth for per-page head metadata.
 *
 * Every indexable route renders exactly one of these. Anything that has to be
 * an absolute URL (canonical, og:url, og:image, JSON-LD ids) is built here from
 * $lib/config so no page can ship a relative one.
 */
import * as config from "$lib/config"
import { absoluteUrl, clampDescription, serializeJsonLd } from "$lib/seo"

const {
	title,
	description = config.description,
	path,
	type = "website",
	publishedTime,
	modifiedTime,
	tags,
	jsonLd = [],
	noindex = false,
} = $props<{
	/** Page-specific title. Omit on the homepage to use the site title alone. */
	title?: string
	description?: string
	/** Site-relative path of this page, e.g. "/writing/post-slug". */
	path: string
	type?: "website" | "article"
	publishedTime?: string
	modifiedTime?: string
	tags?: string[]
	jsonLd?: Array<Record<string, unknown>>
	noindex?: boolean
}>()

const documentTitle = $derived(
	title && title !== config.title
		? `${title} - ${config.title}`
		: config.title
)
const metaDescription = $derived(clampDescription(description))
const canonical = $derived(absoluteUrl(path))
const socialImage = absoluteUrl(config.ogImage)
</script>

<svelte:head>
	<title>{documentTitle}</title>
	<meta name="description" content={metaDescription} />
	<meta name="author" content={config.author} />
	<link rel="canonical" href={canonical} />
	{#if noindex}
		<meta name="robots" content="noindex, follow" />
	{/if}

	<meta property="og:type" content={type} />
	<meta property="og:title" content={title ?? config.title} />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:url" content={canonical} />
	<meta property="og:site_name" content={config.title} />
	<meta property="og:locale" content={config.locale} />
	<meta property="og:image" content={socialImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta
		property="og:image:alt"
		content="A terminal window reading: {config.title}, const state = 'learning'"
	/>

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title ?? config.title} />
	<meta name="twitter:description" content={metaDescription} />
	<meta name="twitter:image" content={socialImage} />

	{#if type === "article"}
		{#if publishedTime}
			<meta property="article:published_time" content={publishedTime} />
		{/if}
		<meta
			property="article:modified_time"
			content={modifiedTime ?? publishedTime}
		/>
		<meta property="article:author" content={config.author} />
		{#each tags ?? [] as tag}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}

	{#each jsonLd as node}
		{@html `<script type="application/ld+json">${serializeJsonLd(node)}</script>`}
	{/each}
</svelte:head>
