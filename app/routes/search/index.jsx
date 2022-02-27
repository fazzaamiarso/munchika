import { useLoaderData, json, Link, useFetcher } from 'remix';
import {
  fetchFromGenius,
  removeTranslation,
} from '../../utils/geniusApi.server';
import { supabase } from '../../../server/db.server';
import { getUserId } from '~/utils/session.server';
import { PostCard } from '../../components/post-card';
import { useEffect, useState } from 'react';

const toTextSearchFormat = query => {
  const formatted = query.trim().split(' ');
  return formatted.join('|');
};

export const loader = async ({ request }) => {
  const userId = await getUserId(request);
  const newUrl = new URL(request.url);
  const searchTerm = newUrl.searchParams.get('term') ?? null;
  const currPage = newUrl.searchParams.get('currPage')
    ? parseInt(newUrl.searchParams.get('currPage'))
    : 0;
  if (searchTerm === null) {
    const { data } = await supabase
      .from('post')
      .select('*, user (username, avatar_url)')
      .order('created_at', { ascending: false })
      .range(currPage * 10, (currPage + 1) * 10 - 1);

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
  const fetcher = useFetcher();
  const [currPage, setCurrentPage] = useState(1);
  const [postList, setPostList] = useState(data);

  const handleLoadMore = () => {
    fetcher.load(`/search?currPage=${currPage}`);
    setCurrentPage(prevPage => prevPage + 1);
  };

  useEffect(() => {
    if (fetcher.type === 'done') {
      setPostList(prev => [...prev, ...fetcher.data.data]);
    }
  }, [fetcher]);
  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      {postList.length ? (
        <>
          <ul className=" space-y-8">
            {postList.map(post => {
              return (
                <PostCard
                  key={post.id}
                  postWithUser={post}
                  currentUserId={userId}
                />
              );
            })}
          </ul>
          {fetcher.data?.data.length < 10 ? null : (
            <button
              className="mt-4 rounded-full bg-blue-600 px-3 py-1 font-semibold text-white"
              onClick={handleLoadMore}
            >
              {fetcher.state === 'loading' || fetcher.state === 'submitting'
                ? 'Loading..'
                : 'Load More'}
            </button>
          )}
        </>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-lg font-bold">Whoops... There is no post found</p>
          <Link
            to={'/search'}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:opacity-90 disabled:opacity-75"
          >
            Clear
          </Link>
        </div>
      )}
    </div>
  );
}
