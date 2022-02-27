import { useLoaderData, json } from 'remix';
import {
  fetchFromGenius,
  removeTranslation,
} from '../../utils/geniusApi.server';
import { supabase } from '../../../server/db.server';
import { getUserId } from '~/utils/session.server';
import { PostCard } from '../../components/post-card';

const toTextSearchFormat = query => {
  const formatted = query.trim().split(' ');
  return formatted.join('|');
};

export const loader = async ({ request }) => {
  const userId = await getUserId(request);
  const newUrl = new URL(request.url);
  const searchTerm = newUrl.searchParams.get('term') ?? null;

  if (searchTerm === null) {
    const { data } = await supabase
      .from('post')
      .select('*, user (username, avatar_url)')
      .order('created_at', { ascending: false });

    const tracks = data.map(async post => {
      const response = await fetchFromGenius(`songs/${post.track_id}`);
      const track = response.song;
      return {
        ...post,
        created_at: post.created_at,
        username: post.user.username,
        avatar: post.user.avatar_url,
        title: removeTranslation(track.title),
        artist: track.primary_artist.name,
        thumbnail: track.song_art_image_thumbnail_url,
      };
    });
    const trackDatas = await Promise.all(tracks);
    return json({
      data: trackDatas,
      userId,
    });
  }
  const ftsText = toTextSearchFormat(searchTerm) ?? null;
  const { data: fullTextData } = await supabase
    .from('post')
    .select('*, user (username, avatar_url)')
    .textSearch('thought', ftsText);

  const tracks = fullTextData.map(async post => {
    const response = await fetchFromGenius(`songs/${post.track_id}`);
    const track = response.song;
    return {
      ...post,
      created_at: post.created_at,
      username: post.user.username,
      avatar: post.user.avatar_url,
      title: removeTranslation(track.title),
      artist: track.primary_artist.name,
      thumbnail: track.song_art_image_thumbnail_url,
    };
  });
  const trackDatas = await Promise.all(tracks);
  return json({
    data: trackDatas,
    userId,
  });
};

export default function SearchPost() {
  const { data, userId } = useLoaderData();

  if (!data) return <p>No data Found</p>;

  return (
    <div className="flex h-screen w-full flex-col items-center">
      <ul className=" space-y-8">
        {data.map(post => {
          return (
            <PostCard
              key={post.id}
              postWithUser={post}
              currentUserId={userId}
            />
          );
        })}
      </ul>
    </div>
  );
}
