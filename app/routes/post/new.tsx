import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import { getUserId, requireUserId } from '~/utils/session.server';
import { supabase } from '~/utils/supabase.server';
import { fetchFromGenius, GeniusTrackData } from '~/utils/geniusApi.server';
import { validateThought, validateLyrics } from '~/utils/formUtils';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { useRef } from 'react';
import { useFocusOnError } from '~/hooks/useFocusOnError';
import { ErrorMessage } from '~/components/form/error-message';
import invariant from 'tiny-invariant';

export const loader: LoaderFunction = async ({ request }) => {
  const newUrl = new URL(request.url);
  await requireUserId(request, newUrl.pathname);
  const trackId = newUrl.searchParams.get('trackId');

  const track = await fetchFromGenius(`songs/${trackId}`);

  return json(track.song);
};

type ActionData = {
  fields: {
    track_id: string;
    lyrics: string;
    thought: string;
  };
  fieldErrors: {
    track_id: string;
    lyrics: string;
    thought: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const track_id = formData.get('trackId');
  const lyrics = formData.get('lyrics');
  const thought = formData.get('thought');

  invariant(typeof track_id === 'string', 'track_id must be a string!');
  invariant(typeof lyrics === 'string', 'lyrics must be a string!');
  invariant(typeof thought === 'string', 'thought must be a string!');

  const fields = {
    track_id,
    lyrics,
    thought,
  };
  const fieldErrors = {
    thought: validateThought(thought),
    lyrics: validateLyrics(lyrics),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return json({ fieldErrors, fields }, { status: 400 });
  }

  await supabase.from('post').insert([
    {
      author_id: userId,
      lyrics,
      thought,
      track_id: Number(track_id),
    },
  ]);
  return redirect('/user/posts');
};

export default function NewPost() {
  const navigate = useNavigate();
  const trackData = useLoaderData<GeniusTrackData>();
  const fetcher = useFetcher<ActionData>();
  const formRef = useRef<HTMLFormElement>(null);
  const isBusy = fetcher.state === 'submitting' || fetcher.state === 'loading';

  useFocusOnError(formRef, fetcher.data?.fieldErrors ?? {});

  return (
    <>
      <main className="mx-auto mt-4 flex w-10/12 max-w-2xl flex-col">
        <section className="mt-4 space-y-4">
          <h1 id="head" className=" mb-6 text-xl font-semibold">
            Write your thought{' '}
            <span className="sr-only">
              on {trackData.title} by {trackData.primary_artist.name}
            </span>{' '}
          </h1>
          <div className="flex max-w-lg items-center  gap-4 rounded-md bg-white ring-1 ring-gray-400">
            <img
              src={trackData.song_art_image_thumbnail_url}
              alt={trackData.title}
              height="96px"
              width="96px"
              className="h-24"
            />
            <div className="px-3 leading-5">
              <h2 className="font-semibold">{trackData.title}</h2>
              <p className="text-sm">{trackData.primary_artist.name}</p>
            </div>
          </div>
          <p className="flex items-center gap-1 text-sm">
            Need the lyrics?{' '}
            <a
              href={trackData.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              Check it out on Genius <ExternalLinkIcon className="h-4" />
            </a>
          </p>
        </section>
        <fetcher.Form
          method="post"
          className=" mt-4 flex  flex-col gap-6 py-4"
          aria-labelledby="head"
          ref={formRef}
        >
          <input type="text" hidden name="trackId" defaultValue={trackData.id} />
          <div className="flex flex-col  gap-3">
            <div className="self-start">
              <label htmlFor="lyrics" className="font-semibold">
                Lyrics <span className="font-normal text-slate-600">(optional)</span>
              </label>
              <p id="lyrics-hint" className="text-sm font-normal leading-none text-gray-600">
                Share the lyrics you want to feature in 10 characters or more
              </p>
            </div>
            <textarea
              name="lyrics"
              id="lyrics"
              rows={5}
              autoFocus
              className={`resize-y rounded-md  ${
                fetcher.data?.fieldErrors?.lyrics ? 'border-red-400' : ''
              }`}
              aria-invalid={fetcher.data?.fieldErrors?.lyrics ? 'true' : 'false'}
              aria-errormessage="lyrics-error"
              aria-describedby="lyrics-hint"
            />
            <ErrorMessage id="lyrics-error">
              {fetcher.data?.fieldErrors?.lyrics ? fetcher.data.fieldErrors.lyrics : ''}
            </ErrorMessage>
          </div>
          <div className="flex flex-col gap-3 ">
            <div className="self-start">
              <label htmlFor="thought" className="font-semibold">
                Thought
              </label>
              <p id="thought-hint" className="text-sm font-normal leading-none text-gray-600">
                Write your thoughts on how this song had helped you in 20 characters or more
              </p>
            </div>
            <textarea
              name="thought"
              id="thought"
              rows={5}
              className={`resize-y rounded-md  ${
                fetcher.data?.fieldErrors?.thought ? 'border-red-400' : ''
              }`}
              aria-invalid={fetcher.data?.fieldErrors?.thought ? 'true' : 'false'}
              aria-errormessage="thought-error"
              aria-describedby="thought-hint"
            />
            <ErrorMessage id="thought-error">
              {fetcher.data?.fieldErrors?.thought ? fetcher.data.fieldErrors.thought : ''}
            </ErrorMessage>
          </div>
          <div className="mt-4 flex gap-2 self-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isBusy}
              className="py-1 px-4 font-semibold"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="rounded-sm bg-blue-600 py-1 px-4 font-semibold text-white hover:opacity-90 disabled:opacity-75"
            >
              {isBusy ? 'Posting' : 'Post'}
              <span className="sr-only" aria-live="polite">
                {isBusy ? 'Posting' : ''}
              </span>
            </button>
          </div>
        </fetcher.Form>
      </main>
    </>
  );
}
