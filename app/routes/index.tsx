import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { supabase } from '../utils/supabase.server';
import { getPostWithTrack, Post } from '../utils/geniusApi.server';
import { PostCard } from '../components/post-card';
import { LoaderFunction } from '@remix-run/node';

type LoaderData = {
  trackDatas: Post[];
};

export const loader: LoaderFunction = async () => {
  const { data, error } = await supabase
    .from<LoaderData['trackDatas'][number]>('post')
    .select('*, user!post_author_id_fkey (username, avatar_url)')
    .limit(7)
    .order('created_at', { ascending: false });
  if (error) {
    console.log(error);
    throw json({ message: 'Failed to get data' }, 500);
  }
  const trackDatas = await getPostWithTrack(data);
  return { trackDatas };
};

export default function Index() {
  const { trackDatas } = useLoaderData<LoaderData>();

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
        {trackDatas.map(post => {
          return <PostCard key={post.id} postWithUser={post} currentUserId={null} />;
        })}
      </ul>
    </main>
  );
}