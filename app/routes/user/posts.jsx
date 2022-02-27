import { Link, useLoaderData } from 'remix';
import { getUserId } from '../../utils/session.server';
import {
  fetchFromGenius,
  removeTranslation,
} from '../../utils/geniusApi.server';
import { supabase } from '../../../server/db.server';
import { AnnotationIcon, PlusIcon } from '@heroicons/react/outline';
import { PostCard } from '../../components/post-card';

export const loader = async ({ request }) => {
  const userId = await getUserId(request);

  const { data: userPosts } = await supabase
    .from('post')
    .select('*, user (username, avatar_url)')
    .eq('author_id', userId);

  const tracks = userPosts.map(async post => {
    const response = await fetchFromGenius(`songs/${post.track_id}`);
    const track = response.song;
    return {
      ...post,
      avatar: post.user.avatar_url,
      username: post.user.username,
      title: removeTranslation(track.title),
      artist: track.primary_artist.name,
      thumbnail: track.song_art_image_thumbnail_url,
    };
  });
  const postsData = await Promise.all(tracks);
  return {
    postsData,
  };
};

export const action = async ({ request }) => {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const postId = formData.get('postId');
  await supabase.from('post').delete().match({ id: postId, author_id: userId });

  return null;
};

export default function UserPost() {
  const { postsData } = useLoaderData();

  return (
    <main className="mt-6 flex w-full flex-col items-center">
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
