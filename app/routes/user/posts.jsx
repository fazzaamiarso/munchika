import { Link, useLoaderData, useNavigate } from 'remix';
import { getUserId } from '../../utils/session.server';
import {
  fetchFromGenius,
  removeTranslation,
} from '../../utils/geniusApi.server';
import { supabase } from '../../../server/db.server';

export const loader = async ({ request }) => {
  const userId = await getUserId(request);

  const { data: userPosts } = await supabase
    .from('post')
    .select('*')
    .eq('author_id', userId);

  const tracks = userPosts.map(async post => {
    const response = await fetchFromGenius(`songs/${post.track_id}`);
    const track = response.song;
    return {
      ...post,
      title: removeTranslation(track.title),
      artist: track.primary_artist.name,
      thumbnail: track.song_art_image_thumbnail_url,
    };
  });
  const postsData = await Promise.all(tracks);
  return {
    postsData,
  };
};

export default function UserPost() {
  const navigate = useNavigate();
  const { postsData } = useLoaderData();

  return (
    <main>
      <h3>Your post</h3>
      {postsData.length ? (
        <ul className="flex w-full flex-col items-center px-4 ">
          {postsData.map(post => {
            return (
              <li
                key={post.id}
                className="max-w-lg rounded-md p-4 shadow-lg transition-transform hover:-translate-y-1 hover:cursor-pointer hover:shadow-2xl"
                onClick={() => navigate(`/post/edit/${post.id}`)}
              >
                <div className="mb-4 flex items-center gap-4 shadow-md">
                  <img src={post.thumbnail} alt={post.title} className="h-24" />
                  <div className="pr-4">
                    <p className="text-sm font-semibold">{post.title}</p>
                    <p className="text-xs">{post.artist}</p>
                    <Link
                      to={`/track/${post.track_id}`}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Go to song&apos;s feed ➡
                    </Link>
                  </div>
                </div>
                <section className="space-y-4">
                  <div>
                    <h4 className="text-md font-semibold">Featured lyrics</h4>
                    <p className="text-justify indent-8">{post.lyrics}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-semibold">Thought</h4>
                    <p className="text-justify indent-8">{post.thought}</p>
                  </div>
                </section>
              </li>
            );
          })}
        </ul>
      ) : (
        <div>
          <p>You dont have any post</p>
        </div>
      )}
    </main>
  );
}
