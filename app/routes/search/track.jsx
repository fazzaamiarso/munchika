import { useLoaderData, Link } from 'remix';
import { fetchFromGenius } from '../../utils/geniusApi.server';

export const loader = async ({ request }) => {
  const newUrl = new URL(request.url);
  const searchTerm = newUrl.searchParams.get('term');

  if (searchTerm === null) return {};
  const response = await fetchFromGenius(`search?q=${searchTerm}`);

  const data = response.hits;
  return {
    data,
  };
};

export default function SearchTrack() {
  const { data } = useLoaderData();

  if (!data) return <p>No Data yet!</p>;
  return (
    <>
      <h2 className="text-2xl">Search Track</h2>
      <ul>
        {data.length ? (
          data.map(track => {
            return (
              <li key={track.result.id} className="">
                <img
                  src={track.result.song_art_image_url}
                  alt={track.result.title}
                  className="h-40"
                />
                <section className="flex">
                  <h3 className="text-lg">{track.result.title}</h3>
                  <p>{track.result.primary_artist.name}</p>
                  <Link
                    to={`/track/${track.result.id}`}
                    className="text-semibold text-blue-500 hover:underline"
                  >
                    Go to song feed
                  </Link>
                </section>
              </li>
            );
          })
        ) : (
          <p className="text-lg">Whoops... No matching song found</p>
        )}
      </ul>
    </>
  );
}
