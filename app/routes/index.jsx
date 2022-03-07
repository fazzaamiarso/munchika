import { Link, useLoaderData } from 'remix';
import { checkReaction, supabase } from '../utils/supabase.server';
import { getPostWithTrack } from '../utils/geniusApi.server';
import { PostCard } from '../components/post-card';

export const loader = async () => {
  const { data } = await supabase
    .from('post')
    .select('*, user!post_author_id_fkey (username, avatar_url)')
    .limit(7)
    .order('created_at', { ascending: false });
  const countedPosts = await checkReaction(data, null);
  const trackDatas = await getPostWithTrack(countedPosts);
  return { trackDatas };
};

export default function Index() {
  const { trackDatas } = useLoaderData();

  return (
    <>
      <section className="mx-auto flex w-11/12 max-w-2xl flex-col items-center gap-2 pt-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          See Other&apos;s Thought
        </h1>
        <p className="max-w-[50ch] text-gray-600">
          Find song that actually help them (maybe they can help you too) or{' '}
          <Link
            to="/post/select"
            className="font-semibold text-blue-500 hover:underline"
          >
            add a thought
          </Link>{' '}
          yourself to help others.
        </p>
        <p className="pt-6 font-semibold">
          Check some of people&apos;s thought here
        </p>
      </section>
      <main className="mx-auto mt-6 flex w-11/12 max-w-lg flex-col items-center">
        <ul className=" space-y-8">
          {trackDatas.map(post => {
            return (
              <PostCard
                key={post.id}
                postWithUser={post}
                currentUserId={null}
              />
            );
          })}
        </ul>
      </main>
    </>
  );
}
