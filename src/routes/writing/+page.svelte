<script lang="ts">
import Card from "$lib/components/Card.svelte"
import type { PageData } from "./$types"

const props = $props<{ data: PageData }>()
const posts = $derived(props.data.posts)
</script>

<svelte:head>
  <title>Blog - Armanc Keser</title>
  <meta
    name="description"
    content="Product insights, book notes, and learnings"
  />
</svelte:head>

<div class="relative mx-auto max-w-7xl px-4">
  <article class="mx-auto max-w-3xl py-16">
    <header class="mb-12">
      <h1 class="text-4xl font-bold">~/writing</h1>
      <p class="mt-4 text-xl text-muted-foreground">
        Product insights, book notes, and learnings
      </p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2">
      {#each posts as post, i}
        <div class="animate-slide-in" style="animation-delay: {i * 100}ms">
          <Card
            title={post.title}
            description={post.description}
            date={post.date}
            href={post.slug}
          />
        </div>
      {/each}
    </div>
  </article>
</div>
