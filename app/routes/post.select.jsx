import { useFetcher } from 'remix';

export default function SelectPost() {
  const fetcher = useFetcher();

  return (
    <section>
      <fetcher.Form method="get" action={`/search-genius`}>
        <input type="search" name="query" autoComplete={false} />
        <button type="submit">Search</button>
        {fetcher.state === 'idle' ? <p>Search something</p> : null}
        {fetcher.state === 'loading' ? <p>Searching...</p> : null}
      </fetcher.Form>

      {fetcher.data ? (
        fetcher.data.error ? (
          <p>Unable to fetch data</p>
        ) : fetcher.data.length ? (
          <ul>
            {fetcher.data.map(track => {
              return (
                <li key={track.result.id}>
                  <img
                    className="h-12"
                    src={track.result.song_art_image_url}
                    alt={track.result.title}
                  />
                  <p>{track.result.title}</p>
                  <form action="/post/new" method="get">
                    <input
                      type="text"
                      hidden
                      name="trackId"
                      value={track.result.id}
                    />
                    <button className="bg-pink-500" type="submit">
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
