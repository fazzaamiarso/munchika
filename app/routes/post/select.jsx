import { useFetcher } from 'remix';
import { MusicNoteIcon } from '@heroicons/react/outline';
import { useEffect, useRef } from 'react';

export default function SelectPost() {
  const fetcher = useFetcher();
  const searchRef = useRef();

  useEffect(() => {
    searchRef.current.focus();
  }, []);

  return (
    <section className="mx-auto flex w-10/12 flex-col items-center ">
      <div className="flex flex-col items-center pt-8 pb-6 leading-none">
        <MusicNoteIcon className="mb-2 h-8 text-gray-400" />
        <h2 className="text-lg font-semibold">Pick a song</h2>
        <p className="text-gray-400">What song you have in mind to post?</p>
      </div>
      <fetcher.Form
        method="get"
        action={`/search-genius`}
        className="flex items-center gap-2 "
      >
        <input
          type="search"
          name="query"
          autoComplete="off"
          className="rounded-md ring-gray-400 placeholder:text-gray-400"
          ref={searchRef}
          placeholder="Search song"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          Search
        </button>
      </fetcher.Form>
      {fetcher.state === 'submitting' ? <p>Fetching your song</p> : null}
      {fetcher.data ? (
        fetcher.data.error ? (
          <p>Unable to fetch data</p>
        ) : fetcher.data.length ? (
          <ul className="mx-auto flex w-11/12 flex-col gap-4 py-6">
            {fetcher.data.map(track => {
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
                    <h3 className="text-semibold  ">{track.result.title}</h3>
                    <p className="text-sm">
                      {track.result.primary_artist.name}
                    </p>
                  </div>
                  <form action="/post/new" method="get" className="ml-auto ">
                    <button
                      name="trackId"
                      value={track.result.id}
                      className="rounded-full px-2 py-1 text-sm text-gray-600 ring-1 ring-gray-300"
                      type="submit"
                    >
                      Select
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No song found. Please try another search</p>
        )
      ) : null}
    </section>
  );
}
