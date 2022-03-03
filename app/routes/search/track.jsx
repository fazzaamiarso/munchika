import { ArrowRightIcon } from '@heroicons/react/solid';
import { useEffect, useState } from 'react';
import {
  useLoaderData,
  Link,
  useFetcher,
  useTransition,
  redirect,
} from 'remix';
import { fetchFromGenius } from '../../utils/geniusApi.server';

export const loader = async ({ request }) => {
  const newUrl = new URL(request.url);
  const searchTerm = newUrl.searchParams.get('term');
  const currPage = newUrl.searchParams.get('currPage') ?? 1;
  const actionType = newUrl.searchParams.get('_action');

  if (actionType === 'clear') return redirect('/search/track');

  if (searchTerm === null) return {};
  const response = await fetchFromGenius(
    `search?q=${searchTerm}&per_page=10&page=${currPage}`,
  );

  const data = response.hits;
  return {
    data,
    searchTerm,
    prevPage: currPage,
  };
};

export default function SearchTrack() {
  const { data, searchTerm } = useLoaderData();
  const transition = useTransition();
  const fetcher = useFetcher();
  const [trackList, setTrackList] = useState(data);
  const [currPage, setCurrPage] = useState(2);
  const [initial, setInitial] = useState(true);

  const handleLoadMore = () => {
    fetcher.load(`/search/track?term=${searchTerm}&currPage=${currPage}`);
    setInitial(false);
    setCurrPage(prev => prev + 1);
  };

  useEffect(() => {
    if (transition.type === 'loaderSubmission') return setInitial(true);

    if (fetcher.type === 'done' && !initial) {
      setTrackList(prev => [...prev, ...fetcher.data.data]);
      return;
    }
    if (transition.type === 'idle' && initial) {
      setTrackList(data);
    }
  }, [fetcher, transition, data, initial]);

  if (!trackList)
    return (
      <div className="mt-12 flex min-h-screen flex-col items-center ">
        <h2 className="text-center text-xl font-semibold">
          Start searching a song you would like to find
        </h2>
      </div>
    );
  return (
    <>
      {trackList.length ? (
        <div className="flex flex-col">
          <ul className=" min-h-screen divide-y divide-gray-200 ">
            {trackList.map(track => {
              return (
                <li
                  key={`${track.result.id}${Date.now()}`}
                  className="flex w-full items-center gap-4 py-2 leading-none"
                >
                  <img
                    className="h-12"
                    src={track.result.song_art_image_thumbnail_url}
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
                  <Link
                    className="group ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-xs text-gray-600 ring-1 ring-gray-300"
                    to={`/track/${track.result.id}`}
                    prefetch="intent"
                  >
                    Details
                    <ArrowRightIcon className="h-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              );
            })}
          </ul>
          {fetcher.data?.data.length < 10 ? null : (
            <button
              className="mt-4 self-center rounded-full bg-blue-600 px-3 py-1 font-semibold text-white hover:opacity-90 disabled:opacity-75"
              onClick={handleLoadMore}
            >
              {fetcher.state === 'loading' || fetcher.state === 'submitting'
                ? 'Loading..'
                : 'Load More'}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center">
          <p className="text-lg font-bold">Whoops... No matching song found</p>
          <p className="">Try another song</p>
        </div>
      )}
    </>
  );
}
