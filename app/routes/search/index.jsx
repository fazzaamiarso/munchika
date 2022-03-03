import {
  useLoaderData,
  json,
  Link,
  useFetcher,
  useTransition,
  redirect,
} from 'remix';
import { getPostWithTrack } from '../../utils/geniusApi.server';
import { toTextSearchFormat } from '../../utils/supabase.server';
import { supabase } from '../../../server/db.server';
import { getUserId } from '~/utils/session.server';
import { PostCard } from '../../components/post-card';
import { useEffect, useState } from 'react';

export const loader = async ({ request }) => {
  const userId = await getUserId(request);
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('term') ?? null;
  const currPage = searchParams.get('currPage')
    ? parseInt(searchParams.get('currPage'))
    : 0;
  const actionType = searchParams.get('_action');

  if (actionType === 'clear') return redirect('/search');

  if (searchTerm === null) {
    const { data } = await supabase
      .from('post')
      .select('*, user (username, avatar_url)')
      .order('created_at', { ascending: false })
      .range(currPage * 10, (currPage + 1) * 10 - 1);

    return json({
      data: await getPostWithTrack(data),
      userId,
    });
  }
  const ftsText = toTextSearchFormat(searchTerm);
  const { data: fullTextData } = await supabase
    .from('post')
    .select('*, user (username, avatar_url)')
    .textSearch('thought', ftsText);

  return json({
    data: await getPostWithTrack(fullTextData),
    userId,
  });
};

export default function SearchPost() {
  const { data, userId } = useLoaderData();
  const fetcher = useFetcher();
  const transition = useTransition();
  const [currPage, setCurrentPage] = useState(1);
  const [postList, setPostList] = useState(data);
  const [initial, setInitial] = useState(true);

  const handleLoadMore = () => {
    fetcher.load(`/search?currPage=${currPage}`);
    setInitial(false);
    setCurrentPage(prevPage => prevPage + 1);
  };

  useEffect(() => {
    if (transition.type === 'loaderSubmission') return setInitial(true);
    if (fetcher.type === 'done' && !initial) {
      return setPostList(prev => [...prev, ...fetcher.data.data]);
    }
    if (transition.type === 'idle' && initial) {
      return setPostList(data);
    }
  }, [fetcher, transition, data, initial]);
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
          {fetcher.data?.data.length < 10 || data.length < 10 ? null : (
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
