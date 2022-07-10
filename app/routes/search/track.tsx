import { ArrowRightIcon } from '@heroicons/react/solid';
import { useEffect, useRef, useState } from 'react';
import { ErrorBoundaryComponent, json, LoaderFunction, redirect } from '@remix-run/node';
import { Link, useFetcher, useLoaderData, useTransition } from '@remix-run/react';
import { GeniusTrackData, searchGenius } from '../../utils/geniusApi.server';

type LoaderData = {
  data: Array<{
    result: GeniusTrackData;
  }>;
  searchTerm: string;
  nextPageData: Array<{
    result: GeniusTrackData;
  }>;
};

type FetchActions = 'loadMore' | 'clear' | 'search' | 'initialLoad';

const INITIAL_PAGE_TO_LOADMORE = 2;
export const loader: LoaderFunction = async ({ request }) => {
  const newUrl = new URL(request.url);
  const searchTerm = newUrl.searchParams.get('term');
  const currPage = newUrl.searchParams.get('currPage') ?? 1;
  const actionType: FetchActions = newUrl.searchParams.get('action') as FetchActions;

  if (actionType === 'clear') throw redirect('/search/track');
  if (actionType === 'search') {
    if (!searchTerm)
      throw Error(
        `Search action should be coupled with a search term. Instead, received: ${searchTerm}`,
      );
    const response = await searchGenius({
      perPage: 10,
      searchQuery: searchTerm,
    });
    const nextPageData = (
      await searchGenius({
        perPage: 1,
        currentPage: Number(currPage) + 1,
        searchQuery: searchTerm,
      })
    ).hits;
    return json<LoaderData>({ data: response.hits, nextPageData, searchTerm });
  }
  if (actionType === 'loadMore') {
    if (!searchTerm)
      throw Error(
        `loadMore action should be coupled with a search term. Instead, received: ${searchTerm}`,
      );
    const response = await searchGenius({
      perPage: 10,
      currentPage: Number(currPage),
      searchQuery: searchTerm,
    });
    const nextPageData = (
      await searchGenius({
        perPage: 1,
        currentPage: Number(currPage) + 1,
        searchQuery: searchTerm,
      })
    ).hits;
    return json<LoaderData>({ data: response.hits, nextPageData, searchTerm });
  }
  if (!searchTerm) return json({ data: [], searchTerm });
  const response = await searchGenius({
    perPage: 10,
    searchQuery: searchTerm,
  });
  return json({ data: response.hits, searchTerm });
};

const useFocusOnFirstLoadedContent = (list: any[], elementId: string) => {
  useEffect(() => {
    if (list.length === 0 || !list) return;
    const listLengthDivided = Math.floor(list.length / 10) - 1;
    const listItemIdx = String(listLengthDivided * 10 + 1);
    const contentToFocus =
      listLengthDivided === 0
        ? document.getElementById(`${elementId}-0`)
        : document.getElementById(`${elementId}-${listItemIdx}`);
    contentToFocus?.focus();
  }, [list, elementId]);
};

export default function SearchTrack() {
  const { data: initialData, searchTerm, nextPageData } = useLoaderData<LoaderData>();
  const fetcher = useFetcher<LoaderData>();
  const transition = useTransition();

  const [trackList, setTrackList] = useState(initialData);
  const transitionAction = transition.submission?.formData.get('action');
  const shouldLoadInitialData = transitionAction === 'clear' || transitionAction === 'search';

  const hasMoreData = nextPageData?.length || fetcher.data?.data.length;
  const currPage = useRef(INITIAL_PAGE_TO_LOADMORE);

  const handleLoadMore = () => {
    fetcher.load(`/search/track?term=${searchTerm}&currPage=${currPage.current}&action=loadMore`);
    currPage.current++;
  };
  useEffect(() => {
    if (initialData) setTrackList(initialData);
  }, [initialData]);

  useEffect(() => {
    if (hasMoreData && fetcher.type === 'done') {
      setTrackList(prev => [...prev, ...(fetcher.data?.data ?? [])]);
    }
  }, [hasMoreData, fetcher]);

  useFocusOnFirstLoadedContent(trackList, 'link');

  useEffect(() => {
    if (shouldLoadInitialData) {
      fetcher.load('/reset-fetcher');
      currPage.current = INITIAL_PAGE_TO_LOADMORE;
    }
  }, [fetcher, shouldLoadInitialData]);

  if (shouldLoadInitialData)
    return (
      <>
        <TrackSkeleton />
        <TrackSkeleton />
        <TrackSkeleton />
        <TrackSkeleton />
        <TrackSkeleton />
      </>
    );
  if (trackList.length === 0 && currPage.current === INITIAL_PAGE_TO_LOADMORE)
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
                  aria-labelledby={String(track.result.id)}
                >
                  {transition.state === 'loading' &&
                  transition.location.pathname === `/track/${track.result.id}`
                    ? 'Loading..'
                    : 'Details'}
                  <ArrowRightIcon className="h-3 transition-transform group-hover:translate-x-1" />
                  <span className="sr-only" id={String(track.result.id)} aria-live="polite">
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
      {hasMoreData ? (
        <button
          className="self-center rounded-full bg-white  px-3  py-1 text-blue-600 ring-2 ring-blue-600 transition-colors  hover:bg-blue-600 hover:text-white disabled:opacity-75"
          onClick={handleLoadMore}
        >
          {fetcher.state === 'loading' || fetcher.state === 'submitting'
            ? 'Loading..'
            : 'Load More'}
        </button>
      ) : null}
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

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return (
    <div>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
    </div>
  );
};
