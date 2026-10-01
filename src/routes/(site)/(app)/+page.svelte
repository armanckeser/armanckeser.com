<script lang="ts">
import BookShelf from "$lib/components/BookShelf.svelte"
import ContentSection from "$lib/components/ContentSection.svelte"
import ExternalLink from "$lib/components/ExternalLink.svelte"
import FilmStrip from "$lib/components/FilmStrip.svelte"
import PostShelf from "$lib/components/PostShelf.svelte"
import ProjectShelf from "$lib/components/ProjectShelf.svelte"
import Seo from "$lib/components/Seo.svelte"
import { goodreads, letterboxd } from "$lib/config"
import type { Project } from "$lib/projects"
import { trackRooms } from "$lib/room.svelte"
import type { Book, Film } from "$lib/shelf"
import { personJsonLd, websiteJsonLd } from "$lib/seo"
import type { PageData } from "./$types"
const props = $props<{ data: PageData }>()
const posts = $derived(props.data.posts)
// Each endpoint returns an error object instead of a list when its source is unreachable.
const listOf = <T>(value: unknown): T[] =>
	Array.isArray(value) ? (value as T[]) : []
const projects = $derived(listOf<Project>(props.data.projects))
const films = $derived(listOf<Film>(props.data.films))
const books = $derived(listOf<Book>(props.data.books))

// The header and footer take the colours of whichever room is on screen.
$effect(() => trackRooms())
</script>

<Seo
  path="/"
  description="Engineer learning the skills for the next steps"
  jsonLd={[websiteJsonLd(), personJsonLd()]}
/>

<svelte:head>
  <link rel="dns-prefetch" href="https://github.com" />
</svelte:head>

<!--
  The page is four rooms, one after another (see "Rooms" in app.css): what I
  build, what I write, what I watch, what I read. Each has its own material,
  and the page changes from one to the next as you scroll.
-->
<div class="room band" data-room="code">
  <div class="container mx-auto px-4 md:px-8">
    <div class="mx-auto max-w-[85rem] space-y-16">
      <section aria-label="Personal introduction" class="animate-fade-in space-y-8">
        <div class="space-y-4">
          <h1
            class="animate-slide-in font-mono text-4xl font-bold tracking-tight text-primary md:text-6xl lg:text-7xl"
          >
            Armanc Keser<span class="animate-pulse text-accent" aria-hidden="true">_</span>
          </h1>

          <p class="max-w-2xl font-mono text-base text-muted-foreground md:text-lg">
            <code class="text-primary">
              <span class="text-accent">const</span> state =
              <span class="text-highlight">'learning'</span>
            </code>
          </p>
        </div>

        <div class="flex flex-wrap gap-4">
          <ExternalLink href="https://github.com/armanckeser" label="github" />
          <ExternalLink href="https://www.linkedin.com/in/armanckeser/" label="linkedin" />
          <ExternalLink href="https://bsky.app/profile/armanckeser.com" label="bluesky" />
        </div>
      </section>

      <ContentSection title="~/projects" id="projects">
        <ProjectShelf {projects} />
      </ContentSection>
    </div>
  </div>
</div>

<div class="room band" data-room="writing">
  <div class="container mx-auto px-4 md:px-8">
    <div class="mx-auto max-w-[85rem]">
      <ContentSection title="~/writing" id="writing" link={{ href: "/writing", label: "all" }}>
        <PostShelf {posts} openings={props.data.openings} />
      </ContentSection>
    </div>
  </div>
</div>

{#if films.length}
  <div class="room band" data-room="film">
    <div class="container mx-auto px-4 md:px-8">
      <div class="mx-auto max-w-[85rem]">
        <ContentSection title="~/films" id="films" link={{ href: `https://letterboxd.com/${letterboxd}/`, label: "letterboxd" }}>
          <!-- The strip itself runs edge to edge, below. -->
          <p class="sr-only">The films I watched most recently, newest first.</p>
        </ContentSection>
      </div>
    </div>
    <div class="mt-6">
      <FilmStrip {films} />
    </div>
  </div>
{/if}

{#if books.length}
  <div class="room band" data-room="books">
    <div class="container mx-auto px-4 md:px-8">
      <div class="mx-auto max-w-[85rem]">
        <ContentSection title="~/books" id="books" link={{ href: `https://www.goodreads.com/user/show/${goodreads}`, label: "goodreads" }}>
          <p class="sr-only">The books I am reading now, then the ones I finished most recently.</p>
        </ContentSection>
      </div>
    </div>
    <div class="mt-2">
      <BookShelf {books} />
    </div>
  </div>
{/if}
