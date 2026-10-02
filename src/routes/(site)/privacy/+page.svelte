<script lang="ts">
import PostSheet from "$lib/components/PostSheet.svelte"
import Seo from "$lib/components/Seo.svelte"
</script>

<Seo
  title="Privacy"
  description="What armanckeser.com and the demos hosted alongside it collect: no accounts, no cookies, anonymous visit counts."
  path="/privacy"
/>

<div class="mx-auto max-w-[46rem] pb-16 sm:px-6">
  <PostSheet title="Privacy" plain>
      <p><em>Last updated: October 2, 2026</em></p>

      <p>This page covers armanckeser.com and the demos I host on GitHub Pages: Four Quarters, the Kumbara demo and USCIS Tracker.</p>

      <h2>The short version</h2>

      <p>There are no accounts, no cookies, no ads, and nothing is sold or shared. Two parties can tell that a page was visited: GitHub, which hosts everything here, and GoatCounter, which counts visits on some pages.</p>

      <h2>Visit counts</h2>

      <p>armanckeser.com and Four Quarters use <a href="https://www.goatcounter.com" rel="noopener">GoatCounter</a> to count visits. GoatCounter records the page, the site that linked to it, the browser and operating system, the screen size and the country, and keeps them as totals. GoatCounter sets no cookies and does not store IP addresses. I use the numbers to see which posts and projects get read.</p>

      <p>The Kumbara demo and USCIS Tracker load no analytics at all.</p>

      <h2>Hosting</h2>

      <p>Every page here is served by GitHub Pages. GitHub receives your IP address when your browser asks for a page, the way any web host does, and may log it for security. The <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub privacy statement</a> covers what GitHub does with it. I cannot see those logs.</p>

      <h2 id="demos">What the demos keep</h2>

      <p>None of the demos has a server of mine behind it. What you put into them stays in your browser, and clearing the site data in your browser removes all of it.</p>

      <ul>
        <li><strong>Four Quarters.</strong> Your photos and decks are stored in your browser and in the deck file you send yourself. Nothing is uploaded. The note in an invite link sits after the <code>#</code> in the address, which a browser never sends to a server, so neither GitHub nor GoatCounter sees it. One exception to "nothing leaves your browser": when a title uses characters the built-in fonts lack, such as emoji or non-Latin scripts, the page fetches a fallback font from jsDelivr, a public CDN. jsDelivr then sees your IP address and which character ranges were needed, not your text.</li>
        <li><strong>Kumbara demo.</strong> The household is invented and the demo runs entirely in your browser. Nothing you type is sent anywhere.</li>
        <li><strong>USCIS Tracker.</strong> Your cases are stored in your browser. The refresh bookmark hands the case data to the page in the part of the address after the <code>#</code>, so it never reaches a server. The page downloads the public visa bulletin data from GitHub and is built to refuse connections to anywhere else.</li>
      </ul>

      <h2>Email</h2>

      <p>If you email me, I have your address and what you wrote, and I use them to reply.</p>

      <h2>Your choices</h2>

      <p>A script blocker stops GoatCounter without breaking anything. To ask what I hold about you, which should be nothing beyond an email you sent, reach me through <a href="https://github.com/armanckeser" rel="noopener">GitHub</a>.</p>

      <h2>Changes</h2>

      <p>This page changes when the practice does. The date at the top is the last time the text changed, and the history is in the site's <a href="https://github.com/armanckeser/armanckeser.com" rel="noopener">public repository</a>.</p>
  </PostSheet>
</div>
