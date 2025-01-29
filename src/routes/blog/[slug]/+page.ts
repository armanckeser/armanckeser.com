import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getPosts } from '$lib/utils/posts';

export const load: PageLoad = async ({ params }) => {
  try {
    const [post, posts] = await Promise.all([
      import(`../${params.slug}.svx`),
      getPosts()
    ]);
    
    return {
      content: post.default,
      posts,
      ...post.metadata
    };
  } catch (e) {
    throw error(404, `Blog post "${params.slug}" not found`);
  }
}; 