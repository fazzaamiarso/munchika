import {
  useParams,
  json,
  Form,
  useLoaderData,
  useNavigate,
  redirect,
} from 'remix';
import invariant from 'tiny-invariant';
import { supabase } from '../../../server/db.server';
import { fetchFromGenius } from '../../utils/geniusApi.server';
import { requireUserId } from '../../utils/session.server';

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
    },
  });
};

export const action = async ({ params, request }) => {
  invariant(params.postId, 'Expected params.postId');
  const formData = await request.formData();
  const lyrics = formData.get('lyrics');
  const thought = formData.get('thought');
  const postId = parseInt(params.postId);

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
  const { postId } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <h1>Editing Post {postId}</h1>
      <div className="flex items-center">
        <img src={trackData.thumbnail} alt={trackData.title} className="h-40" />
        <div>
          <h2>{trackData.title}</h2>
          <p>{trackData.artist}</p>
        </div>
      </div>
      <Form method="post" className="mx-auto mt-4 flex w-10/12 flex-col gap-4">
        <div className="flex flex-col ">
          <label htmlFor="lyrics" className="font-semibold">
            Lyrics
          </label>
          <textarea name="lyrics" id="lyrics" defaultValue={postData.lyrics} />
        </div>
        <div className="flex flex-col ">
          <label htmlFor="thought" className="font-semibold">
            Thought
          </label>
          <textarea
            name="thought"
            id="thought"
            defaultValue={postData.thought}
          />
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
            Save
          </button>
        </div>
      </Form>
    </>
  );
}
