import { ArrowRightIcon } from '@heroicons/react/solid';
import { useLoaderData, Form } from 'remix';
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

  if (!data)
    return (
      <div className="flex flex-col items-center">
        <div className="text-xl ">👆</div>
        <h2 className="text-xl font-semibold">Start searching there</h2>
      </div>
    );
  return (
    <>
      <ul>
        {data.length ? (
          data.map(track => {
            return (
              <li
                key={track.result.id}
                className="flex w-full items-center gap-4 leading-none"
              >
                <img
                  className="h-12"
                  src={track.result.song_art_image_url}
                  alt={track.result.title}
                />
                <div className="flex flex-col items-start">
                  <h3 className="text-semibold sm:text-md text-sm line-clamp-2">
                    {track.result.title}
                  </h3>
                  <p className="text-xs sm:text-sm">
                    {track.result.primary_artist.name}
                  </p>
                </div>
                <Form action="/post/new" method="get" className="group ml-auto">
                  <button
                    name="trackId"
                    value={track.result.id}
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-gray-600 ring-1 ring-gray-300"
                    type="submit"
                  >
                    Details
                    <ArrowRightIcon className="h-3 transition-transform group-hover:translate-x-1" />
                  </button>
                </Form>
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
