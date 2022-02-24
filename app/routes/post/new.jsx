import { useNavigate, redirect, json, useLoaderData, useFetcher } from 'remix';
import { getUserId, requireUserId } from '~/utils/session.server';
import { supabase } from '../../../server/db.server';
import { fetchFromGenius } from '../../utils/geniusApi.server';

const validateThought = thought => {
  if (thought.length < 20)
    return 'Less than 20 characters. Your thought should be more descriptive so people can understand better';
};
const validateLyrics = lyrics => {
  if (lyrics.length < 10 && lyrics.length > 0)
    return 'Less than 10 characters. The lyrics should be more than 10 characters or empty';
};

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

  const { data, error } = await supabase.from('post').insert([
    {
      author_id: userId, //should come from auth
      lyrics,
      thought,
      track_id,
    },
  ]);
  console.log(data);
  console.log(error);

  return redirect('/search'); // should redirect to home, redirect here for testing only
};

export default function NewPost() {
  const navigate = useNavigate();
  const trackData = useLoaderData();
  const fetcher = useFetcher();

  return (
    <>
      <h1 className="text-2xl font-bold">Add your thought</h1>
      <div className="flex items-center">
        <img
          src={trackData.song_art_image_url}
          alt={trackData.title}
          className="h-40"
        />
        <div>
          <h2>{trackData.title}</h2>
          <p>{trackData.primary_artist.name}</p>
        </div>
      </div>
      <fetcher.Form
        method="post"
        className="mx-auto mt-4 flex w-10/12 flex-col gap-4"
      >
        <input type="text" hidden name="trackId" defaultValue={trackData.id} />
        <div className="flex flex-col ">
          <label htmlFor="lyrics" className="font-semibold">
            Lyrics
          </label>
          <textarea name="lyrics" id="lyrics" />
          {fetcher.data?.fieldErrors?.lyrics ? (
            <p className="text-red-500">{fetcher.data.fieldErrors.lyrics}</p>
          ) : null}
        </div>
        <div className="flex flex-col ">
          <label htmlFor="thought" className="font-semibold">
            Thought
          </label>
          <textarea name="thought" id="thought" />
          {fetcher.data?.fieldErrors?.thought ? (
            <p className="text-red-500">{fetcher.data.fieldErrors.thought}</p>
          ) : null}
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
      </fetcher.Form>
    </>
  );
}
