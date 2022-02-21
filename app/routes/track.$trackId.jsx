import { useLoaderData } from 'remix';
import { supabase } from '../../server/db.server';
import { fetchFromGenius } from '../utils/geniusApi.server';

export const loader = async ({ params }) => {
  const track = await fetchFromGenius(`songs/${params.trackId}`);
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
