<script lang="ts">
import type { PageData } from "./$types"

const { data } = $props<{ data: PageData }>()
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.title} />
	<meta property="og:description" content={data.description} />
	<meta property="article:published_time" content={data.date} />
	<meta property="article:author" content="Armanc Keser" />
	<meta property="article:tag" content="Writing" />
</svelte:head>

<div class="prose prose-sm prose-slate dark:prose-invert mx-auto max-w-prose">
	<data.content />
</div>
