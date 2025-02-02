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
</svelte:head>

<div class="min-h-screen bg-background">
  <div class="relative mx-auto max-w-7xl px-4">
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
      <PostSidebar currentSlug={page.url.pathname} />
    </div>
  </div>
</div>
