import { Link, useLoaderData } from 'remix';
import { getUserId } from '../../utils/session.server';
import {
  fetchFromGenius,
  removeTranslation,
} from '../../utils/geniusApi.server';
import { supabase } from '../../../server/db.server';
import { AnnotationIcon, PlusIcon } from '@heroicons/react/outline';
import { PostMenu } from '../../components/post-menu';

export const loader = async ({ request }) => {
  const userId = await getUserId(request);

  const { data: userPosts } = await supabase
    .from('post')
    .select('*')
    .eq('author_id', userId);

  const tracks = userPosts.map(async post => {
    const response = await fetchFromGenius(`songs/${post.track_id}`);
    const track = response.song;
    return {
      ...post,
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
    <main>
      {postsData.length ? (
        <ul className="flex w-full flex-col items-center px-4 ">
          {postsData.map(post => {
            return (
              <li key={post.id} className="max-w-lg rounded-md p-4 shadow-lg ">
                <div className="flex w-full justify-end ">
                  <PostMenu postId={postsData.id} />
                </div>
                <div className="mb-4 flex items-center gap-4 shadow-md transition-transform hover:-translate-y-1 hover:cursor-pointer hover:shadow-lg">
                  <img src={post.thumbnail} alt={post.title} className="h-24" />
                  <div className="pr-4">
                    <p className="text-sm font-semibold">{post.title}</p>
                    <p className="text-xs">{post.artist}</p>
                    <Link
                      to={`/track/${post.track_id}`}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Go to song&apos;s feed ➡
                    </Link>
                  </div>
                </div>
                <section className="space-y-4">
                  <div>
                    <h4 className="text-md font-semibold">Featured lyrics</h4>
                    <p className="text-justify indent-8">{post.lyrics}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-semibold">Thought</h4>
                    <p className="text-justify indent-8">{post.thought}</p>
                  </div>
                </section>
              </li>
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