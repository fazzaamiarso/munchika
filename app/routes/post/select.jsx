import { useFetcher, Link } from 'remix';
import { MusicNoteIcon } from '@heroicons/react/outline';
import { useEffect, useRef } from 'react';

export default function SelectPost() {
  const fetcher = useFetcher();
  const searchRef = useRef();

  useEffect(() => {
    searchRef.current.focus();
  }, []);

  return (
    <section className="mx-auto flex min-h-screen w-10/12 max-w-xl flex-col items-center ">
      <div className="flex flex-col items-center pt-8 pb-6 leading-none">
        <MusicNoteIcon className="mb-2 h-8 text-gray-400" />
        <h2 className="text-lg font-semibold">Pick a song</h2>
        <p className="text-gray-500">What song you have in mind to post?</p>
      </div>
      <fetcher.Form
        method="get"
        action={`/search-genius`}
        className="flex w-full items-center justify-center gap-2 "
      >
        <input
          type="search"
          name="query"
          autoComplete="off"
          className="w-full max-w-xs rounded-md ring-gray-400 placeholder:text-gray-400"
          ref={searchRef}
          placeholder="Search here..."
        />
        <button
          type="submit"
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:opacity-90 disabled:opacity-75"
          disabled={
            fetcher.state === 'submitting' || fetcher.state === 'loading'
          }
        >
          {fetcher.state === 'submitting' ? 'Searching...' : 'Search'}
        </button>
      </fetcher.Form>
      {fetcher.data ? (
        fetcher.data.error ? (
          <p className="font-bold">Unable to fetch data</p>
        ) : fetcher.data.length ? (
          <ul className="mx-auto my-8 flex flex-col divide-y divide-gray-400 rounded-md bg-white px-6 py-4 shadow-md ring-1 ring-slate-600">
            {fetcher.data.map(track => {
              return (
                <li
                  key={track.result.id}
                  className="flex w-full items-center gap-4 py-2 leading-none"
                >
                  <img
                    className="h-12"
                    src={track.result.song_art_image_thumbnail_url}
                    alt={track.result.title}
                  />
                  <div className="flex flex-col items-start">
                    <h3 className="font-semibold line-clamp-2 ">
                      {track.result.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {track.result.primary_artist.name}
                    </p>
                  </div>
                  <Link
                    prefetch="intent"
                    to={`/post/new?trackId=${track.result.id}`}
                    className="ml-auto rounded-full bg-white px-2 py-1 text-sm text-gray-600 ring-1 ring-gray-300 hover:ring-2"
                    type="submit"
                  >
                    Select
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="font-bold">No song found. Please try another search</p>
        )
      ) : null}
    </section>
  );
}
