export interface BlogPost {
	title: string
	date: string
	description?: string
	tags?: string[]
	published?: boolean
	/** Site path of a hand-made 1200x630 social card; a generated one is used otherwise. */
	image?: string
	slug: string
}

export interface PostWithContent extends BlogPost {
	content: string
}

export interface PostFrontmatter {
	title: string
	date: string
	description?: string
	tags?: string[]
	published?: boolean
	image?: string
}
