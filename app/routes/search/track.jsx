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
  const fetcher = useFetcher();
  const transition = useTransition();
  const [trackList, setTrackList] = useState(data);
  const [currPage, setCurrPage] = useState(2);
  const [initial, setInitial] = useState(true);
  const isPending =
    transition.type === 'loaderSubmission' ||
    transition.type === 'loaderSubmissionRedirect';

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

  if (isPending)
    return (
      <>
        <TrackSkeleton />
        <TrackSkeleton />
        <TrackSkeleton />
        <TrackSkeleton />
        <TrackSkeleton />
      </>
    );
  if (!trackList)
    return (
      <div className="mt-12 flex min-h-screen flex-col items-center ">
        <h2 className="text-center text-xl font-semibold">
          Start searching a song you would like to find
        </h2>
      </div>
    );
  return (
    <div className="flex flex-col gap-4">
      <ul className=" min-h-screen divide-y divide-gray-200 ">
        {trackList?.length ? (
          trackList.map(track => {
            return (
              <li
                key={`${track.result.id}${Math.random() * 100}`}
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
                  {transition.state === 'loading' &&
                  transition.location.pathname === `/track/${track.result.id}`
                    ? 'Loading..'
                    : 'Details'}
                  <ArrowRightIcon className="h-3 transition-transform group-hover:translate-x-1" />
                </Link>
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
        {fetcher.type === 'normalLoad' ? (
          <>
            <TrackSkeleton />
            <TrackSkeleton />
            <TrackSkeleton />
          </>
        ) : null}
      </ul>
      {fetcher.data?.data.length < 10 && !initial ? null : (
        <button
          className="self-center rounded-full  px-3  py-1 text-blue-500 ring-2 ring-blue-500 transition-colors  hover:bg-blue-500 hover:text-white disabled:opacity-75"
          onClick={handleLoadMore}
        >
          {fetcher.state === 'loading' || fetcher.state === 'submitting'
            ? 'Loading..'
            : 'Load More'}
        </button>
      )}
    </div>
  );
}

const TrackSkeleton = () => {
  return (
    <div className="flex w-full animate-pulse items-center gap-4 py-2 leading-none">
      <div className="aspect-square h-12 bg-gray-300" />
      <div className="flex w-full flex-col items-start gap-1">
        <div className="h-4 w-7/12 bg-gray-300" />
        <div className="h-3 w-5/12 bg-gray-300" />
      </div>
    </div>
  );
};
