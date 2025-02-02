<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';

  const { children } = $props();
</script>

<ModeWatcher />
<main class="min-h-dvh">
  {@render children()}
</main>
