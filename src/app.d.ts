// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	// biome-ignore lint/style/noNamespace: Required for SvelteKit type declarations
	namespace App {
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Error {
			code: string
			message: string
			path?: string
		}
	}
}

export {}
