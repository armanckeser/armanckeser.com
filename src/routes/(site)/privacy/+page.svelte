<script lang="ts">
import PostSheet from "$lib/components/PostSheet.svelte"
import Seo from "$lib/components/Seo.svelte"
import { buttondown } from "$lib/config"
</script>

<Seo
  title="Privacy"
  description="What armanckeser.com and the demos hosted alongside it collect: no accounts, no cookies, anonymous visit counts."
  path="/privacy"
/>

<div class="mx-auto max-w-[46rem] pb-16 sm:px-6">
  <PostSheet title="Privacy" plain>
      <p><em>Last updated: November 12, 2026</em></p>

      <p>This page covers armanckeser.com and the demos I host: Four Quarters, the Kumbara demo, USCIS Tracker and Stard (the Stars Organizer demo).</p>

      <h2>The short version</h2>

      <p>There are no accounts, no cookies, no ads, and nothing is sold or shared. Three parties can tell that a page was visited: GitHub, which hosts everything here, GoatCounter, which counts visits on some pages, and Cloudflare, which carries Stard's pages and counts visits to them.</p>

      <h2>Visit counts</h2>

      <p>armanckeser.com and Four Quarters use <a href="https://www.goatcounter.com" rel="noopener">GoatCounter</a> to count visits. GoatCounter records the page, the site that linked to it, the browser and operating system, the screen size and the country, and keeps them as totals. GoatCounter sets no cookies and does not store IP addresses. I use the numbers to see which posts and projects get read.</p>

      <p>Stard's pages load Cloudflare Web Analytics, which counts page views, the referring site, the browser, the country and how long pages take to load. It sets no cookies. The Kumbara demo and USCIS Tracker load no analytics at all.</p>

      <h2>Hosting</h2>

      <p>Every page here is served by GitHub Pages. GitHub receives your IP address when your browser asks for a page, the way any web host does, and may log it for security. The <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub privacy statement</a> covers what GitHub does with it. I cannot see those logs.</p>

      <p>Stard's pages and game requests pass through Cloudflare, and the game's requests are answered by a Cloudflare Worker of mine, so Cloudflare receives your IP address for those, the way GitHub does for pages. The <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener">Cloudflare privacy policy</a> covers what Cloudflare does with it. My code doesn't record IP addresses.</p>

      <h2 id="demos">What the demos keep</h2>

      <p>Stard is the only demo with a server of mine behind it, and it has <a href="#stard">its own section</a> below. In the others, what you put in stays in your browser, and clearing the site data in your browser removes all of it.</p>

      <ul>
        <li><strong>Four Quarters.</strong> Your photos and decks are stored in your browser and in the deck file you send yourself. Nothing is uploaded. The note in an invite link sits after the <code>#</code> in the address, which a browser never sends to a server, so neither GitHub nor GoatCounter sees it. One exception to "nothing leaves your browser": when a title uses characters the built-in fonts lack, such as emoji or non-Latin scripts, the page fetches a fallback font from jsDelivr, a public CDN. jsDelivr then sees your IP address and which character ranges were needed, not your text.</li>
        <li><strong>Kumbara demo.</strong> The household is invented and the demo runs entirely in your browser. Nothing you type is sent anywhere.</li>
        <li><strong>USCIS Tracker.</strong> Your cases are stored in your browser. The refresh bookmark hands the case data to the page in the part of the address after the <code>#</code>, so it never reaches a server. The page downloads the public visa bulletin data from GitHub and is built to refuse connections to anywhere else.</li>
      </ul>

      <h2 id="stard">Stard</h2>

      <p>Stard is the card battle at <a href="https://stars-demo.armanckeser.com/run" rel="noopener">stars-demo.armanckeser.com</a>. A Cloudflare Worker of mine answers the game's requests.</p>

      <ul>
        <li><strong>What it reads.</strong> When you type a GitHub username, the Worker reads that account's public data from GitHub with my own token: its public starred repos and their public facts, the avatar, and the profile README (for a trainer card). It reads the same for the 12 accounts in <a href="https://github.com/armanckeser/github-stars-organizer/blob/main/OPPONENTS.md" rel="noopener">OPPONENTS.md</a>. It never reads private repos and never gets access to your account.</li>
        <li><strong>What it keeps.</strong> Cloudflare's cache holds the cards drawn from a typed username for up to an hour, the 12 opponents' cards for up to 30 days, and share pictures for up to a day. A team link carries the username, avatar address, cards and record inside the link itself. I store none of them. Your browser keeps one note: the date you first played.</li>
        <li><strong>The organizer side.</strong> Lists, tags, ratings and notes run in your browser, which asks GitHub's public API for the stars directly, so GitHub sees your IP address and the username. What you make there is gone when you reload.</li>
        <li><strong>If you never played.</strong> Your public stars can show up when someone types your username. To stop it, add a file called <code>no-play</code> to a public repo named <code>stard</code>, or message me on <a href="https://github.com/armanckeser" rel="noopener">GitHub</a> and I add your name to the block list within a few days. Either way nobody can play against your team and links to it stop opening. The block list also stops anyone playing as you.</li>
      </ul>

      <h2>Email</h2>

      <p>If you email me, I have your address and what you wrote, and I use them to reply.</p>

      {#if buttondown}
        <h2 id="newsletter">Newsletter</h2>

        <p>If you sign up for new posts by email, your address is stored by <a href="https://buttondown.com" rel="noopener">Buttondown</a>, which sends the emails for me. I use it for one thing: an email when a new post goes up. It is not sold, shared or used for anything else. Buttondown's <a href="https://buttondown.com/legal/privacy" rel="noopener">privacy policy</a> covers how it handles the address.</p>

        <p>Every email has an unsubscribe link, and unsubscribing deletes you from the list. Reach me through <a href="https://github.com/armanckeser" rel="noopener">GitHub</a> if you want your address gone from Buttondown's records entirely.</p>
      {/if}

      <h2>Your choices</h2>

      <p>A script blocker stops GoatCounter without breaking anything. To ask what I hold about you, which should be nothing beyond an email you sent{buttondown ? " or the address you subscribed with" : ""}, reach me through <a href="https://github.com/armanckeser" rel="noopener">GitHub</a>.</p>

      <h2>Changes</h2>

      <p>This page changes when the practice does. The date at the top is the last time the text changed, and the history is in the site's <a href="https://github.com/armanckeser/armanckeser.com" rel="noopener">public repository</a>.</p>
  </PostSheet>
</div>
