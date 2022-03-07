import { useLoaderData, Link, useNavigate, json } from 'remix';
import { checkReaction, supabase } from '../utils/supabase.server';
import { fetchFromGenius } from '../utils/geniusApi.server';
import invariant from 'tiny-invariant';
import { getUserId } from '../utils/session.server';
import { PlusIcon } from '@heroicons/react/solid';
import { EmojiSadIcon } from '@heroicons/react/outline';
import { ExternalLinkIcon, ArrowLeftIcon } from '@heroicons/react/solid';
import { PostCard } from '../components/post-card';

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
    .select('*, user!post_author_id_fkey (username, avatar_url)')
    .eq('track_id', params.trackId)
    .limit(5);

  const countedPosts = await checkReaction(trackPosts, userId);

  return json({
    trackData: {
      title: trackData.title,
      artist: trackData.primary_artist.name,
      geniusUrl: trackData.url,
      thumbnail: trackData.song_art_image_thumbnail_url,
      bgImage: trackData.song_art_image_url,
      release_date: trackData.release_date,
      id: trackData.id,
    },
    trackPosts: countedPosts,
    userId,
  });
};

export default function TrackDetails() {
  const { trackData, trackPosts, userId } = useLoaderData();
  const navigate = useNavigate();

  return (
    <section className="mx-auto ">
      <div className="relative flex  flex-col items-center border-b-2 border-gray-200 p-8 text-white md:gap-4">
        <button
          className="group absolute left-1/4 z-30 hidden rounded-full p-2 ring-1 ring-gray-300 sm:block"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="h-4 transition-transform group-hover:-translate-x-1" />
        </button>
        <div className="absolute inset-0 h-full w-full overflow-hidden  ">
          <img src={trackData.bgImage} className="h-full w-full object-cover" />
          <div className="absolute inset-0 h-full w-full bg-black/60"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <img
            src={trackData.thumbnail}
            alt={trackData.title}
            className="h-40 ring-2 ring-black/10 drop-shadow-md"
          />
          <div className="relative flex flex-col items-center gap-2 leading-none ">
            <div className="absolute inset-0 -z-10 h-full w-full bg-black/20 blur-xl " />
            <h2 className="text-center text-lg font-bold ">
              {trackData.title}
            </h2>
            <p className="text-gray-200">{trackData.artist}</p>
            <p className="">Release date : {trackData.release_date}</p>
          </div>
        </div>
        <div className="relative z-10  flex flex-col items-center gap-2 pt-4  text-xs leading-none sm:text-base md:flex-row md:gap-4">
          <div className="absolute inset-0 -z-10 h-full w-full bg-black/20 blur-xl " />
          <a
            href={trackData.geniusUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-white underline hover:no-underline"
          >
            Check it out on Genius <ExternalLinkIcon className="h-4" />
          </a>
          <span className=" font-semibold ">OR</span>
          <div className="flex items-center gap-2 ">
            <span className="  ">Have thought for this song?</span>
            <Link
              to={`/post/new?trackId=${trackData.id}`}
              className="flex items-center space-x-1 rounded-sm bg-blue-500  px-2 py-1 text-white hover:opacity-90"
            >
              Add thought
            </Link>
          </div>
        </div>
      </div>
      {trackPosts.length ? (
        <main className="mx-auto flex w-11/12 flex-col items-center py-4">
          <ul className="space-y-4">
            {trackPosts.map(post => {
              const modifiedPost = {
                ...post,
                avatar: post.user.avatar_url,
                username: post.user.username,
              };
              return (
                <PostCard
                  key={post.id}
                  currentUserId={userId}
                  postWithUser={modifiedPost}
                  displayTrack={false}
                />
              );
            })}
          </ul>
        </main>
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
