<script lang="ts">
import type { Project } from "$lib/projects"
import { projectHref } from "$lib/projects"
import ShowcaseCard from "./ShowcaseCard.svelte"

const { projects } = $props<{ projects: Project[] }>()

const shown = $derived(projects.filter((p: Project) => p.cover))
const rest = $derived(projects.filter((p: Project) => !p.cover))

// The newest project leads as a wide card. On a two-column grid an odd one out
// would leave a hole, so the last card goes wide too.
const wide = (i: number, n: number) => i === 0 || (i === n - 1 && n % 2 === 0)

const month = (iso: string) =>
	new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		year: "numeric",
	})
</script>

{#if shown.length}
  <!-- Phones: one swipeable row instead of a long scroll. -->
  <div class="shelf -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:hidden" role="region" aria-label="Projects">
    {#each shown as project, i (project.name)}
      <div class="shelf-slot w-[84%] shrink-0 snap-start">
        <ShowcaseCard {project} featured eager={i < 2} />
      </div>
    {/each}
  </div>

  <div class="hidden gap-5 md:grid md:grid-cols-2">
    {#each shown as project, i (project.name)}
      <div class={wide(i, shown.length) ? "md:col-span-2" : ""}>
        <ShowcaseCard {project} featured={wide(i, shown.length)} eager={i < 3} />
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
    transition: transform 200ms var(--ease-out);
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
