<script lang="ts">
import { type Project, projectHref } from "$lib/projects"

const {
	project,
	eager = false,
	uniform = false,
} = $props<{
	project: Project
	/** Tiles in the first screenful load their cover immediately. */
	eager?: boolean
	/** Same-shaped covers, for the swipeable row where tiles sit side by side. */
	uniform?: boolean
}>()

const href = $derived(projectHref(project))
const host = $derived(
	project.homepage
		? new URL(project.homepage).host.replace(/^www\./, "")
		: null
)
// Very tall phone screenshots are cropped from the top, so one app can't take a whole column.
const ratio = $derived(
	uniform
		? "4 / 3"
		: project.cover
			? `${project.cover.width} / ${Math.min(project.cover.height, project.cover.width * 1.05)}`
			: undefined
)

// The demo GIF is a few MB, so it is only fetched once someone points at the tile,
// and only shown once it has loaded, so the still never blinks out.
let previewSrc = $state<string | null>(null)
let previewReady = $state(false)
let pointing = $state(false)

function startPreview(e: PointerEvent) {
	if (e.pointerType !== "mouse" || !project.preview) return
	if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
	pointing = true
	previewSrc ??= project.preview
}
</script>

<article
  class="tile group relative flex w-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card/40"
  onpointerenter={startPreview}
  onpointerleave={() => (pointing = false)}
>
  {#if project.cover}
    <div class="relative overflow-hidden border-b border-border/50 bg-muted/30" style:aspect-ratio={ratio}>
      <img
        src={project.cover.src}
        width={project.cover.width}
        height={project.cover.height}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover object-top"
      />
      {#if previewSrc}
        <img
          src={previewSrc}
          alt=""
          decoding="async"
          onload={() => (previewReady = true)}
          class="preview absolute inset-0 h-full w-full object-cover object-top"
          class:shown={pointing && previewReady}
        />
      {/if}
    </div>
  {/if}

  <div class="flex flex-1 flex-col gap-2 p-4">
    <div class="flex items-baseline justify-between gap-3">
      <h3 class="font-mono text-base font-bold tracking-tight text-primary">
        {#if href}
          <!-- Stretched link: its ::after covers the tile, so the whole tile is one target. -->
          <a {href} target="_blank" rel="noopener" class="after:absolute after:inset-0 focus-visible:outline-none">
            {project.title}
          </a>
        {:else}
          {project.title}
        {/if}
      </h3>
      {#if project.homepage && project.url}
        <!-- Above the stretched link, so the source stays reachable on its own. -->
        <a
          href={project.url}
          target="_blank"
          rel="noopener"
          class="source relative z-10 shrink-0 font-mono text-xs text-muted-foreground"
          aria-label="{project.title} source on GitHub"
        >
          source
        </a>
      {/if}
    </div>

    <p class="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{project.description}</p>

    <div class="mt-auto flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[0.7rem]">
      <span class="text-accent">{host ?? "github.com"}<span class="arrow inline-block" aria-hidden="true">&nbsp;↗</span></span>
      {#each project.topics.slice(0, 2) as topic}
        <span class="rounded bg-muted/60 px-1.5 py-0.5 text-muted-foreground">{topic}</span>
      {/each}
    </div>
  </div>
</article>

<style>
  .tile {
    transition:
      border-color 200ms ease,
      transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .tile:has(a:focus-visible) {
    outline: 2px solid hsl(var(--accent));
    outline-offset: 2px;
  }

  .tile:active {
    transform: scale(0.985);
    transition-duration: 120ms;
  }

  .preview {
    opacity: 0;
    transition: opacity 200ms ease;
  }

  .preview.shown {
    opacity: 1;
  }

  .arrow {
    transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .source {
    transition: color 150ms ease;
  }

  @media (hover: hover) and (pointer: fine) {
    .tile:hover {
      border-color: hsl(var(--accent) / 0.35);
      transform: translateY(-2px);
    }
    .tile:hover .arrow {
      transform: translate(2px, -2px);
    }
    .source:hover {
      color: hsl(var(--primary));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tile:hover,
    .tile:active {
      transform: none;
    }
  }
</style>
