import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigate, useTransition } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { supabase } from '~/utils/supabase.server';
import { fetchFromGenius, GeniusTrackData } from '~/utils/geniusApi.server';
import { requireUserId } from '~/utils/session.server';
import { validateThought, validateLyrics } from '~/utils/formUtils';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { useRef } from 'react';
import { useFocusOnError } from '~/hooks/useFocusOnError';
import { ErrorMessage } from '~/components/form/error-message';
import { Post } from '~/types/database';

type LoaderData = {
  postData: Post;
  trackData: GeniusTrackData;
};
export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.postId, 'Expected params.postId');
  const userId = await requireUserId(request, new URL(request.url).pathname);

  const { data: postData } = await supabase
    .from('post')
    .select('*')
    .match({ id: parseInt(params.postId), author_id: userId })
    .limit(1)
    .single();
  const trackData = (await fetchFromGenius(`songs/${postData.track_id}`)).song;

  return json({
    postData,
    trackData,
  });
};

type ActionData = {
  fields: {
    lyrics: string;
    thought: string;
  };
  fieldErrors: {
    lyrics: string;
    thought: string;
  };
};

export const action: ActionFunction = async ({ params, request }) => {
  invariant(params.postId, 'Expected params.postId');
  const formData = await request.formData();
  const lyrics = formData.get('lyrics');
  const thought = formData.get('thought');
  const postId = Number(params.postId);

  invariant(typeof lyrics === 'string', 'lyrics must be a string!');
  invariant(typeof thought === 'string', 'thought must be a string!');

  const fields = {
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

  await supabase
    .from('post')
    .update({
      lyrics,
      thought,
    })
    .eq('id', postId);

  return redirect('/'); // redirect to home in meantime;
};

export default function EditPost() {
  const { postData, trackData } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const transition = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const isSaving = transition.type === 'actionRedirect' || transition.state === 'submitting';

  useFocusOnError(formRef, actionData?.fieldErrors ?? {});

  return (
    <main className="mx-auto mt-4 flex w-10/12 max-w-2xl flex-col py-8">
      <section className="space-y-4" aria-labelledby="heading">
        <div className="mb-8  ">
          <h1 className="text-xl font-semibold" id="heading">
            Editing Post
          </h1>
          <p className="text-gray-600">
            Last edited at : {new Date(postData.updated_at).toDateString()}
          </p>
        </div>
        <div className="flex max-w-lg items-center  gap-4 rounded-md bg-white ring-1 ring-gray-400">
          <img
            src={trackData.song_art_image_thumbnail_url}
            alt={trackData.title}
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
      <Form method="post" className="mt-4 flex  flex-col gap-6 py-4" ref={formRef}>
        <div className="flex flex-col gap-3">
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
            defaultValue={postData.lyrics}
            rows={5}
            autoFocus
            className={`resize-y rounded-md  ${
              actionData?.fieldErrors?.lyrics ? 'border-red-400' : ''
            }`}
            aria-errormessage="lyrics-error"
            aria-invalid={actionData?.fieldErrors?.lyrics ? 'true' : 'false'}
            aria-describedby="lyrics-hint"
          />
          <ErrorMessage id="lyrics-error">
            {actionData?.fieldErrors?.lyrics ? actionData.fieldErrors.lyrics : ''}
          </ErrorMessage>
        </div>
        <div className="flex flex-col gap-3">
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
            defaultValue={postData.thought}
            rows={5}
            className={`resize-y rounded-md  ${
              actionData?.fieldErrors?.thought ? 'border-red-400' : ''
            }`}
            aria-errormessage="thought-error"
            aria-invalid={actionData?.fieldErrors?.thought ? 'true' : 'false'}
            aria-describedby="thought-hint"
          />
          <ErrorMessage id="thought-error">
            {actionData?.fieldErrors?.thought ? actionData.fieldErrors.thought : ''}
          </ErrorMessage>
        </div>
        <div className="flex gap-2 self-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isSaving}
            className="py-1 px-4 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-sm bg-blue-600 py-1 px-4 font-semibold text-white"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <span className="sr-only" aria-live="polite">
            {isSaving ? 'Saving...' : 'Save'}
          </span>
        </div>
      </Form>
    </main>
  );
}
