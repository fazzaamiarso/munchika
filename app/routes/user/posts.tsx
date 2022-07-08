import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { commitSession, getUserId, getUserSession, requireUserId } from '~/utils/session.server';
import { getPostWithTrack } from '~/utils/geniusApi.server';
import { supabase } from '~/utils/supabase.server';
import { AnnotationIcon, PlusIcon } from '@heroicons/react/outline';
import { PostCard, PostWithTrack } from '~/components/post-card';
import { Post } from '~/types/database';

export function meta() {
  return {
    title: 'Munchika | My Posts',
    description: 'Manage all your posts here',
  };
}

type LoaderData = {
  postsData: PostWithTrack[];
};
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const { data: userPosts } = await supabase
    .from<Post>('post')
    .select('*, user!post_author_id_fkey (username, avatar_url)')
    .order('created_at', { ascending: false })
    .eq('author_id', userId);

  if (!userPosts) return { postsData: [] };
  const postsData = await getPostWithTrack(userPosts);
  return { postsData };
};

export const action: ActionFunction = async ({ request }) => {
  const userSession = await getUserSession(request);
  const userId = await getUserId(request);
  const formData = await request.formData();
  const actionType = formData.get('action');
  const postId = formData.get('postId');

  if (actionType === 'delete') {
    const { error } = await supabase.from('post').delete().match({ id: postId, author_id: userId });
    if (error) userSession.flash('delete', 'Ooops.. delete failed!');
    else userSession.flash('delete', 'Delete successful!');
    return json(null, { headers: { 'Set-Cookie': await commitSession(userSession) } });
  }

  return null;
};

export default function UserPost() {
  const { postsData } = useLoaderData<LoaderData>();

  return (
    <div className="mt-6 flex min-h-screen w-full flex-col items-center">
      {postsData.length ? (
        <ul className=" w-full space-y-4 px-4">
          {postsData.map(post => {
            return (
              <PostCard
                key={post.id}
                currentUserId={post.author_id}
                postWithUser={post}
                displayTrack
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
              <p className=" text-gray-400">Get started by creating new post.</p>
            </div>
            <Link
              to="/post/select"
              className="flex items-center space-x-1 rounded-sm bg-blue-500 px-4 py-2 font-semibold text-white"
            >
              <PlusIcon className="h-4" /> <span className="sr-only">Add a</span>{' '}
              <span>New Post</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
