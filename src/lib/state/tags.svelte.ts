import { mode } from "mode-watcher"

export const tagConfig = $state<
	Record<string, { light: string; dark: string }>
>({
	blog: {
		light: "text-emerald-500 bg-emerald-500/10",
		dark: "dark:text-emerald-400 dark:bg-emerald-400/10",
	},
	app: {
		light: "text-blue-500 bg-blue-500/10",
		dark: "dark:text-blue-400 dark:bg-blue-400/10",
	},
	// Add more tags as needed
})

export function getTagClasses(tag: string) {
	const config = tagConfig[tag] || tagConfig.blog // Default to blog style
	return `${config.light} ${config.dark}`
}
