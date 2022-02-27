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
      <div className="mt-12 flex min-h-screen flex-col items-center ">
        <h2 className="text-xl font-semibold">
          Start searching a song you would like to find
        </h2>
      </div>
    );
  return (
    <>
      <ul className=" min-h-screen divide-y divide-gray-200 ">
        {data.length ? (
          data.map(track => {
            return (
              <li
                key={track.result.id}
                className="flex w-full items-center gap-4 py-2 leading-none"
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
                  <p className="text-xs text-gray-400 sm:text-sm">
                    {track.result.primary_artist.name}
                  </p>
                </div>
                <Form
                  action={`/track/${track.result.id}`}
                  method="get"
                  className="group ml-auto"
                >
                  <button
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
          <div className="mt-12 flex flex-col items-center">
            <p className="text-lg font-bold">
              Whoops... No matching song found
            </p>
            <p className="">Try another song</p>
          </div>
        )}
      </ul>
    </>
  );
}
