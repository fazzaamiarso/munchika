import { useLoaderData, Link } from 'remix';
import { supabase } from '../../../server/db.server';

export const loader = async ({ request }) => {
  const newUrl = new URL(request.url);
  const searchTerm = newUrl.searchParams.get('term');

  if (searchTerm === null) {
    const { data } = await supabase
      .from('post')
      .select()
      .order('created_at', { ascending: false });

    const fetchTrack = trackId => {
      return fetch(`https://api.genius.com/songs/${trackId}`, {
        headers: {
          Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
        },
      });
    };
    const tracks = data.map(async post => {
      const response = await fetchTrack(post.track_id);
      const json = await response.json();
      const track = json.response.song;
      return {
        ...post,
        title: track.title,
        artist: track.primary_artist.name,
        thumbnail: track.song_art_image_thumbnail_url,
      };
    });
    const trackDatas = await Promise.all(tracks);
    return {
      data: trackDatas,
    };
  }
  return {};
};

export default function SearchPost() {
  const { data } = useLoaderData();

  return (
    <>
      <h2 className="">Search post</h2>
      <ul className="space-y-12">
        {data.map(post => {
          return (
            <li key={post.id} className="max-w-lg">
              <div className="mb-8 flex items-center gap-4 shadow-md">
                <img src={post.thumbnail} alt={post.title} className="h-20" />
                <div className="">
                  <p className="font-semibold">{post.title}</p>
                  <p className="">{post.artist}</p>
                  <Link
                    to={`/track/${post.track_id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Go to song&apos;s feed ➡
                  </Link>
                </div>
              </div>
              <h4 className="text-lg font-semibold">Featured lyrics</h4>
              <p>{post.lyrics}</p>
              <h4 className="text-lg font-semibold">Thought</h4>
              <p>{post.thought}</p>
            </li>
          );
        })}
      </ul>
    </>
  );
}
