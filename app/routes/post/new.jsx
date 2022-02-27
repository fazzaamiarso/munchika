import { useNavigate, redirect, json, useLoaderData, useFetcher } from 'remix';
import { getUserId, requireUserId } from '~/utils/session.server';
import { supabase } from '../../../server/db.server';
import { fetchFromGenius } from '../../utils/geniusApi.server';
import { validateThought, validateLyrics } from '../../utils/formUtils';

export const loader = async ({ request }) => {
  const newUrl = new URL(request.url);
  await requireUserId(request, newUrl);
  const trackId = newUrl.searchParams.get('trackId');

  const track = await fetchFromGenius(`songs/${trackId}`);

  return json(track.song);
};

export const action = async ({ request }) => {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const track_id = formData.get('trackId');
  const lyrics = formData.get('lyrics');
  const thought = formData.get('thought');

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
      track_id,
    },
  ]);
  return redirect('/user/posts');
};

export default function NewPost() {
  const navigate = useNavigate();
  const trackData = useLoaderData();
  const fetcher = useFetcher();

  return (
    <>
      <div className="mx-auto mt-4 flex w-10/12 flex-col">
        <h1 className=" mb-6 text-xl font-semibold">Add your thought</h1>
        <div className="flex items-center  rounded-md ring-1 ring-gray-400">
          <img
            src={trackData.song_art_image_url}
            alt={trackData.title}
            className="h-24"
          />
          <div className="px-3 leading-5">
            <h2 className="font-semibold">{trackData.title}</h2>
            <p className="text-sm">{trackData.primary_artist.name}</p>
          </div>
        </div>
        <p className="text-sm">
          Need the lyrics?{' '}
          <a
            href={trackData.url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:underline"
          >
            Check it out on Genius
          </a>
        </p>
        <fetcher.Form method="post" className=" mt-4 flex  flex-col gap-6 py-4">
          <input
            type="text"
            hidden
            name="trackId"
            defaultValue={trackData.id}
          />
          <div className="flex flex-col  gap-2  ">
            <label htmlFor="lyrics" className="font-semibold">
              Lyrics
            </label>
            <textarea
              name="lyrics"
              id="lyrics"
              rows={5}
              autoFocus
              className={`"resize-none rounded-md text-sm ${
                fetcher.data?.fieldErrors?.lyrics ? 'border-red-400' : ''
              }`}
              placeholder="What are the lyrics you want to feature?"
            />
            {fetcher.data?.fieldErrors?.lyrics ? (
              <p className="text-sm text-red-500">
                {fetcher.data.fieldErrors.lyrics}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 ">
            <label htmlFor="thought" className="font-semibold">
              Thought
            </label>
            <textarea
              name="thought"
              id="thought"
              rows={5}
              placeholder="Share your thoughts to the world about how this song had helped you .."
              className={`"resize-none rounded-md text-sm ${
                fetcher.data?.fieldErrors?.thought ? 'border-red-400' : ''
              }`}
            />
            {fetcher.data?.fieldErrors?.thought ? (
              <p className="text-sm text-red-500">
                {fetcher.data.fieldErrors.thought}
              </p>
            ) : null}
          </div>
          <div className="mt-4 flex gap-2 self-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="py-1 px-4 font-semibold"
            >
              Back
            </button>
            <button
              type="submit"
              className="rounded-sm bg-blue-500 py-1 px-4 font-semibold text-white"
            >
              Submit
            </button>
          </div>
        </fetcher.Form>
      </div>
    </>
  );
}
