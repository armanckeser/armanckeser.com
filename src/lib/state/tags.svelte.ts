const tagConfig = {
	blog: {
		light: "text-emerald-500 bg-emerald-500/10",
		dark: "dark:text-emerald-400 dark:bg-emerald-400/10",
	},
	app: {
		light: "text-blue-500 bg-blue-500/10",
		dark: "dark:text-blue-400 dark:bg-blue-400/10",
	},
} as const

type Tag = keyof typeof tagConfig

/**
 * Returns the Tailwind CSS classes for a given tag based on its configuration.
 * Combines both light and dark mode classes for consistent styling across themes.
 *
 * @param tag - The tag to get classes for, must be a key of tagConfig
 * @returns A string of Tailwind classes for the tag's styling
 * @example
 * // Returns "text-emerald-500 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-400/10"
 * getTagClasses('blog')
 */
export function getTagClasses(tag: Tag): string {
	const config = tagConfig[tag]
	return `${config.light} ${config.dark}`
}
