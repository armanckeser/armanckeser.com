<script lang="ts">
import type { Project } from "$lib/projects"
import { projectHref } from "$lib/projects"
import ProjectTile from "./ProjectTile.svelte"

const { projects } = $props<{ projects: Project[] }>()

const featured = $derived(projects.filter((p: Project) => p.cover))
const rest = $derived(projects.filter((p: Project) => !p.cover))

/**
 * Deals tiles into columns, each going to the currently shortest one. Heights
 * are known ahead of time from the cover sizes, so this runs at build time and
 * the prerendered page needs no layout script. Keeps the newest work on the
 * top row, which CSS columns would scatter down the first column.
 */
function columns(items: Project[], n: number): Project[][] {
	const cols: Project[][] = Array.from({ length: n }, () => [])
	const heights = new Array(n).fill(0)
	for (const p of items) {
		const i = heights.indexOf(Math.min(...heights))
		cols[i].push(p)
		const ratio = p.cover
			? Math.min(p.cover.height / p.cover.width, 1.05)
			: 0
		heights[i] += ratio + 0.45 // the caption, in tile-widths
	}
	return cols
}

const three = $derived(columns(featured, 3))
const two = $derived(columns(featured, 2))

const month = (iso: string) =>
	new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		year: "numeric",
	})
</script>

{#if featured.length}
  <!-- Phones: one swipeable shelf instead of a long scroll. -->
  <div class="shelf -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:hidden" role="region" aria-label="Projects">
    {#each featured as project, i (project.name)}
      <div class="flex w-[78%] shrink-0 snap-start">
        <ProjectTile {project} eager={i < 2} uniform />
      </div>
    {/each}
  </div>

  <div class="hidden gap-4 md:grid md:grid-cols-2 lg:hidden">
    {#each two as col}
      <div class="flex flex-col gap-4">
        {#each col as project (project.name)}
          <ProjectTile {project} />
        {/each}
      </div>
    {/each}
  </div>

  <div class="hidden gap-4 lg:grid lg:grid-cols-3">
    {#each three as col}
      <div class="flex flex-col gap-4">
        {#each col as project, r (project.name)}
          <ProjectTile {project} eager={r === 0} />
        {/each}
      </div>
    {/each}
  </div>
{/if}

{#if rest.length}
  <div class="mt-10 font-mono text-sm">
    <p class="mb-3 text-muted-foreground">
      <span class="text-blue-600 dark:text-blue-400">❯</span> ls -l ~/projects/more
    </p>
    <ul class="divide-y divide-border/40 border-y border-border/40">
      {#each rest as project (project.name)}
        {@const href = projectHref(project)}
        <li>
          <a
            href={href ?? undefined}
            target="_blank"
            rel="noopener"
            class="ls-row grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-2.5 md:grid-cols-[6.5rem_15rem_1fr_auto]"
          >
            <span class="hidden text-muted-foreground md:block">{month(project.updated)}</span>
            <span class="col-start-1 font-bold text-primary md:col-start-auto">{project.name}</span>
            <span class="col-span-2 truncate text-muted-foreground md:col-span-1">{project.description}</span>
            <span class="col-start-2 row-start-1 text-right text-muted-foreground md:col-start-auto md:row-start-auto">
              {#if project.stars > 0}<span class="text-accent">★</span> {project.stars}{/if}
              <span class="arrow inline-block" aria-hidden="true">↗</span>
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .shelf {
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 1rem;
    scrollbar-width: none;
    overscroll-behavior-x: contain;
  }

  .ls-row {
    transition: background-color 150ms ease;
  }

  .arrow {
    transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    .ls-row:hover {
      background-color: hsl(var(--accent) / 0.06);
    }
    .ls-row:hover .arrow {
      transform: translate(2px, -2px);
    }
  }
</style>
