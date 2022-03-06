import { Link, useLoaderData } from 'remix';
import { getUserId } from '../../utils/session.server';
import { getPostWithTrack } from '../../utils/geniusApi.server';
import { countReaction, supabase } from '../../utils/supabase.server';
import { AnnotationIcon, PlusIcon } from '@heroicons/react/outline';
import { PostCard } from '../../components/post-card';

export function meta() {
  return {
    title: 'Munchika | My Posts',
    description: 'Manage all your posts here',
  };
}

export const loader = async ({ request }) => {
  const userId = await getUserId(request);

  const { data: userPosts } = await supabase
    .from('post')
    .select('*, user!post_author_id_fkey (username, avatar_url)')
    .eq('author_id', userId);

  const countedPosts = await countReaction(userPosts);
  const postsData = await getPostWithTrack(countedPosts);
  return { postsData };
};

export const action = async ({ request }) => {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const actionType = formData.get('action');
  const postId = formData.get('postId');

  if (actionType === 'delete')
    await supabase
      .from('post')
      .delete()
      .match({ id: postId, author_id: userId });
  if (actionType === 'reaction') {
    const { data: haveLiked } = await supabase
      .from('post_reaction')
      .select('*')
      .eq('sender_id', userId)
      .maybeSingle();
    if (haveLiked)
      return await supabase
        .from('post_reaction')
        .delete()
        .match({ sender_id: userId, post_id: postId });

    await supabase
      .from('post_reaction')
      .insert([{ post_id: postId, sender_id: userId }]);
  }

  return null;
};

export default function UserPost() {
  const { postsData } = useLoaderData();

  return (
    <main className="mt-6 flex min-h-screen w-full flex-col items-center">
      {postsData.length ? (
        <ul className=" space-y-4 px-4">
          {postsData.map(post => {
            return (
              <PostCard
                key={post.id}
                currentUserId={post.author_id}
                postWithUser={post}
              />
            );
          })}
        </ul>
      ) : (
        <div className="my-12 flex w-full items-center justify-center">
          <div className="flex w-max flex-col items-center space-y-6">
            <div className="flex flex-col items-center ">
              <AnnotationIcon className="h-12 text-gray-400" />
              <h2 className="mt-2 text-lg font-semibold">No Posts </h2>
              <p className=" text-gray-400">
                Get started by creating new post.
              </p>
            </div>
            <Link
              to="/post/select"
              className="flex items-center space-x-1 rounded-sm bg-blue-500 px-4 py-2 font-semibold text-white"
            >
              <PlusIcon className="h-4" /> <span>New Post</span>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
