<script lang="ts">
import Card from "$lib/components/Card.svelte"
import ContentSection from "$lib/components/ContentSection.svelte"
import ExternalLink from "$lib/components/ExternalLink.svelte"
import type { PageData } from "./$types"
const props = $props<{ data: PageData }>()
const posts = $derived(props.data.posts)
const projects = $derived(props.data.projects)
</script>

<svelte:head>
  <title>Armanc Keser</title>
  <link rel="dns-prefetch" href="https://github.com" />
  <meta
    name="description"
    content="Engineer learning the skills for the next steps"
  />
</svelte:head>

<main class="container mx-auto px-4 py-8 md:px-8 md:py-16">
  <div class="max-w-[85rem] mx-auto space-y-16">
    <!-- Hero Section -->
    <section aria-label="Personal introduction" class="animate-fade-in space-y-8">
      <div class="space-y-4">
        <h1
          class="animate-slide-in font-mono text-4xl font-bold tracking-tight text-primary md:text-6xl lg:text-7xl"
        >
          Armanc Keser<span class="animate-pulse text-accent">_</span>
        </h1>

        <p
          class="max-w-2xl font-mono text-base text-muted-foreground md:text-lg"
        >
          <code class="text-primary">
            <span class="text-accent">const</span> state =
            <span class="text-highlight">'learning'</span>
          </code>
        </p>
      </div>

      <!-- Quick links -->
      <div class="flex flex-wrap gap-4">
        <ExternalLink
          href="https://github.com/armanckeser"
          label="github"
        />
        <ExternalLink
          href="https://www.linkedin.com/in/armanckeser/"
          label="linkedin"
        />
        <ExternalLink
          href="https://bsky.app/profile/armanckeser.com"
          label="bluesky"
        />
      </div>
    </section>

    <!-- Blog Posts Section -->
    <ContentSection title="~/writing" subtitle="Insights, learnings, thoughts" id="writing">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    </ContentSection>

    <!-- Projects Section -->
    <ContentSection title="~/projects" subtitle="Apps and tools I've built" id="projects">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each projects as project, i}
          <div class="animate-slide-in" style="animation-delay: {i * 100}ms">
            <Card
              title={project.title}
              description={project.description}
              tag={project.homepage ? "page" : "repo"}
              stars={project.stars}
              href={project.homepage || project.url}
              date={project.updated}
            />
          </div>
        {/each}
      </div>
    </ContentSection>
  </div>
</main>