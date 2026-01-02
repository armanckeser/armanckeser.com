import { type ClassValue, clsx } from "clsx"
import { cubicOut } from "svelte/easing"
import type { TransitionConfig } from "svelte/transition"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Format a date string for display.
 * @param date - ISO date string or Date object
 * @param options - Intl.DateTimeFormat options (defaults to "Jan 1, 2024" format)
 */
export function formatDate(
	date: string | Date,
	options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "short",
		day: "numeric",
	}
): string {
	return new Date(date).toLocaleDateString("en-US", options)
}

/**
 * Format a date for sidebar display (shorter format).
 * @param date - ISO date string or Date object
 */
export function formatDateShort(date: string | Date): string {
	return formatDate(date, { month: "short", day: "numeric" })
}

/**
 * Generate a view transition ID from an href or title.
 * Used for coordinating view transitions between cards and detail pages.
 * @param href - Optional href to extract slug from
 * @param title - Fallback title for non-link cards
 */
export function getViewTransitionId(href?: string, title?: string): string {
	if (href) {
		const slug = href.split("/").pop()
		return `-writing-${slug}`
	}
	if (title) {
		return title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
	}
	return ""
}

type FlyAndScaleParams = {
	y?: number
	x?: number
	start?: number
	duration?: number
}

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node)
	const transform = style.transform === "none" ? "" : style.transform

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA
		const [minB, maxB] = scaleB

		const percentage = (valueA - minA) / (maxA - minA)
		const valueB = percentage * (maxB - minB) + minB

		return valueB
	}

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str
			return str + `${key}:${style[key]};`
		}, "")
	}

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: t => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0])
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0])
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1])

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t,
			})
		},
		easing: cubicOut,
	}
}
