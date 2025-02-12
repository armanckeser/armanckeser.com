<script lang="ts">
import type { PageData } from "./$types"

const { data } = $props<{ data: PageData }>()
</script>


<data.content />
