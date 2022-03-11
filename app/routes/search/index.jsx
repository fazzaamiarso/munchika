import {
  useLoaderData,
  json,
  useFetcher,
  useTransition,
  redirect,
  useSubmit,
  useSearchParams,
} from 'remix';
import { getPostWithTrack } from '../../utils/geniusApi.server';
import { supabase } from '../../utils/supabase.server';
import { getUserId } from '~/utils/session.server';
import { PostCard, PostCardSkeleton } from '../../components/post-card';
import { useEffect, useState, useRef } from 'react';
import { Listbox } from '@headlessui/react';
import { SortAscendingIcon, SortDescendingIcon } from '@heroicons/react/outline';

export const loader = async ({ request }) => {
  const userId = await getUserId(request);
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('term') ?? null;
  const currPage = searchParams.get('currPage') ? parseInt(searchParams.get('currPage')) : 0;
  const actionType = searchParams.get('action');
  const sortValue = searchParams.get('sortValue');

  if (actionType === 'clear') return redirect('/search');

  if (searchTerm === null) {
    const { data } = await supabase
      .from('post')
      .select('*, user!post_author_id_fkey (username, avatar_url)')
      .order('created_at', { ascending: sortValue === 'CREATED_ASC' })
      .range(currPage * 10, (currPage + 1) * 10 - 1);

    return json({
      data: await getPostWithTrack(data),
      userId,
    });
  }
  const { data: fullTextData } = await supabase
    .from('post')
    .select('*, user!post_author_id_fkey (username, avatar_url)')
    .order('created_at', { ascending: sortValue === 'CREATED_ASC' })
    .textSearch('fts', searchTerm, { type: 'plain' });

  return json({
    data: await getPostWithTrack(fullTextData),
    userId,
  });
};

const SORTER = [
  {
    name: 'Recent',
    value: 'CREATED_DESC',
    Icon: SortDescendingIcon,
  },
  {
    name: 'Oldest',
    value: 'CREATED_ASC',
    Icon: SortAscendingIcon,
  },
];

export default function SearchPost() {
  const { data, userId } = useLoaderData();
  const fetcher = useFetcher();
  const transition = useTransition();
  const submit = useSubmit();

  const [postList, setPostList] = useState(data);
  const [sortValue, setSortValue] = useState(SORTER[0]);

  const boxRef = useRef(null);
  const [shouldFetch, setShouldFetch] = useState(true);
  const [currPage, setCurrPage] = useState(1);
  const [initial, setInitial] = useState(true);
  const [searchParams] = useSearchParams();

  const searchURL = `/search?currPage=${currPage}&sortValue=${sortValue.value}&${
    searchParams.get('term') ?? ''
  }`;
  const isSearching =
    transition.type === 'loaderSubmissionRedirect' || transition.type === 'loaderSubmission';

  const handleSort = selected => {
    submit({ sortValue: selected.value }, { method: 'get' });
    setSortValue(selected);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!shouldFetch || fetcher.state !== 'idle' || data.length < 10) return;
      if (shouldFetch && boxRef.current.getBoundingClientRect().top < 1000) {
        fetcher.load(searchURL);
        setCurrPage(prev => prev + 1);
        setInitial(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldFetch, fetcher, data, searchURL]);

  useEffect(() => {
    if (isSearching) {
      setInitial(true);
      setCurrPage(1);
      setShouldFetch(true);
      return;
    }
  }, [isSearching]);

  useEffect(() => {
    if (fetcher.state !== 'idle') return;
    if (initial) return setPostList(data);
    if (fetcher.data?.data && fetcher.data.data.length < 10) {
      setShouldFetch(false);
      setPostList(prev => [...prev, ...fetcher.data.data]);
      return;
    }
  }, [fetcher, initial, data]);

  return (
    <div className="mx-auto flex min-h-screen w-full flex-col items-center gap-4">
      <Listbox value={sortValue} onChange={handleSort}>
        <div className="relative w-3/12">
          <Listbox.Button className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-1 text-white">
            {sortValue.name} <sortValue.Icon className="h-4" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10  w-full cursor-default rounded-md bg-white shadow-md ring-2 ring-gray-500/20">
            {SORTER.map((item, idx) => {
              return (
                <Listbox.Option
                  key={idx}
                  value={item}
                  className={`flex items-center justify-between p-1 hover:cursor-pointer ${
                    item.value === sortValue.value ? 'bg-blue-100' : ''
                  }`}
                >
                  {item.name} <item.Icon className="h-4" />
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </div>
      </Listbox>
      {isSearching ? (
        <div className="mx-auto w-full space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : postList.length ? (
        <>
          <ul className=" mx-auto flex w-full flex-col items-center space-y-8">
            {postList.map(post => {
              return <PostCard key={post.id} postWithUser={post} currentUserId={userId} />;
            })}
            <div ref={boxRef} />
            {fetcher.state === 'loading' ? <PostCardSkeleton /> : null}
          </ul>
        </>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-lg font-bold">Whoops... There is no post found</p>
          <button
            form="search"
            type="submit"
            name="action"
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

export const ErrorBoundary = () => {
  return (
    <div className="flex h-full w-screen flex-col items-center justify-center ">
      <h1 className="text-2xl">Oooops.. something went wrong!</h1>
      <p>We are working on right now!</p>
    </div>
  );
};
