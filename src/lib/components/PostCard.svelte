<script lang="ts">
import { inkHue } from "$lib/ink"
import { tilt } from "$lib/tilt"
import { formatDate } from "$lib/utils"

const {
	title,
	description,
	date,
	href,
	excerpt = [],
	minutes,
	featured = false,
} = $props<{
	title: string
	description?: string
	date: string
	href: string
	/** The post's opening paragraphs, set on the page that runs off the card. */
	excerpt?: string[]
	minutes?: number
	featured?: boolean
}>()

const hue = $derived(inkHue(href))
</script>

<article class="post group relative isolate flex overflow-hidden rounded-2xl border border-white/10 bg-zinc-950" class:featured style:--hue={hue} use:tilt>
  <div class="glow" aria-hidden="true"></div>

  <div class="copy relative z-10 flex flex-col gap-2 p-6 md:p-7">
    <p class="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-white/60">
      <time datetime={date}>{formatDate(date)}</time>{#if minutes}&nbsp;· {minutes} min read{/if}
    </p>
    <h3 class="title font-mono font-bold text-white">
      <!-- Stretched link: its ::after covers the card, so the whole card is one target. -->
      <a {href} class="after:absolute after:inset-0 after:z-20 focus-visible:outline-none">{title}</a>
    </h3>
    {#if description}
      <p class="dek text-white/70">{description}</p>
    {/if}
  </div>

  {#if excerpt.length}
    <!-- data-sheet: opening the post grows this page into the post's own (see the root layout). -->
    <div class="stage" aria-hidden="true" data-sheet={href.split("/").pop()}>
      <div class="page font-serif">
        {#each excerpt as paragraph, i}
          <p class:lede={i === 0}>{paragraph}</p>
        {/each}
      </div>
    </div>
  {/if}
</article>

<style>
  .post {
    height: 27rem;
    flex-direction: column;
    transition:
      border-color 200ms ease,
      scale 160ms var(--ease-out);
  }

  /* Pressed: the card gives a little, so the tap is felt before the page changes. */
  .post:active {
    scale: 0.985;
  }

  .post.featured {
    height: 26rem;
    flex-direction: row;
  }

  /* The post's ink, as light falling on the desk the page lies on. */
  .glow {
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(60% 70% at 85% 100%, hsl(var(--hue) 75% 50% / 0.35), transparent 70%),
      radial-gradient(50% 60% at 0% 0%, hsl(var(--hue) 60% 40% / 0.18), transparent 70%);
  }

  .copy {
    flex-shrink: 0;
  }

  .featured .copy {
    width: 44%;
    justify-content: center;
  }

  .title {
    font-size: 1.3rem;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .featured .title {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    line-height: 1.1;
  }

  .dek {
    font-size: 0.9rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .featured .dek {
    font-size: 1.05rem;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  /* Clipped to what the card shows of the page, so that is all that travels
     when the page grows into the post. */
  .stage {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* A printed page: serif, paper, and it runs off the bottom edge like the project devices. */
  .page {
    position: absolute;
    top: 0.75rem;
    bottom: -3rem;
    overflow: hidden;
    left: 50%;
    width: 84%;
    padding: 1.4rem 1.5rem;
    border-radius: 0.35rem;
    background: #f4f0e8;
    color: #2b2823;
    font-size: 0.8rem;
    line-height: 1.65;
    transform: translateX(-50%) rotate(-1deg);
    /* The page slides a little against the card as the card leans (see $lib/tilt). */
    translate: calc(var(--tilt-x, 0) * -7px) calc(var(--tilt-y, 0) * -5px);
    transition: transform 300ms var(--ease-out);
    box-shadow:
      0 30px 60px -12px rgb(0 0 0 / 0.6),
      0 2px 6px rgb(0 0 0 / 0.25);
  }

  .featured .page {
    top: 2.5rem;
    width: 88%;
    font-size: 0.88rem;
  }

  /* Ink on paper, whatever the site's theme says paragraphs look like. */
  .page p {
    color: #36322b;
  }

  .page p + p {
    margin-top: 0.7em;
    text-indent: 1.4em;
  }

  .page p.lede {
    text-indent: 0;
  }

  .page p.lede::first-letter {
    float: left;
    font-size: 3.1em;
    line-height: 0.85;
    padding: 0.08em 0.08em 0 0;
    font-weight: 700;
    color: hsl(var(--hue) 55% 38%);
  }

  .post:has(a:focus-visible) {
    outline: 2px solid hsl(var(--accent));
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    .post:hover {
      border-color: rgb(255 255 255 / 0.2);
    }
    .post:hover .page {
      transform: translate(-50%, -10px) rotate(0deg);
    }
  }

  @media (max-width: 767px) {
    .post,
    .post.featured {
      height: 26rem;
      flex-direction: column;
    }
    .featured .copy {
      width: auto;
    }
    .featured .page {
      top: 0.75rem;
      width: 84%;
      font-size: 0.8rem;
    }
    .featured .title {
      font-size: 1.3rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .page {
      transition: none;
    }
  }
</style>
