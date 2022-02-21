import { useLoaderData } from 'remix';
import { fetchFromGenius } from '../utils/geniusApi.server';

export const loader = async ({ params }) => {
  const track = await fetchFromGenius(`songs/${params.trackId}`);
  const trackData = track.song;

  return {
    trackData: {
      title: trackData.title,
      artist: trackData.primary_artist.name,
      geniusUrl: trackData.url,
      thumbnail: trackData.song_art_image_thumbnail_url,
      release_date: trackData.release_date,
    },
  };
};

export default function TrackDetails() {
  const { trackData } = useLoaderData();

  return (
    <section className="">
      <div className="flex">
        <img src={trackData.thumbnail} alt={trackData.title} className="h-40" />
        <div>
          <h2 className="text-lg">{trackData.title}</h2>
          <p>{trackData.artist}</p>
          <p>{trackData.release_date}</p>
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
      <div>POST FEED!!</div>
    </section>
  );
}
