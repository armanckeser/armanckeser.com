<!-- Marks where in the text the laptop beside it moves on to its next state. -->
<script lang="ts">
const { is } = $props<{ is: string }>()
</script>

<div data-rig-step={is}></div>
