import {
  useLoaderData,
  json,
  useFetcher,
  useTransition,
  redirect,
} from 'remix';
import { getPostWithTrack } from '../../utils/geniusApi.server';
import { countReaction, supabase } from '../../utils/supabase.server';
import { getUserId } from '~/utils/session.server';
import { PostCard, PostCardSkeleton } from '../../components/post-card';
import { useEffect, useState } from 'react';
import { Listbox } from '@headlessui/react';

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
      .select('*, user!post_author_id_fkey (username, avatar_url)')
      .order('created_at', { ascending: false })
      .range(currPage * 10, (currPage + 1) * 10 - 1);

    const countedPosts = await countReaction(data);
    return json({
      data: await getPostWithTrack(countedPosts),
      userId,
    });
  }
  const { data: fullTextData } = await supabase
    .from('post')
    .select('*, user (username, avatar_url)')
    .textSearch('fts', searchTerm, { type: 'plain' });

  const countedPosts = await countReaction(fullTextData);

  return json({
    data: await getPostWithTrack(countedPosts),
    userId,
  });
};

const SORTER = [
  {
    name: 'None',
    value: 'DEFAULT',
  },
  {
    name: 'Recent',
    value: 'CREATED_ASC',
  },
  {
    name: 'Oldest',
    value: 'CREATED_DESC',
  },
];

export default function SearchPost() {
  const { data, userId } = useLoaderData();
  const fetcher = useFetcher();
  const transition = useTransition();
  const [currPage, setCurrentPage] = useState(1);
  const [postList, setPostList] = useState(data);
  const [initial, setInitial] = useState(true);
  const [sortValue, setSortValue] = useState(SORTER[0]);

  const sortedData =
    sortValue.value === 'DEFAULT'
      ? postList
      : sortValue.value === 'CREATED_DESC'
      ? [...postList].sort(
          (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
        )
      : postList;

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

  if (
    transition.type === 'loaderSubmission' ||
    transition.type === 'loaderSubmissionRedirect'
  )
    return (
      <div className="space-y-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-4">
      <Listbox value={sortValue} onChange={setSortValue}>
        <div className="relative">
          <Listbox.Button className="w-max rounded-md bg-blue-500 px-4 py-1 text-white">
            {sortValue.value === 'DEFAULT' ? 'Sort' : sortValue.name}
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 cursor-default bg-white shadow-md">
            {SORTER.map((item, idx) => {
              return (
                <Listbox.Option key={idx} value={item}>
                  {item.name}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </div>
      </Listbox>
      {postList.length ? (
        <>
          <ul className=" space-y-8">
            {sortedData.map(post => {
              return (
                <PostCard
                  key={post.id}
                  postWithUser={post}
                  currentUserId={userId}
                />
              );
            })}
          </ul>
          {data.length < 10 && initial ? null : fetcher.data?.data.length <
              10 && !initial ? null : (
            <button
              className="rounded-full px-3 py-1 text-blue-500  ring-1 ring-blue-500  "
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
          <button
            form="search"
            type="submit"
            name="_action"
            value="clear"
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:opacity-90 disabled:opacity-75"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
