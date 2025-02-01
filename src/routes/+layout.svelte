<script lang="ts">
  import '../app.css';

  const { children } = $props();
</script>

<main class="min-h-dvh">
  {@render children()}
</main>
