import { useLoaderData } from 'remix';

export const loader = async ({ params }) => {
  const url = `https://api.genius.com/songs/${params.trackId}`;
  const track = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
    },
  });
  const response = await track.json();
  const trackData = response.response.song;

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
