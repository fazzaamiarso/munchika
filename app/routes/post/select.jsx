import { Link, useFetcher, useNavigate } from "@remix-run/react";
import { MusicNoteIcon, ArrowLeftIcon } from '@heroicons/react/outline';
import { useEffect, useRef } from 'react';

export default function SelectPost() {
  const fetcher = useFetcher();
  const searchRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    searchRef.current.focus();
  }, []);

  return (
    <main className="relative mx-auto flex min-h-screen w-10/12 max-w-xl flex-col items-center ">
      <button
        aria-label="Back to previous page"
        className="group absolute  top-8 left-0 z-30 hidden rounded-full p-2 ring-1 ring-gray-500 sm:block"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon className="h-4 transition-transform group-hover:-translate-x-1" />
      </button>
      <div className="flex flex-col items-center pt-8 pb-6 leading-none">
        <MusicNoteIcon className="mb-2 h-8 text-gray-400" />
        <h1 className="text-lg font-semibold">Pick a song</h1>
        <p className="text-gray-500">What song you have in mind to post?</p>
      </div>
      <fetcher.Form
        method="get"
        action={`/search-genius`}
        className="flex w-full items-center justify-center gap-2 "
        role="search"
      >
        <input
          type="search"
          name="query"
          autoComplete="off"
          className="w-full max-w-xs rounded-md ring-gray-400 placeholder:text-gray-400"
          ref={searchRef}
          placeholder="Search a song"
          required
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:opacity-90 disabled:opacity-75"
          disabled={fetcher.state === 'submitting' || fetcher.state === 'loading'}
        >
          {fetcher.state === 'submitting' || fetcher.state === 'loading'
            ? 'Searching...'
            : 'Search'}
        </button>
        <span className="sr-only" aria-live="polite">
          {fetcher.state === 'submitting' || fetcher.state === 'loading'
            ? 'Searching...'
            : fetcher?.data?.length >= 0
            ? `${fetcher.data.length} songs found`
            : ''}
        </span>
      </fetcher.Form>
      {fetcher.state === 'submitting' ? (
        <div
          aria-hidden="true"
          className="mx-auto my-8 flex w-full flex-col divide-y divide-gray-400 rounded-md bg-white px-6 py-4 shadow-md ring-1 ring-slate-600"
        >
          <TrackSkeleton />
          <TrackSkeleton />
          <TrackSkeleton />
          <TrackSkeleton />
          <TrackSkeleton />
        </div>
      ) : fetcher.data ? (
        fetcher.data.error ? (
          <p className="font-bold">Unable to fetch data</p>
        ) : fetcher.data.length ? (
          <ul className="mx-auto my-8 flex w-full flex-col divide-y divide-gray-400 rounded-md bg-white px-6 py-4 shadow-md ring-1 ring-slate-600">
            {fetcher.data.map(track => {
              return (
                <li
                  key={track.result.id}
                  className="flex w-full items-center gap-4 py-2 leading-none"
                >
                  <img className="h-12" src={track.result.song_art_image_thumbnail_url} alt="" />
                  <div className="flex flex-col items-start">
                    <p className="font-semibold line-clamp-2 ">{track.result.title}</p>
                    <p className="text-sm text-gray-500">{track.result.primary_artist.name}</p>
                  </div>
                  <Link
                    prefetch="intent"
                    to={`/post/new?trackId=${track.result.id}`}
                    className="ml-auto rounded-full bg-white px-2 py-1 text-sm text-gray-600 ring-1 ring-gray-300 hover:ring-2"
                    type="submit"
                    aria-labelledby={track.result.id}
                  >
                    Select
                  </Link>
                  <span
                    id={track.result.id}
                    className="sr-only"
                  >{`Select ${track.result.title} by ${track.result.primary_artist.name}`}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 font-bold">No song found. Please try another search</p>
        )
      ) : null}
    </main>
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
