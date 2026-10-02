<script lang="ts">
import type { Discussion } from "$lib/server/discussions"
import { formatDate } from "$lib/utils"

const { threads } = $props<{ threads: Discussion[] }>()

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`
</script>

<!--
  Where else this post is being talked about, found when the site was built.
  Sits above the comments so a reader can pick the conversation they want.
-->
{#if threads.length}
  <aside class="mt-10 px-5 sm:px-0" aria-labelledby="discussions">
    <h2 id="discussions" class="mb-3 font-mono text-sm font-normal text-muted-foreground">
      <span class="text-accent" aria-hidden="true">❯</span> join the discussion
    </h2>
    <ul class="threads">
      {#each threads as thread (thread.href)}
        <li>
          <a href={thread.href} rel="noopener" class="thread">
            <span class="site font-mono">{thread.site}</span>
            <span class="stats font-mono text-muted-foreground">
              {plural(thread.points, "point")}<span class="sep" aria-hidden="true">·</span>{plural(thread.comments, "comment")}{#if thread.date}<span class="sep" aria-hidden="true">·</span><time datetime={thread.date}>{formatDate(thread.date)}</time>{/if}
            </span>
            <span class="arrow text-accent" aria-hidden="true">→</span>
          </a>
        </li>
      {/each}
    </ul>
  </aside>
{/if}

<style>
  .threads {
    display: grid;
    gap: 0.25rem;
  }

  .thread {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.25rem 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid hsl(var(--border));
    text-decoration: none;
  }

  .site {
    font-size: 0.875rem;
    color: hsl(var(--foreground));
  }

  .stats {
    font-size: 0.75rem;
  }

  .sep {
    margin: 0 0.375rem;
  }

  .arrow {
    margin-left: auto;
    transition: transform 150ms ease;
  }

  .thread:hover .site,
  .thread:focus-visible .site {
    color: hsl(var(--accent));
  }

  .thread:hover .arrow,
  .thread:focus-visible .arrow {
    transform: translateX(0.2rem);
  }
</style>
