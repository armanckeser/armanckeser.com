import type { PageLoad } from './$types';
import { getPosts } from '$lib/utils/posts';

interface BlogPost {
  title: string;
  description: string;
  date: string;
  slug: string;
}

export const load: PageLoad = async () => {
  return {
    posts: await getPosts()
  };
}; 
