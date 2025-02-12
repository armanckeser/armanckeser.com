<script lang="ts">
import { page } from "$app/state"
import PostSidebar from "$lib/components/PostSidebar.svelte"
import type { Component } from "svelte"
import type { BlogPost } from "../../types"

const props = $props<
	{
		/** MDX content */
		children?: () => Component
	} & BlogPost
>()

const formattedDate = $derived(
	props.date
		? new Date(props.date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: null
)
</script>

<svelte:head>
  <title
    >{props.title
      ? `${props.title} - Armanc Keser`
      : 'Blog - Armanc Keser'}</title
  >
  {#if props.description}
    <meta name="description" content={props.description} />
  {/if}
  <link rel="canonical" href={props.slug} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={props.title} />
  <meta property="og:description" content={props.description} />
  <meta property="og:url" content={props.slug} />
  <meta property="og:site_name" content="Armanc Keser" />
  <meta property="article:published_time" content={props.date} />
  <meta property="article:author" content="Armanc Keser" />
</svelte:head>

<article class="mx-auto max-w-3xl py-16">
  {#if props.title}
    <header class="mb-12">
      <h1 class="text-4xl font-bold">{props.title}</h1>
      {#if formattedDate}
        <time
          class="mt-2 block text-muted-foreground"
          datetime={props.date}
        >
          {formattedDate}
        </time>
      {/if}
      {#if props.description}
        <p class="mt-4 text-xl text-muted-foreground">
          {props.description}
        </p>
      {/if}
    </header>
  {/if}

  <div class="prose-lg dark:prose-invert">
    {@render props.children?.()}
  </div>
</article>

<div
  class="fixed right-[max(0px,calc(50%-45rem))] top-[3.8125rem] hidden w-[19rem] xl:block"
>
  <PostSidebar />
</div>
