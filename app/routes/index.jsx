import { Link, useLoaderData } from 'remix';
import { supabase } from '../../server/db.server';
import { fetchFromGenius, removeTranslation } from '../utils/geniusApi.server';
export const loader = async () => {
  const { data } = await supabase
    .from('post')
    .select('*, user (username, avatar_url)')
    .limit(7)
    .order('created_at', { ascending: false });

  const tracks = data.map(async post => {
    const response = await fetchFromGenius(`songs/${post.track_id}`);
    const track = response.song;
    return {
      ...post,
      created_at: new Date(post.created_at).toDateString(),
      username: post.user.username,
      avatar: post.user.avatar_url,
      title: removeTranslation(track.title),
      artist: track.primary_artist.name,
      thumbnail: track.song_art_image_thumbnail_url,
    };
  });
  const trackDatas = await Promise.all(tracks);
  return {
    data: trackDatas,
  };
};

export default function Index() {
  const { data } = useLoaderData();

  return (
    <>
      <section className="mx-auto flex w-11/12 max-w-2xl flex-col items-center gap-2 pt-8 text-center">
        <h1 className="text-3xl font-bold">See Other&apos;s Thought</h1>
        <p className="max-w-[50ch] text-gray-400">
          Find song that actually help them (maybe they can help you too) or{' '}
          <Link
            to="/post/select"
            className="font-semibold text-blue-500 hover:underline"
          >
            add a thought
          </Link>{' '}
          yourself to help others.
        </p>
        <p className="pt-6 font-semibold">
          Check some of people&apos;s thought here
        </p>
      </section>
      <main className="mx-auto mt-6 flex w-11/12 max-w-lg flex-col items-center">
        <ul className=" space-y-8">
          {data.map(post => {
            return (
              <li
                key={post.id}
                className="max-w-lg space-y-2 rounded-md p-4 shadow-md ring-1 ring-slate-200"
              >
                <div className="flex w-full items-center gap-2 ">
                  <img
                    src={post.avatar}
                    alt={post.username}
                    className="aspect-square h-8 rounded-full bg-gray-200"
                  />
                  <div className="flex w-full flex-col items-start ">
                    <p>{post.username}</p>
                    <span className="text-xs text-gray-400">
                      {post.created_at}
                    </span>
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-4 rounded-sm shadow-md ring-1 ring-slate-200 transition-transform hover:-translate-y-1 hover:cursor-pointer hover:shadow-lg">
                  <img src={post.thumbnail} alt={post.title} className="h-16" />
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
      </main>
    </>
  );
}
