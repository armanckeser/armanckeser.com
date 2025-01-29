import type { PageLoad } from './$types';

interface BlogPost {
  title: string;
  description: string;
  date: string;
  slug: string;
}

export const load: PageLoad = async () => {
  const posts = await Promise.all(
    Object.entries(import.meta.glob('/src/routes/blog/*.svx', { eager: true }))
      .map(async ([path, post]: [string, any]) => {
        const slug = path.split('/').pop()?.replace('.svx', '') || '';
        return {
          ...post.metadata,
          slug: `/blog/${slug}`,
        };
      })
  );

  // Sort posts by date, most recent first
  const sortedPosts = posts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    posts: sortedPosts
  };
}; 