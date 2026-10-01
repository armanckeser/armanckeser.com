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
	/** The wide card that leads the shelf. */
	featured?: boolean
	eager?: boolean
}>()

const href = $derived(projectHref(project))
// Portrait screenshots are phone apps and go in a phone; everything else in a window.
const phone = $derived(
	!!project.cover && project.cover.height > project.cover.width
)
// Width over height of the screen, so the device can be sized to always run off the card's bottom edge.
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
  class="card group relative isolate flex overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
  class:featured
  onpointerenter={startPreview}
  onpointerleave={() => (pointing = false)}
  use:tilt
>
  {#if project.cover}
    <!-- The card's colour is its own screenshot, blurred: no palette to maintain per project. -->
    <img class="ambient" src={project.cover.src} alt="" aria-hidden="true" loading={eager ? "eager" : "lazy"} decoding="async" />
  {/if}
  <div class="scrim" aria-hidden="true"></div>

  <div class="copy relative z-10 flex flex-col gap-2 p-6 md:p-7">
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
    <p class="tagline text-white/75">{project.description}</p>
    <p class="mt-1 flex items-center gap-4 font-mono text-xs">
      <span class="text-white"><span class="whitespace-nowrap">{project.action}<span class="arrow inline-block" aria-hidden="true">&nbsp;↗</span></span></span>
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
    <figure class="device" class:phone class:window={!phone} style:--ratio={ratio}>
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
  }

  .card {
    height: 30rem;
    flex-direction: column;
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

  .copy {
    flex-shrink: 0;
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
    position: relative;
    flex: 1;
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
    transform: translateX(-50%);
    /* The device slides a little against the card as the card leans (see $lib/tilt). */
    translate: calc(var(--tilt-x, 0) * -7px) calc(var(--tilt-y, 0) * -5px);
    transition: transform 300ms var(--ease-out);
    box-shadow:
      0 30px 60px -12px rgb(0 0 0 / 0.65),
      0 0 0 1px rgb(255 255 255 / 0.1);
  }

  .device.window {
    --frame: 24px;
    --cap: 86%;
    width: min(var(--cap), var(--fit) * var(--ratio));
    border-radius: 0.6rem;
    background: #18181b;
  }

  .device.phone {
    --frame: 10px;
    --cap: min(46%, 15rem);
    width: min(var(--cap), var(--fit) * var(--ratio) + var(--frame));
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
      transform: translate(-50%, -10px);
    }
    .card:hover .arrow {
      transform: translate(2px, -2px);
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

  /*
   * Side layout, copy beside the device: the lead card on the desktop grid.
   * The same rules are repeated below for phone-shelf cards wide enough for it.
   */
  @media (min-width: 768px) {
    .featured {
      height: 27rem;
      flex-direction: row;
    }
    .featured .scrim {
      background: linear-gradient(90deg, rgb(9 9 11 / 0.78) 0%, rgb(9 9 11 / 0.35) 50%, rgb(9 9 11 / 0.05) 100%);
    }
    .featured .copy {
      width: 44%;
      justify-content: center;
    }
    .featured .title {
      font-size: clamp(2rem, 3.5vw, 3rem);
    }
    .featured .tagline {
      font-size: 1.05rem;
      -webkit-line-clamp: 3;
      line-clamp: 3;
    }
    .featured .stage {
      --top: 2.5rem;
    }
    .featured .device.window {
      --cap: 92%;
    }
    .featured .device.phone {
      --cap: min(48%, 19rem);
    }
  }

  @media (max-width: 767px) {
    .card {
      height: 28rem;
    }
    .device.phone {
      --cap: 64%;
    }
  }

  /* A large phone or small tablet: the shelf card is wide enough to sit side by side, so it does. */
  @container card (min-width: 32rem) {
    @media (max-width: 767px) {
      .card {
        height: 24rem;
        flex-direction: row;
      }
      .scrim {
        background: linear-gradient(90deg, rgb(9 9 11 / 0.78) 0%, rgb(9 9 11 / 0.35) 50%, rgb(9 9 11 / 0.05) 100%);
      }
      .copy {
        width: 46%;
        justify-content: center;
      }
      .tagline {
        -webkit-line-clamp: 4;
        line-clamp: 4;
      }
      .stage {
        --top: 2rem;
      }
      .device.window {
        --cap: 92%;
      }
      .device.phone {
        --cap: 62%;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .device {
      transition: none;
    }
  }
</style>
