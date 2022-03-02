import {
  json,
  Form,
  useLoaderData,
  useNavigate,
  redirect,
  useTransition,
  useActionData,
} from 'remix';
import invariant from 'tiny-invariant';
import { supabase } from '../../../server/db.server';
import { fetchFromGenius } from '../../utils/geniusApi.server';
import { requireUserId } from '../../utils/session.server';
import { validateThought, validateLyrics } from '../../utils/formUtils';
import { ExternalLinkIcon } from '@heroicons/react/outline';

export const loader = async ({ params, request }) => {
  invariant(params.postId, 'Expected params.postId');
  const userId = await requireUserId(request, new URL(request.url));

  const { data: postData } = await supabase
    .from('post')
    .select('*')
    .match({ id: parseInt(params.postId), author_id: userId })
    .limit(1)
    .single();
  const trackData = (await fetchFromGenius(`songs/${postData.track_id}`)).song;

  return json({
    postData,
    trackData: {
      title: trackData.title,
      thumbnail: trackData.song_art_image_url,
      artist: trackData.primary_artist.name,
      url: trackData.url,
    },
  });
};

export const action = async ({ params, request }) => {
  invariant(params.postId, 'Expected params.postId');
  const formData = await request.formData();
  const lyrics = formData.get('lyrics');
  const thought = formData.get('thought');
  const postId = parseInt(params.postId);

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
  const { postData, trackData } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const transition = useTransition();

  const isSaving =
    transition.type === 'actionRedirect' || transition.state === 'submitting';

  return (
    <div className="mx-auto mt-4 flex w-10/12 flex-col py-8">
      <section className="space-y-4">
        <div className="mb-8  ">
          <h1 className="text-xl font-semibold">Editing Post</h1>
          <p className="text-gray-400">
            Last edited at : {new Date(postData.updated_at).toDateString()}
          </p>
        </div>
        <div className="flex max-w-lg items-center  gap-4 rounded-md bg-white ring-1 ring-gray-400">
          <img
            src={trackData.thumbnail}
            alt={trackData.title}
            className="h-24"
          />
          <div className="px-3 leading-5">
            <h2 className="font-semibold">{trackData.title}</h2>
            <p className="text-sm">{trackData.artist}</p>
          </div>
        </div>
        <p className="flex items-center gap-1 text-sm">
          Need the lyrics?{' '}
          <a
            href={trackData.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-blue-500 hover:underline"
          >
            Check it out on Genius <ExternalLinkIcon className="h-4" />
          </a>
        </p>
      </section>
      <Form method="post" className="mt-4 flex  flex-col gap-6 py-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="lyrics" className="font-semibold">
            Lyrics{' '}
            <span className="font-normal text-slate-400">
              ( You can leave it empty )
            </span>
          </label>
          <textarea
            name="lyrics"
            id="lyrics"
            defaultValue={postData.lyrics}
            rows={5}
            autoFocus
            className={`resize-none rounded-md  ${
              actionData?.fieldErrors?.lyrics ? 'border-red-400' : ''
            }`}
            placeholder="What are the lyrics you want to feature?"
          />
          {actionData?.fieldErrors?.lyrics ? (
            <p className="text-sm text-red-500">
              {actionData.fieldErrors.lyrics}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="thought" className="font-semibold">
            Thought
          </label>
          <textarea
            name="thought"
            id="thought"
            defaultValue={postData.thought}
            rows={5}
            placeholder="Share your thoughts to the world about how this song had helped you .."
            className={`resize-none rounded-md  ${
              actionData?.fieldErrors?.thought ? 'border-red-400' : ''
            }`}
          />
          {actionData?.fieldErrors?.thought ? (
            <p className="text-sm text-red-500">
              {actionData.fieldErrors.thought}
            </p>
          ) : null}
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
            className="rounded-sm bg-blue-500 py-1 px-4 font-semibold text-white"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </Form>
    </div>
  );
}
