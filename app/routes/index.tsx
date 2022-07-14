import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { supabase } from '../utils/supabase.server';
import { getPostWithTrack } from '../utils/geniusApi.server';
import { PostCard } from '../components/post-card';
import { LoaderFunction } from '@remix-run/node';
import type { Post } from '~/types/database';

type PostWithTrack = Post & {
  thumbnail: string;
  artist: string;
  title: string;
};
type LoaderData = {
  posts: PostWithTrack[];
};

export const loader: LoaderFunction = async () => {
  const { data, error } = await supabase
    .from<Post>('post')
    .select('*, user!post_author_id_fkey (username, avatar_url)')
    .limit(7)
    .order('created_at', { ascending: false });
  if (error) {
    throw json({ message: 'Failed to get data' }, 500);
  }
  const posts = await getPostWithTrack(data);
  return { posts };
};

export default function Index() {
  const { posts } = useLoaderData<LoaderData>();

  return (
    <main id="main" className="mx-auto my-6 flex w-11/12 max-w-lg flex-col items-center">
      <h1 className="text-3xl font-bold md:text-4xl">See Other&apos;s Thought</h1>
      <p className="max-w-[50ch] text-center text-gray-600">
        Find song that actually help them (maybe they can help you too) or{' '}
        <Link to="/post/select" className="font-semibold text-blue-600 hover:underline">
          add a thought
        </Link>{' '}
        yourself to help others.
      </p>
      <p className="mb-6 pt-6 font-semibold">Check some of people&apos;s thought here</p>
      <ul className="w-full space-y-8">
        {posts.map(post => {
          return <PostCard key={post.id} posts={post} currentUserId={null} displayTrack />;
        })}
      </ul>
    </main>
  );
}
