import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox';
import { useNavigate, useFetcher } from 'remix';
import debounce from 'lodash.debounce';
import { useCallback } from 'react';
import comboboxStyle from '@reach/combobox/styles.css';

export const links = () => {
  return [{ rel: 'stylesheet', href: comboboxStyle }];
};

export const loader = async ({ request }) => {
  const newUrl = new URL(request.url);
  const searchTerm = newUrl.searchParams.get('query');

  if (searchTerm === null) return null;

  const url = `https://api.genius.com/search?q=${searchTerm}`;
  const encodedURI = encodeURI(url); //replace character with escape sequence of UTF-8 encoding

  const response = await fetch(encodedURI, {
    headers: {
      Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
    },
  });
  const json = await response.json();
  const data = json.response.hits;

  return data;
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  console.log(formData);

  return null;
};

export default function NewPost() {
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const debouncedSubmit = useCallback(
    debounce(query => {
      fetcher.submit({ query }, { method: 'get' });
    }, 2000),
    [fetcher],
  );
  const handleChange = e => {
    debouncedSubmit(e.target.value);
  };
  const handleSelect = selectedItem => {
    alert(selectedItem);
  };

  return (
    <>
      <h1 className="text-2xl">Add your thought</h1>
      <form method="post">
        <div>
          <label htmlFor="track">Choose song</label>
          <Combobox aria-labelledby="track" onSelect={handleSelect}>
            <div>
              <ComboboxInput name="query" onChange={handleChange} />
              {fetcher.state === 'submitting' ? <p>fetching..</p> : null}
            </div>
            {fetcher.data ? (
              <ComboboxPopover>
                {fetcher.data.error ? (
                  <p>Failed to load song</p>
                ) : fetcher.data.length ? (
                  <ComboboxList>
                    {fetcher.data.map(track => {
                      return (
                        <ComboboxOption
                          key={track.result.id}
                          value={track.result.title}
                        >
                          <>
                            <img
                              className="h-12"
                              src={track.result.song_art_image_url}
                              alt={track.result.title}
                            />
                            <h1>{track.result.title}</h1>
                          </>
                        </ComboboxOption>
                      );
                    })}
                  </ComboboxList>
                ) : (
                  <p>No song found</p>
                )}
              </ComboboxPopover>
            ) : null}
          </Combobox>
        </div>
        <div>
          <label htmlFor="lyrics">Lyrics</label>
          <input type="textarea" name="lyrics" id="lyrics" />
        </div>
        <div>
          <label htmlFor="thought">Thought</label>
          <input type="textarea" name="thought" id="thought" />
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="py-1 px-4 font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-pink-500 py-1 px-4 font-semibold text-white"
        >
          Submit
        </button>
      </form>
    </>
  );
}
