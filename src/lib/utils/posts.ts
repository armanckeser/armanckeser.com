import type { BlogPost } from '../../types';

export async function getPosts(): Promise<BlogPost[]> {
  const posts = await Promise.all(
    Object.entries(import.meta.glob('/src/routes/blog/*.svx', { eager: true }))
      .map(([path, post]: [string, any]) => {
        const slug = path.split('/').pop()?.replace('.svx', '') || '';
        return {
          ...post.metadata,
          slug: `/blog/${slug}`,
        } as BlogPost;
      })
  );
  
  return posts.sort((a: BlogPost, b: BlogPost) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
} 
