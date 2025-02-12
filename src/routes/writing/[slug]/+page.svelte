<script lang="ts">
import PostSidebar from "$lib/components/PostSidebar.svelte"
import type { PageData } from "./$types"

const { data } = $props<{ data: PageData }>()

const formattedDate = $derived(
	data.meta.date
		? new Date(data.meta.date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
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

<article class="mx-auto max-w-3xl py-16">
  {#if data.meta.title}
    <header class="mb-12">
      <h1 class="text-4xl font-bold">{data.meta.title}</h1>
      {#if formattedDate}
        <time
          class="mt-2 block text-muted-foreground"
          datetime={data.meta.date}
        >
          {formattedDate}
        </time>
      {/if}
      {#if data.meta.description}
        <p class="mt-4 text-xl text-muted-foreground">
          {data.meta.description}
        </p>
      {/if}
    </header>
  {/if}

  <div class="prose prose-lg prose-slate dark:prose-invert mx-auto max-w-prose">
    <data.content />
  </div>
</article>

<div
  class="fixed right-[max(0px,calc(50%-45rem))] top-[3.8125rem] hidden w-[19rem] xl:block"
>
  <PostSidebar currentSlug={data.meta.slug} />
</div>
