import { useLoaderData, Link } from 'remix';
import { supabase } from '../../server/db.server';
import { fetchFromGenius } from '../utils/geniusApi.server';
import invariant from 'tiny-invariant';
import { getUserId } from '../utils/session.server';
import { DotsHorizontalIcon, PlusIcon } from '@heroicons/react/solid';
import { EmojiSadIcon } from '@heroicons/react/outline';

export const loader = async ({ params, request }) => {
  invariant(params.trackId, 'Expected params.trackId');
  const userId = await getUserId(request);

  const track = await fetchFromGenius(`songs/${params.trackId}`);
  if (!track)
    throw new Response(`There is no song with id : ${params.trackId}`, {
      status: 404,
    });
  const trackData = track.song;

  const { data: trackPosts } = await supabase
    .from('post')
    .select('*, user (username, avatar_url)')
    .eq('track_id', params.trackId)
    .limit(5);

  return {
    trackData: {
      title: trackData.title,
      artist: trackData.primary_artist.name,
      geniusUrl: trackData.url,
      thumbnail: trackData.song_art_image_thumbnail_url,
      release_date: trackData.release_date,
      id: trackData.id,
    },
    trackPosts,
    userId,
  };
};

export default function TrackDetails() {
  const { trackData, trackPosts, userId } = useLoaderData();

  return (
    <section className="mx-auto ">
      <div className="flex flex-col items-center gap-4 border-b-2 border-gray-200 p-8 ">
        <img src={trackData.thumbnail} alt={trackData.title} className="h-40" />
        <div className="flex flex-col items-center gap-2 leading-none">
          <h2 className="text-center text-lg font-bold">{trackData.title}</h2>
          <p className="text-sm">{trackData.artist}</p>
          <p className="text-gray-500">
            Release date : {trackData.release_date}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 pt-4 leading-none ">
          <a
            href={trackData.geniusUrl}
            className="text-xs text-blue-500 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Chekout the full lyrics on genius
          </a>
          <span className="text-xs font-semibold text-gray-400">OR</span>
          <div className="flex items-center gap-2 ">
            <span className="text-xs  ">Have thought for this song?</span>
            <Link
              to={`/post/new?trackId=${trackData.id}`}
              className="flex items-center space-x-1 rounded-sm bg-blue-500 px-2  py-1 text-xs text-white "
            >
              Add thought
            </Link>
          </div>
        </div>
      </div>
      {trackPosts.length ? (
        <ul className="flex flex-col items-center">
          {trackPosts.map(post => {
            return (
              <li
                key={post.id}
                className="w-10/12 max-w-lg space-y-4 rounded-md p-4 shadow-lg  "
              >
                <div className="flex w-full items-center gap-2 ">
                  <img
                    src={post.user.avatar_url}
                    alt={post.user.username}
                    className="aspect-square h-8 rounded-full bg-gray-200"
                  />
                  <div className="flex flex-col items-start gap-1">
                    <p>{post.user.username}</p>
                    <span className="text-xs text-gray-400">
                      {post.created_at}
                    </span>
                  </div>
                  {userId === post.author_id ? (
                    <DotsHorizontalIcon className="ml-auto h-4" />
                  ) : null}
                </div>
                <div>
                  <h4 className="font-semibold">Featured lyrics</h4>
                  <p className="indent-8">{post.lyrics}</p>
                </div>
                <div>
                  <h4 className=" font-semibold">Thought</h4>
                  <p className="indent-8">{post.thought}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="my-12 flex w-full items-center justify-center">
          <div className="flex w-max flex-col items-center space-y-6">
            <div className="flex flex-col items-center ">
              <EmojiSadIcon className="h-12 text-gray-400" />
              <h2 className="mt-2 text-lg font-semibold">No Posts </h2>
              <p className=" text-gray-400">Be the first one to post.</p>
            </div>
            <Link
              to={`/post/new?trackId=${trackData.id}`}
              className="flex items-center space-x-1 rounded-sm bg-blue-500 px-4 py-2 font-semibold text-white"
            >
              <PlusIcon className="h-4" /> <span>New Post</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

export function CatchBoundary() {
  return (
    <div className="flex h-full w-full flex-col items-center">
      <h2 className="text-2xl font-bold">
        Whoopsie.. that page doesn&apos;t exist
      </h2>
      <Link to="/" className="bg-blue-500 font-semibold hover:underline">
        Go back home
      </Link>
    </div>
  );
}
