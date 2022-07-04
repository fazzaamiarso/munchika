import { ArrowRightIcon } from '@heroicons/react/solid';
import { useEffect, useState, useRef } from 'react';
import { redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData, useTransition } from "@remix-run/react";
import { fetchFromGenius } from '../../utils/geniusApi.server';

export const loader = async ({ request }) => {
  const newUrl = new URL(request.url);
  const searchTerm = newUrl.searchParams.get('term');
  const currPage = newUrl.searchParams.get('currPage') ?? 1;
  const actionType = newUrl.searchParams.get('action');

  if (actionType === 'clear') return redirect('/search/track');

  if (searchTerm === null) return {};
  const response = await fetchFromGenius(`search?q=${searchTerm}&per_page=10&page=${currPage}`);

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
  const currPage = useRef(2);
  const initial = useRef(true);
  const isPending =
    transition.type === 'loaderSubmission' || transition.type === 'loaderSubmissionRedirect';

  const handleLoadMore = () => {
    fetcher.load(`/search/track?term=${searchTerm}&currPage=${currPage.current}`);
    initial.current = false;
    currPage.current = currPage.current + 1;
  };

  const useFocusOnFirstLoadedContent = list => {
    useEffect(() => {
      if (list.length === 0 || !list) return;
      const listLengthDivided = Math.floor(list.length / 10) - 1;
      const contentToFocus =
        listLengthDivided === 0
          ? document.getElementById('link-0')
          : document.getElementById('link-' + String(listLengthDivided * 10 + 1));
      contentToFocus?.focus();
    }, [list]);
  };

  useFocusOnFirstLoadedContent(trackList || []);

  useEffect(() => {
    if (transition.type === 'loaderSubmission') {
      initial.current = true;
      currPage.current = 2;
      return;
    }

    if (fetcher.type === 'done' && !initial.current) {
      setTrackList(prev => [...prev, ...fetcher.data.data]);
      return;
    }
    if (transition.type === 'idle' && initial.current) {
      setTrackList(data);
      currPage.current = 2;
    }
  }, [fetcher, transition, data]);

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
          trackList.map((track, index) => {
            return (
              <li
                key={`${track.result.id}${Math.random() * 100}`}
                className="flex w-full items-center gap-4 py-2 leading-none"
              >
                <img
                  height="48px"
                  width="48px"
                  className="h-12"
                  src={track.result.song_art_image_thumbnail_url}
                  alt=""
                />
                <div className="flex flex-col items-start">
                  <p className="sm:text-md text-sm font-semibold line-clamp-2">
                    {track.result.title}
                  </p>
                  <p className="text-xs text-gray-600 sm:text-sm">
                    {track.result.primary_artist.name}
                  </p>
                </div>
                <Link
                  className="group ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-xs text-gray-600 ring-1 ring-gray-300 focus:ring-black"
                  to={`/track/${track.result.id}`}
                  prefetch="intent"
                  id={`link-${index}`}
                  aria-labelledby={track.result.id}
                >
                  {transition.state === 'loading' &&
                  transition.location.pathname === `/track/${track.result.id}`
                    ? 'Loading..'
                    : 'Details'}
                  <ArrowRightIcon className="h-3 transition-transform group-hover:translate-x-1" />
                  <span className="sr-only" id={track.result.id} aria-live="polite">
                    {transition.state === 'loading' &&
                    transition.location.pathname === `/track/${track.result.id}`
                      ? 'Loading'
                      : `Go to ${track.result.title} feed`}
                  </span>
                </Link>
              </li>
            );
          })
        ) : (
          <div className="mt-12 flex flex-col items-center">
            <p className="text-lg font-bold">Whoops... No matching song found</p>
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
      {fetcher.data?.data.length < 10 && !initial.current ? null : (
        <button
          className="self-center rounded-full bg-white  px-3  py-1 text-blue-600 ring-2 ring-blue-600 transition-colors  hover:bg-blue-600 hover:text-white disabled:opacity-75"
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
