<script lang="ts">
import { type Project, projectHref } from "$lib/projects"
import { tilt } from "$lib/tilt"
import { Star } from "lucide-svelte"

const {
	project,
	featured = false,
	eager = false,
} = $props<{
	project: Project
	/**
	 * May set the copy beside the device once the card is wide enough: the lead
	 * card on the desktop grid, and every card on the phone shelf.
	 */
	featured?: boolean
	eager?: boolean
}>()

const href = $derived(projectHref(project))
// Portrait screenshots are phone apps and go in a phone; everything else in a window.
const phone = $derived(
	!!project.cover && project.cover.height > project.cover.width
)
// Width over height of the screen, which the device and the stage are both sized from.
const ratio = $derived(
	phone && project.cover
		? project.cover.width / project.cover.height
		: 16 / 11
)

// The demo GIF is a few MB: fetched only once someone points at the card, and
// only shown once loaded, so the still never blinks out.
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

<div class="frame">
<article
  class="card group relative isolate grid overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
  class:featured
  onpointerenter={startPreview}
  onpointerleave={() => (pointing = false)}
  style:--ratio={ratio}
  use:tilt
>
  {#if project.cover}
    <!-- The card's colour is its own screenshot, blurred: no palette to maintain per project. -->
    <img class="ambient" src={project.cover.src} alt="" aria-hidden="true" loading={eager ? "eager" : "lazy"} decoding="async" />
  {/if}
  <div class="scrim" aria-hidden="true"></div>

  <!-- Not positioned, so the title link's ::after stretches over the whole card rather than just this block. -->
  <div class="head flex flex-col gap-2">
    <p class="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-white/60">{project.kind}</p>
    <h3 class="title font-mono font-bold text-white">
      {#if href}
        <!-- Stretched link: its ::after covers the card, so the whole card is one target. -->
        <a {href} target="_blank" rel="noopener" class="after:absolute after:inset-0 after:z-20 focus-visible:outline-none">
          {project.title}
        </a>
      {:else}
        {project.title}
      {/if}
    </h3>
  </div>

  <div class="body flex flex-col gap-2">
    <p class="tagline text-white/75">{project.description}</p>
    <p class="mt-1 flex items-center gap-4 font-mono text-xs">
      {#if href}
        <a {href} target="_blank" rel="noopener" class="action relative z-30 whitespace-nowrap text-white">{project.action}<span class="arrow inline-block" aria-hidden="true">&nbsp;↗</span></a>
      {:else}
        <span class="text-white"><span class="whitespace-nowrap">{project.action}<span class="arrow inline-block" aria-hidden="true">&nbsp;↗</span></span></span>
      {/if}
      {#if project.url}
        <!-- Above the stretched link, so the repository (and its star button) stays reachable on its own. -->
        <a href={project.url} target="_blank" rel="noopener" class="star relative z-30" aria-label="Star {project.title} on GitHub">
          <Star class="star-icon" size={13} strokeWidth={2.25} aria-hidden="true" />
          Star{#if project.stars > 0}<span class="count">{project.stars}</span>{/if}
        </a>
      {/if}
    </p>
  </div>

  {#if project.cover}
    <div class="stage" aria-hidden="true">
    <figure class="device" class:phone class:window={!phone}>
      {#if !phone}
        <div class="chrome"><span></span><span></span><span></span></div>
      {/if}
      <div class="screen" style:aspect-ratio={ratio}>
        <img src={project.cover.src} width={project.cover.width} height={project.cover.height} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
        {#if previewSrc}
          <img
            src={previewSrc}
            alt=""
            decoding="async"
            onload={() => (previewReady = true)}
            class="preview"
            class:shown={pointing && previewReady}
          />
        {/if}
      </div>
    </figure>
    </div>
  {/if}
</article>
</div>

<style>
  /* Lets a card lay itself out by its own width rather than the viewport's. */
  .frame {
    container: card / inline-size;
    height: 100%;
  }

  /* Stacked: copy over the device, at a fixed height the device fills and runs off. */
  .card {
    --pad: 1.5rem;
    height: 30rem;
    grid-template: "head" auto "body" auto "stage" minmax(0, 1fr) / minmax(0, 1fr);
    transition:
      border-color 200ms ease,
      scale 160ms var(--ease-out);
  }

  /* Pressed: the card gives a little, so the tap is felt before the page changes. */
  .card:active:not(:has(.star:active)) {
    scale: 0.985;
  }

  .ambient {
    position: absolute;
    inset: -20%;
    width: 140%;
    height: 140%;
    object-fit: cover;
    filter: blur(56px) saturate(2.2) brightness(1.25);
    opacity: 0.9;
    z-index: -2;
  }

  /* Keeps the copy legible whatever colour the screenshot turns the card. */
  .scrim {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(180deg, rgb(9 9 11 / 0.72) 0%, rgb(9 9 11 / 0.3) 55%, rgb(9 9 11 / 0.05) 100%);
  }

  .head {
    grid-area: head;
    padding: var(--pad) var(--pad) 0;
  }

  .body {
    grid-area: body;
    padding: 0.5rem var(--pad) var(--pad);
  }

  .title {
    font-size: 1.5rem;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .tagline {
    font-size: 0.9rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /*
   * The device gets whatever room the copy leaves and always runs off the bottom
   * edge, like store art: it is anchored there and sized from the stage's height,
   * so a short screenshot never floats with its whole frame showing.
   */
  .stage {
    --top: 0.5rem;
    --bleed: 2.5rem;
    grid-area: stage;
    position: relative;
    min-height: 0;
    container-type: size;
  }

  .device {
    /* The screen's height when the device spans the stage and bleeds off it. */
    --fit: calc(100cqh - var(--top) + var(--bleed) - var(--frame));
    position: absolute;
    bottom: calc(-1 * var(--bleed));
    left: 50%;
    margin: 0;
    transform: translateX(var(--shift, -50%));
    /* The device slides a little against the card as the card leans (see $lib/tilt). */
    translate: calc(var(--tilt-x, 0) * -7px) calc(var(--tilt-y, 0) * -5px);
    transition: transform 300ms var(--ease-out);
    box-shadow:
      0 30px 60px -12px rgb(0 0 0 / 0.65),
      0 0 0 1px rgb(255 255 255 / 0.1);
  }

  .device.window {
    --frame: 24px;
    width: min(86%, var(--fit) * var(--ratio));
    border-radius: 0.6rem;
    background: #18181b;
  }

  .device.phone {
    --frame: 10px;
    width: min(min(64%, 15rem), var(--fit) * var(--ratio) + var(--frame));
    padding: 5px;
    border-radius: 1.75rem;
    background: #0c0c0e;
  }

  .chrome {
    display: flex;
    gap: 5px;
    padding: 8px 10px;
  }

  .chrome span {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: rgb(255 255 255 / 0.18);
  }

  .screen {
    position: relative;
    overflow: hidden;
    border-radius: 0 0 0.6rem 0.6rem;
  }

  .phone .screen {
    border-radius: 1.4rem;
  }

  .screen img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
  }

  .preview {
    opacity: 0;
    transition: opacity 200ms ease;
  }

  .preview.shown {
    opacity: 1;
  }

  .arrow {
    transition: transform 200ms var(--ease-out);
  }

  .star {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.65rem;
    border: 1px solid rgb(255 255 255 / 0.18);
    border-radius: 9999px;
    background: rgb(9 9 11 / 0.35);
    color: rgb(255 255 255 / 0.8);
    transition:
      color 150ms ease,
      border-color 150ms ease,
      background-color 150ms ease,
      transform 160ms var(--ease-out);
  }

  .star:active {
    transform: scale(0.96);
  }

  .star :global(.star-icon) {
    color: #fbbf24;
    transition: fill 150ms ease;
  }

  .count {
    padding-left: 0.4rem;
    border-left: 1px solid rgb(255 255 255 / 0.18);
  }

  .card:has(a:focus-visible) {
    outline: 2px solid hsl(var(--accent));
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    .card:hover {
      border-color: rgb(255 255 255 / 0.2);
    }
    .card:hover .device {
      transform: translate(var(--shift, -50%), -10px);
    }
    .card:hover .arrow {
      transform: translate(2px, -2px);
    }
    .action:hover {
      text-decoration: underline;
      text-underline-offset: 4px;
    }
    .star:hover {
      color: white;
      border-color: rgb(251 191 36 / 0.6);
      background: rgb(9 9 11 / 0.6);
    }
    .star:hover :global(.star-icon) {
      fill: currentColor;
    }
  }

  @media (min-width: 768px) {
    .card {
      --pad: 1.75rem;
    }
  }

  @media (max-width: 767px) {
    .card {
      height: 28rem;
    }
  }

  /*
   * Side by side: the title across the top, the description beside the device
   * under it. Here the device sets the card's height rather than filling what is
   * left: the stage shows a fixed share of the screenshot from the top, enough to
   * read the app, and the rest runs off the bottom. No room is left empty, and no
   * device shows too little to make sense of.
   */
  @container card (min-width: 32rem) {
    .featured {
      --show: 0.8;
      height: 100%;
      grid-template:
        "head head" auto
        "body stage" auto
        / minmax(13rem, 2fr) minmax(0, 3fr);
      column-gap: 1.5rem;
    }
    /* A phone is narrow: its column is only as wide as the phone. */
    .featured:has(.phone) {
      --show: 0.55;
      grid-template-columns: minmax(0, 1fr) min(16rem, 42cqw);
    }
    .featured .scrim {
      background:
        linear-gradient(180deg, rgb(9 9 11 / 0.55) 0%, rgb(9 9 11 / 0) 40%),
        linear-gradient(90deg, rgb(9 9 11 / 0.7) 0%, rgb(9 9 11 / 0.25) 50%, rgb(9 9 11 / 0.05) 100%);
    }
    .featured .head {
      padding-bottom: 1.25rem;
    }
    .featured .body {
      padding-top: 0;
    }
    .featured .title {
      font-size: clamp(1.75rem, 4cqw, 3rem);
    }
    .featured .tagline {
      font-size: clamp(0.9rem, 1.6cqw, 1.05rem);
      -webkit-line-clamp: 4;
      line-clamp: 4;
    }
    .featured .stage {
      align-self: start;
      margin-right: var(--pad);
      aspect-ratio: calc(var(--ratio) / var(--show));
    }
    .featured .device {
      --shift: 0;
      top: 0;
      bottom: auto;
      left: 0;
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .device {
      transition: none;
    }
  }
</style>
