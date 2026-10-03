<script lang="ts">
import { base } from "$app/paths"
import PostSheet from "$lib/components/PostSheet.svelte"
import Seo from "$lib/components/Seo.svelte"
import { buttondown } from "$lib/config"

// The open-source apps, for people who came from a README and want release notes.
const apps = [
	["Stars Organizer", "github-stars-organizer"],
	["Kumbara", "kumbara"],
	["Jellymeme", "jellymeme"],
	["USCIS Tracker", "uscis-tracker"],
	["Visa Bulletin data", "visa-bulletin-data"],
	["Wishlist", "wishlist"],
	["Four Quarters", "four-quarters"],
]
</script>

<Seo
  title="Follow along"
  description="Get new posts by email or RSS, and release notes for the apps I open-source."
  path="/subscribe"
/>

<div class="mx-auto max-w-[46rem] pb-16 sm:px-6">
  <PostSheet title="Follow along" plain>
    <p>I write about the software I build for myself and then share, roughly every few weeks.</p>

    {#if buttondown}
      <h2>By email</h2>
      <form action="https://buttondown.com/api/emails/embed-subscribe/{buttondown}" method="post">
        <input type="hidden" name="embed" value="1" />
        <label for="subscribe-email">Email</label>
        <input id="subscribe-email" type="email" name="email" required autocomplete="email" placeholder="you@example.com" />
        <button type="submit">Email me new posts</button>
      </form>
      <p>One email per post and nothing else. Unsubscribe from any of them. What happens to your address is on the <a href="{base}/privacy#newsletter">privacy page</a>.</p>
    {/if}

    <h2>By RSS</h2>
    <p>Every post is in the <a href="{base}/rss.xml">RSS feed</a>.</p>

    <h2>Release notes for the apps</h2>
    <p>Each app's repository on GitHub has a Watch button. Pick <strong>Custom</strong>, then <strong>Releases</strong>, and GitHub tells you about new versions and nothing else.</p>
    <ul>
      {#each apps as [name, repo] (repo)}
        <li><a href="https://github.com/armanckeser/{repo}" rel="noopener">{name}</a></li>
      {/each}
    </ul>
  </PostSheet>
</div>

<style>
  form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  input {
    flex: 1;
    min-width: 0;
    padding: 0.5rem 0.75rem;
    border: 1px solid hsl(var(--border));
    border-radius: 0.375rem;
    background: transparent;
    font: inherit;
  }

  button {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    font: inherit;
  }
</style>
