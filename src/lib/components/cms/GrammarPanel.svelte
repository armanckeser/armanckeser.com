<script lang="ts">
import { onMount } from "svelte"
import { ChevronDown, ChevronUp } from "lucide-svelte"
import type { WorkerLinter } from "harper.js"

let { content = $bindable("") }: { content: string } = $props()

type Issue = {
	message: string
	problemText: string
	spanStart: number
	spanEnd: number
	replacement: string | null
}

let linter = $state<WorkerLinter | null>(null)
let linterLoading = $state(true)
let checking = $state(false)
let collapsed = $state(true)
let issues = $state<Issue[]>([])

// Session-level: cleared on page reload. Key: "spanStart:spanEnd"
const sessionIgnored = new Set<string>()

// Permanent: persisted to localStorage. Key: "problemText::message"
const permanentlyIgnored = new Set<string>(
	JSON.parse(
		typeof localStorage !== "undefined"
			? (localStorage.getItem("harper-ignored-keys") ?? "[]")
			: "[]"
	)
)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

onMount(async () => {
	try {
		const { WorkerLinter: WorkerLinterClass, binary } = await import(
			"harper.js"
		)
		const instance = new WorkerLinterClass({ binary })
		await instance.setup()
		linter = instance
		linterLoading = false
	} catch (initError) {
		console.error("Harper: failed to initialize", initError)
		linterLoading = false
	}
})

function permanentKey(problemText: string, message: string): string {
	return `${problemText}::${message}`
}

async function runLint(): Promise<void> {
	if (debounceTimer !== null) clearTimeout(debounceTimer)
	debounceTimer = setTimeout(async () => {
		if (!linter) return
		checking = true
		try {
			const lints = await linter.lint(content, { language: "markdown" })
			issues = lints.flatMap(lint => {
				const span = lint.span()
				const msg = lint.message()
				const problemText = lint.get_problem_text()

				if (sessionIgnored.has(`${span.start}:${span.end}`)) return []
				if (permanentlyIgnored.has(permanentKey(problemText, msg)))
					return []

				const suggestions = lint.suggestions()
				const firstSuggestion = suggestions[0] ?? null
				return [
					{
						message: msg,
						problemText,
						spanStart: span.start,
						spanEnd: span.end,
						replacement:
							firstSuggestion?.get_replacement_text() ?? null,
					},
				]
			})
		} finally {
			checking = false
		}
	}, 500)
}

function applyFix(issue: Issue): void {
	if (issue.replacement === null) return
	content =
		content.slice(0, issue.spanStart) +
		issue.replacement +
		content.slice(issue.spanEnd)
}

function ignoreOnce(issue: Issue): void {
	sessionIgnored.add(`${issue.spanStart}:${issue.spanEnd}`)
	issues = issues.filter(i => i !== issue)
}

function ignoreAlways(issue: Issue): void {
	const key = permanentKey(issue.problemText, issue.message)
	permanentlyIgnored.add(key)
	localStorage.setItem(
		"harper-ignored-keys",
		JSON.stringify([...permanentlyIgnored])
	)
	// Remove all issues with this same problemText+message combination
	issues = issues.filter(i => permanentKey(i.problemText, i.message) !== key)
}

$effect(() => {
	const _content = content
	if (!linterLoading) runLint()
})

const issueCount = $derived(issues.length)

function getContext(issue: Issue): { before: string; after: string } {
	const radius = 35
	const rawBefore = content
		.slice(Math.max(0, issue.spanStart - radius), issue.spanStart)
		.replace(/\n/g, " ")
	const rawAfter = content
		.slice(issue.spanEnd, issue.spanEnd + radius)
		.replace(/\n/g, " ")
	const before = issue.spanStart > radius ? "…" + rawBefore : rawBefore
	const after =
		issue.spanEnd + radius < content.length ? rawAfter + "…" : rawAfter
	return { before, after }
}
</script>

<div class="border-b border-border">
	<button
		type="button"
		class="flex w-full items-center justify-between px-4 py-2 font-mono text-xs text-muted-foreground"
		onclick={() => (collapsed = !collapsed)}
	>
		<span class="flex items-center gap-2">
			GRAMMAR
			{#if linterLoading}
				<span class="text-muted-foreground/50">loading...</span>
			{:else if checking}
				<span class="text-muted-foreground/50">checking...</span>
			{:else if issueCount > 0}
				<span class="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-xs">
					{issueCount}
					{issueCount === 1 ? "issue" : "issues"}
				</span>
			{:else}
				<span class="text-green-500/60">no issues</span>
			{/if}
		</span>
		{#if collapsed}
			<ChevronDown class="h-3.5 w-3.5" />
		{:else}
			<ChevronUp class="h-3.5 w-3.5" />
		{/if}
	</button>

	{#if !collapsed}
		<div class="pb-3">
			{#if linterLoading}
				<p class="text-xs text-muted-foreground font-mono px-4 py-2">Loading grammar checker...</p>
			{:else if issues.length === 0}
				<p class="text-xs text-muted-foreground font-mono px-4 py-2">No grammar issues found.</p>
			{:else}
				<ul class="max-h-56 overflow-y-auto divide-y divide-border/40">
					{#each issues as issue}
						{@const ctx = getContext(issue)}
						<li class="px-4 py-2.5 space-y-1">
							<!-- Context line: surrounding text with problem highlighted -->
							<p class="font-mono text-xs leading-relaxed break-words">
								<span class="text-muted-foreground/70">{ctx.before}</span><mark
									class="bg-amber-500/15 text-amber-300 not-italic px-0.5 rounded-sm"
									>{issue.problemText}</mark
								><span class="text-muted-foreground/70">{ctx.after}</span>
							</p>

							<!-- Message + fix hint -->
							<p class="font-mono text-xs text-muted-foreground">{issue.message}</p>
							{#if issue.replacement !== null}
								<p class="font-mono text-xs text-accent/80">→ "{issue.replacement}"</p>
							{/if}

							<!-- Actions -->
							<div class="flex items-center gap-2 pt-0.5">
								{#if issue.replacement !== null}
									<button
										type="button"
										onclick={() => applyFix(issue)}
										class="font-mono text-xs px-2 py-0.5 rounded border border-accent/40 text-accent hover:bg-accent/10 transition-colors"
									>
										Fix
									</button>
								{/if}
								<button
									type="button"
									onclick={() => ignoreOnce(issue)}
									class="font-mono text-xs px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-colors"
								>
									Ignore
								</button>
								<button
									type="button"
									onclick={() => ignoreAlways(issue)}
									class="font-mono text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
								>
									Always ignore
								</button>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</div>
