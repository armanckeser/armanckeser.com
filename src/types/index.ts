export interface BlogPost {
	title: string
	date: string
	description?: string
	tags?: string[]
	published?: boolean
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
}
