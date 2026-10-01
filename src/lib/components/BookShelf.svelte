<script lang="ts">
import { type Book, stars } from "$lib/shelf"
import { formatDate } from "$lib/utils"

const { books } = $props<{ books: Book[] }>()

const day = (iso: string) =>
	formatDate(iso, { month: "short", year: "numeric" })

/** Everything the book shows in pictures, in words. */
const describe = (book: Book) =>
	[
		`${book.title}, by ${book.author}`,
		book.reading ? ", reading now" : "",
		book.rating ? `, rated ${book.rating} out of 5` : "",
		book.read ? `, finished ${formatDate(book.read)}` : "",
	].join("")
</script>

<!--
  What I am reading and have read, as books standing on a shelf: each one a
  real box with a cover and a block of pages, turned a little so you can see
  it has thickness. Under the shelf, a label for each, the way a library tags them.
-->
<!-- Focusable so the keyboard can scroll it sideways. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="case" role="region" aria-label="Books I am reading and have read" tabindex="0">
  <ol class="shelf">
    {#each books as book, i (book.href)}
      <li class="slot">
        <a href={book.href} target="_blank" rel="noopener" aria-label={describe(book)}>
          <span class="stand">
            <span class="book">
              <span class="cover">
                <!-- Shows through only if the cover is missing or fails to load. -->
                <span class="plate font-serif">{book.title.split(":")[0]}</span>
                {#if book.cover}
                  <img
                    src={book.cover}
                    alt=""
                    loading={i < 4 ? "eager" : "lazy"}
                    decoding="async"
                    referrerpolicy="no-referrer"
                    onerror={e => ((e.currentTarget as HTMLImageElement).hidden = true)}
                  />
                {/if}
              </span>
            </span>
          </span>
          <span class="label font-mono" class:reading={book.reading} aria-hidden="true">
            {#if book.reading}
              reading now
            {:else}
              {#if book.rating}<span class="stars">{stars(book.rating)}</span>{/if}
              {#if book.read}<span>{day(book.read)}</span>{/if}
            {/if}
          </span>
        </a>
      </li>
    {/each}
  </ol>
</div>

<style>
  .case {
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    scroll-snap-type: x proximity;
    scroll-padding-inline: 1rem;
  }

  .case::-webkit-scrollbar {
    display: none;
  }

  .case:focus-visible {
    outline: 2px solid hsl(var(--accent));
    outline-offset: -2px;
    box-shadow: none;
  }

  .shelf {
    --w: 6.25rem;
    --h: 9.5rem;
    --thick: 1.25rem;
    position: relative;
    display: flex;
    gap: 1.6rem;
    width: max-content;
    min-width: 100%;
    padding: 1.5rem 1.5rem 0 1.25rem;
  }

  /* The shelf board: its lit top edge, its face, and the shadow it throws on the wall. */
  .shelf::after {
    content: "";
    position: absolute;
    top: calc(1.5rem + var(--h));
    right: 0;
    left: 0;
    height: 0.6rem;
    background: linear-gradient(
      hsl(var(--foreground) / 0.3),
      hsl(var(--foreground) / 0.16) 18%,
      hsl(var(--foreground) / 0.2)
    );
    box-shadow: 0 0.7rem 1rem -0.4rem hsl(var(--foreground) / 0.3);
  }

  .slot {
    flex-shrink: 0;
    width: var(--w);
    scroll-snap-align: start;
  }

  .slot a {
    display: block;
  }

  /* The eye is level with the middle of the book, a little way back. */
  .stand {
    display: block;
    height: var(--h);
    perspective: 42rem;
  }

  .book {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    transform: rotateY(-26deg);
    transform-style: preserve-3d;
    transition: transform 320ms var(--ease-out);
  }

  /* Front cover, pushed toward you by half the book's thickness. */
  .cover {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: 0.1rem 0.2rem 0.2rem 0.1rem;
    background: hsl(var(--accent));
    transform: translateZ(calc(var(--thick) / 2));
    /* The crease a hardback has beside its spine. */
    box-shadow: inset 0.25rem 0 0.3rem -0.2rem rgb(0 0 0 / 0.45);
  }

  .cover img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .plate {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 0.6rem;
    color: hsl(var(--accent-foreground));
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.25;
    text-align: center;
  }

  /* The block of pages: the book's right-hand side, turned to face out. */
  .book::before {
    content: "";
    position: absolute;
    top: 1.5%;
    left: 0;
    width: var(--thick);
    height: 97%;
    background: repeating-linear-gradient(
      90deg,
      #f3efe6 0 1px,
      #d9d3c5 1px 2px
    );
    transform: translateX(calc(var(--w) - var(--thick) / 2 - 1px)) rotateY(90deg);
  }

  /* The back cover, and the shadow the book leaves on the wall behind it. */
  .book::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 0.1rem 0.2rem 0.2rem 0.1rem;
    background: hsl(24 12% 14%);
    transform: translateZ(calc(var(--thick) / -2));
    box-shadow: -0.6rem 0.2rem 1.1rem 0 rgb(0 0 0 / 0.3);
  }

  /* The shelf's label for the book: what I made of it, and when. */
  .label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-top: 1.35rem;
    color: hsl(var(--muted-foreground));
    font-size: 0.5625rem;
    line-height: 1;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .label.reading {
    color: hsl(var(--accent));
    font-weight: 700;
  }

  .stars {
    color: hsl(var(--accent));
    font-size: 0.6875rem;
    letter-spacing: 0;
  }

  .slot a:focus-visible {
    outline: 2px solid hsl(var(--accent));
    outline-offset: 4px;
    box-shadow: none;
  }

  /* Pressed or pointed at, a book turns to face you. */
  .slot a:active .book,
  .slot a:focus-visible .book {
    transform: rotateY(-4deg);
  }

  @media (min-width: 768px) {
    .shelf {
      --w: 7.5rem;
      --h: 11.4rem;
      --thick: 1.5rem;
      gap: 2.1rem;
      padding-inline: 2rem 2.5rem;
    }

    .label {
      font-size: 0.625rem;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    .slot a:hover .book {
      transform: rotateY(-4deg) translateY(-0.3rem);
    }
  }

  /* On a phone there is no pointer, so the shelf itself does it: each book
     turns to face you as it passes the middle of the screen. */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) and (hover: none) {
      .slot {
        view-timeline: --book inline;
      }

      .book {
        animation: face linear both;
        animation-timeline: --book;
      }
    }
  }

  @keyframes face {
    from,
    to {
      transform: rotateY(-34deg);
    }
    45%,
    55% {
      transform: rotateY(-6deg);
    }
  }
</style>
