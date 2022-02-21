import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox';
import { useNavigate, useFetcher, redirect } from 'remix';
import debounce from 'lodash.debounce';
import { useCallback } from 'react';
import comboboxStyle from '@reach/combobox/styles.css';
import { supabase } from '../../server/db.server';
import { fetchFromGenius } from '~/utils/geniusApi.server';

export const links = () => {
  return [{ rel: 'stylesheet', href: comboboxStyle }];
};

export const loader = async ({ request }) => {
  const newUrl = new URL(request.url);
  const searchTerm = newUrl.searchParams.get('query');

  if (searchTerm === null) return null;

  const response = await fetchFromGenius(`search?q=${searchTerm}`);
  const data = response.hits;

  return data;
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const trackId = formData.get('track');
  const lyrics = formData.get('lyrics');
  const thought = formData.get('thought');

  const { data } = await supabase.from('post').insert([
    {
      author_id: '9c1b9d40-46fb-4608-97b2-08016f6fcd51', //should come from auth
      lyrics,
      thought,
      track_id: trackId,
    },
  ]);

  console.log(data);

  return redirect('/search'); // should redirect to home, redirect here for testing only
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

  return (
    <>
      <h1 className="text-2xl font-bold">Add your thought</h1>
      <form method="post" className="mx-auto mt-4 flex w-10/12 flex-col gap-4">
        <div>
          <Combobox aria-labelledby="track">
            <div className="flex gap-2">
              <ComboboxInput
                name="track"
                onChange={handleChange}
                className="ring-1 ring-gray-200"
                placeholder="Find your song here"
              />
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
                          value={track.result.id}
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
        <div className="flex flex-col ">
          <label htmlFor="lyrics" className="font-semibold">
            Lyrics
          </label>
          <textarea type="textarea" name="lyrics" id="lyrics" />
        </div>
        <div className="flex flex-col ">
          <label htmlFor="thought" className="font-semibold">
            Thought
          </label>
          <textarea type="textarea" name="thought" id="thought" />
        </div>
        <div className="flex gap-2 self-end">
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
        </div>
      </form>
    </>
  );
}
