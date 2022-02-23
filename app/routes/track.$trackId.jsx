import { useLoaderData, Link } from 'remix';
import { supabase } from '../../server/db.server';
import { fetchFromGenius } from '../utils/geniusApi.server';
import invariant from 'tiny-invariant';

export const loader = async ({ params }) => {
  invariant(params.trackId, 'Expected params.trackId');

  const track = await fetchFromGenius(`songs/${params.trackId}`);
  if (!track)
    throw new Response(`There is no song with id : ${params.trackId}`, {
      status: 404,
    });
  const trackData = track.song;

  const { data: trackPosts } = await supabase
    .from('post')
    .select('*')
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
  };
};

export default function TrackDetails() {
  const { trackData, trackPosts } = useLoaderData();

  return (
    <section className="mx-auto ">
      <div className="flex flex-col items-center border-b-2 border-black p-8 ">
        <img src={trackData.thumbnail} alt={trackData.title} className="h-40" />
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-center text-lg font-bold">{trackData.title}</h2>
          <p>{trackData.artist}</p>
          <p>Release date : {trackData.release_date}</p>
          <a
            href={trackData.geniusUrl}
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Chekout the full lyrics on genius
          </a>
          <Link to={`/post/new?trackId=${trackData.id}`}>
            Add thought for this song
          </Link>
        </div>
      </div>
      <div className="">
        <ul className="flex flex-col items-center">
          {trackPosts.map(post => {
            return (
              <li
                key={post.id}
                className="w-10/12 max-w-lg space-y-4 rounded-md p-4 shadow-lg  "
              >
                <div>
                  <h4 className="text-lg font-semibold">Featured lyrics</h4>
                  <p className="indent-8">{post.lyrics}</p>
                </div>
                <div>
                  <h4 className=" text-lg font-semibold">Thought</h4>
                  <p className="indent-8">{post.thought}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
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
