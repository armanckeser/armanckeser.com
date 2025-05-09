import typography from "@tailwindcss/typography"
import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

/**
 * @type {import('tailwindcss').Config}
 * @see https://tailwindcss.com/docs/configuration
 *
 * Design system integrates CSS custom properties from app.css
 * - Color variables defined in :root and .dark selectors
 * - Animation system extends base Tailwind with project-specific motions
 */
const config: Config = {
	darkMode: ["class"],
	content: ["./src/**/*.{html,js,svelte,ts}"],
	safelist: ["dark"],
	theme: {
		container: {
			center: true,
			padding: "1rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: "hsl(var(--border) / <alpha-value>)",
				input: "hsl(var(--input) / <alpha-value>)",
				ring: "hsl(var(--ring) / <alpha-value>)",
				background: "hsl(var(--background) / <alpha-value>)",
				foreground: "hsl(var(--foreground) / <alpha-value>)",
				primary: {
					DEFAULT: "hsl(var(--primary) / <alpha-value>)",
					foreground:
						"hsl(var(--primary-foreground) / <alpha-value>)",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
					foreground:
						"hsl(var(--secondary-foreground) / <alpha-value>)",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
					foreground:
						"hsl(var(--destructive-foreground) / <alpha-value>)",
				},
				muted: {
					DEFAULT: "hsl(var(--muted) / <alpha-value>)",
					foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
				},
				accent: {
					DEFAULT: "hsl(var(--accent) / <alpha-value>)",
					foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
				},
				highlight: {
					DEFAULT: "hsl(var(--highlight) / <alpha-value>)",
					foreground:
						"hsl(var(--highlight-foreground) / <alpha-value>)",
				},
				popover: {
					DEFAULT: "hsl(var(--popover) / <alpha-value>)",
					foreground:
						"hsl(var(--popover-foreground) / <alpha-value>)",
				},
				card: {
					DEFAULT: "hsl(var(--card) / <alpha-value>)",
					foreground: "hsl(var(--card-foreground) / <alpha-value>)",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			fontFamily: {
				sans: [
					"Inter",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"Roboto",
					"Helvetica Neue",
					"Arial",
					"sans-serif",
				],
				mono: [
					"JetBrains Mono",
					"Menlo",
					"Monaco",
					"Consolas",
					"Liberation Mono",
					"Courier New",
					"monospace",
				],
				heading: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"fade-in": {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				"fade-out": {
					"0%": { opacity: "1" },
					"100%": { opacity: "0" },
				},
				"slide-in": {
					"0%": { transform: "translateY(10px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				"slide-out": {
					"0%": { transform: "translateY(0)", opacity: "1" },
					"100%": { transform: "translateY(10px)", opacity: "0" },
				},
				blink: {
					"from, to": { opacity: "0" },
					"50%": { opacity: "1" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fade-in 0.2s ease-out",
				"fade-out": "fade-out 0.2s ease-out",
				"slide-in": "slide-in 0.2s ease-out",
				"slide-out": "slide-out 0.2s ease-out",
				blink: "blink 1s ease-in-out infinite",
			},
			transitionTimingFunction: {
				"in-expo": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
				"out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
			},
			spacing: {
				paragraph: "1.2em",
				heading: "1.8rem",
				block: "2.5rem",
			},
		},
	},
	plugins: [typography, animate],
}

export default config
