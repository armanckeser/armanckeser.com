<script lang="ts">
import { type Film, posterAt, stars } from "$lib/shelf"
import { formatDate } from "$lib/utils"

const { films } = $props<{ films: Film[] }>()

const day = (iso: string) => formatDate(iso, { month: "short", day: "numeric" })

/** Everything the frame shows in pictures, in words. */
const describe = (film: Film) =>
	[
		film.title,
		film.year ? `(${film.year})` : "",
		film.rating ? `, rated ${film.rating} out of 5` : "",
		`, watched ${formatDate(film.watched)}`,
		film.rewatch ? ", a rewatch" : "",
	].join(" ")
</script>

<!--
  What I have watched lately, as a strip of film: one frame per film, newest
  first, with the rating and the date printed along the edge the way a lab
  prints frame numbers. It runs the full width of the page and scrolls sideways.
-->
<!-- Focusable so the keyboard can scroll it sideways. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="strip" role="region" aria-label="Recently watched films" tabindex="0">
  <ol class="film">
    {#each films as film, i (film.href)}
      <li class="frame">
        <a href={film.href} target="_blank" rel="noopener" aria-label={describe(film)}>
          <span class="gate">
            <!-- Shows through only if the poster is missing or fails to load. -->
            <span class="slate font-mono">{film.title}</span>
            {#if film.poster}
              <img
                src={posterAt(film.poster, 230)}
                srcset="{posterAt(film.poster, 230)} 1x, {posterAt(film.poster, 460)} 2x"
                width="230"
                height="345"
                alt=""
                loading={i < 4 ? "eager" : "lazy"}
                decoding="async"
                referrerpolicy="no-referrer"
                onerror={e => ((e.currentTarget as HTMLImageElement).hidden = true)}
              />
            {/if}
          </span>
          <span class="edge font-mono" aria-hidden="true">
            {#if film.rating}<span class="stars">{stars(film.rating)}</span>{/if}
            <span>{day(film.watched)}</span>
          </span>
        </a>
      </li>
    {/each}
  </ol>
</div>

<style>
  .strip {
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    scroll-snap-type: x proximity;
    scroll-padding-inline: 1rem;
  }

  .strip::-webkit-scrollbar {
    display: none;
  }

  .strip:focus-visible {
    outline: 2px solid hsl(var(--accent));
    outline-offset: -2px;
    box-shadow: none;
  }

  /* The film itself: a band a shade lighter than the dark around it. */
  .film {
    --frame: 7.5rem;
    --hole: 0.5rem;
    position: relative;
    display: flex;
    gap: 0.625rem;
    width: max-content;
    min-width: 100%;
    padding: 1.75rem 1rem 1.6rem;
    background: hsl(30 10% 11%);
  }

  /* Sprocket holes along both edges: the room shows through them. */
  .film::before,
  .film::after {
    content: "";
    position: absolute;
    right: 0;
    left: 0;
    height: var(--hole);
    background: hsl(var(--background));
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='8'%3E%3Crect x='5' width='10' height='8' rx='2'/%3E%3C/svg%3E")
      0 0 / 1.25rem var(--hole) repeat-x;
  }

  .film::before {
    top: 0.5rem;
  }

  .film::after {
    bottom: 0.45rem;
  }

  .frame {
    flex-shrink: 0;
    width: var(--frame);
    scroll-snap-align: start;
  }

  .frame a {
    display: block;
    transition: transform 200ms var(--ease-out);
  }

  .gate {
    position: relative;
    display: block;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    border-radius: 0.2rem;
    background: hsl(30 8% 16%);
  }

  .gate img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .slate {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 0.5rem;
    color: hsl(var(--muted-foreground));
    font-size: 0.6875rem;
    line-height: 1.3;
    text-align: center;
  }

  /* Edge print: the rating and the day, in the amber of a lab's frame numbers. */
  .edge {
    display: flex;
    justify-content: space-between;
    gap: 0.25rem;
    margin-top: 0.45rem;
    color: hsl(var(--accent) / 0.85);
    font-size: 0.5625rem;
    line-height: 1;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .stars {
    letter-spacing: 0;
  }

  .frame a:active {
    transform: scale(0.97);
  }

  .frame a:focus-visible {
    outline: 2px solid hsl(var(--accent));
    outline-offset: 3px;
    box-shadow: none;
  }

  @media (min-width: 768px) {
    .film {
      --frame: 9.5rem;
      --hole: 0.6rem;
      gap: 0.75rem;
      padding: 2rem 2rem 1.75rem;
    }

    .film::before {
      top: 0.6rem;
    }

    .edge {
      font-size: 0.625rem;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    .frame a:hover {
      transform: translateY(-4px);
    }
  }

  /* The frame in the gate is lit; the ones on their way in and out are dimmer.
     Driven by where each frame is in the strip, so it follows the thumb. */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .gate {
        animation: projector linear both;
        animation-timeline: view(inline);
      }
    }
  }

  @keyframes projector {
    from,
    to {
      opacity: 0.45;
    }
    30%,
    70% {
      opacity: 1;
    }
  }
</style>
