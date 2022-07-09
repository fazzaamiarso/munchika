import { json, LoaderFunction, redirect } from '@remix-run/node';
import {
  useCatch,
  useFetcher,
  useLoaderData,
  useSearchParams,
  useSubmit,
  useTransition,
} from '@remix-run/react';
import { getPostWithTrack } from '../../utils/geniusApi.server';
import { supabase } from '../../utils/supabase.server';
import { getUserId } from '~/utils/session.server';
import { PostCard, PostCardSkeleton, PostWithTrack } from '../../components/post-card';
import { Fragment, useEffect, useState, useRef } from 'react';
import { Listbox } from '@headlessui/react';
import { SortAscendingIcon, SortDescendingIcon } from '@heroicons/react/outline';
import { Post } from '~/types/database';

type LoaderData = {
  data: PostWithTrack[];
  userId: string;
};

type FetchActions = 'sort' | 'clear' | 'search' | 'fetchMore' | 'initialLoad';

const fetchPosts = (options?: { orderAscending?: boolean }) => {
  return supabase
    .from<Post>('post')
    .select('*, user!post_author_id_fkey (username, avatar_url)')
    .order('created_at', { ascending: options?.orderAscending ?? false });
};
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('term') ?? null;
  const currPage = Number(searchParams.get('currPage')) ?? 0;
  const actionType: FetchActions = (searchParams.get('action') as FetchActions) ?? 'initialLoad';
  const sortValue = searchParams.get('sortValue');

  let posts: PostWithTrack[] = [];
  switch (actionType) {
    case 'clear':
      throw redirect('/search');
    case 'initialLoad':
    case 'sort': {
      const { data } = await fetchPosts({ orderAscending: sortValue === 'CREATED_ASC' }).range(
        currPage * 10,
        (currPage + 1) * 10 - 1,
      );
      posts = data ? await getPostWithTrack(data) : [];
      break;
    }
    case 'fetchMore': {
      const { data } = await fetchPosts({ orderAscending: sortValue === 'CREATED_ASC' }).range(
        10,
        (currPage + 1) * 10 - 1,
      );
      posts = data ? await getPostWithTrack(data) : [];
      break;
    }
    case 'search': {
      if (!searchTerm)
        throw Error(
          `Search action should be coupled with a search term. Instead, received: ${searchTerm}`,
        );
      const { data: fullTextData, error } = await fetchPosts({
        orderAscending: sortValue === 'CREATED_ASC',
      }).textSearch('fts', searchTerm, { type: 'plain' });

      if (error || !fullTextData) {
        throw json({ message: "Couldn't find what you're looking for!" }, 500);
      }
      posts = await getPostWithTrack(fullTextData);
      break;
    }
    default: {
      throw Error(`Unhandled action type : ${actionType}`);
    }
  }

  return json({ data: posts, userId });
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
] as const;
type SortList = typeof SORTER[number];

export default function SearchPost() {
  const { data: initialData, userId } = useLoaderData<LoaderData>();
  const fetcher = useFetcher<LoaderData>();
  const transition = useTransition();
  const submit = useSubmit();

  const [postList, setPostList] = useState(initialData);
  const [sortValue, setSortValue] = useState<SortList>(SORTER[0]);

  const boxRef = useRef<HTMLDivElement>(null);
  const [currPage, setCurrPage] = useState(1);
  const [searchParams] = useSearchParams();

  const hasNoMoreData = postList.length < currPage * 10;
  const isFetchMoreRange = boxRef.current && boxRef.current.getBoundingClientRect().top < 1000;
  const shouldFetch = hasNoMoreData || isFetchMoreRange;

  const searchURL = `/search?currPage=${currPage}&sortValue=${sortValue.value}&${
    searchParams.get('term') ?? ''
  }`;

  const transitionAction = transition.submission?.formData.get('action');
  const shouldResetToInitialState =
    transitionAction === 'search' || transitionAction === 'clear' || transitionAction === 'sort';

  const handleSort = (selected: SortList) => {
    submit({ sortValue: selected.value, action: 'sort' }, { method: 'get' });
    setSortValue(selected);
  };

  useEffect(() => {
    if (fetcher.data?.data) {
      setPostList([...initialData, ...fetcher.data.data]);
    }
  }, [fetcher, initialData]);

  useEffect(() => {
    const handleScroll = () => {
      if (!shouldFetch) return;
      fetcher.submit({ action: 'fetchMore' }, { method: 'get', action: searchURL });
      setCurrPage(prev => prev + 1);
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldFetch, fetcher, searchURL]);

  useEffect(() => {
    if (shouldResetToInitialState) setCurrPage(1);
  }, [shouldResetToInitialState]);

  return (
    <div className="mx-auto flex min-h-screen w-full flex-col items-center gap-4">
      <Listbox value={sortValue} onChange={handleSort}>
        <div className="relative w-3/12">
          <Listbox.Button className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-1 text-white">
            <span className="sr-only">Sort by</span> {sortValue.name}{' '}
            <sortValue.Icon className="h-4" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10  w-full cursor-default rounded-md bg-white shadow-md ring-2 ring-gray-500/20">
            {SORTER.map((item, idx) => {
              return (
                <Listbox.Option key={idx} value={item} as={Fragment}>
                  {({ selected, active }) => (
                    <li
                      className={`flex items-center justify-between p-1  ring-1 hover:cursor-pointer  ${
                        selected ? ' font-semibold' : ''
                      } ${active ? 'bg-blue-100' : ''}`}
                    >
                      {item.name} <item.Icon className="h-4" />
                    </li>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </div>
      </Listbox>
      {shouldResetToInitialState ? (
        <div aria-hidden="true" className="mx-auto w-full space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : postList.length ? (
        <>
          <ul className=" mx-auto flex w-full flex-col items-center space-y-8">
            {postList.map(post => {
              return (
                <PostCard key={post.id} postWithUser={post} currentUserId={userId} displayTrack />
              );
            })}
            {fetcher.state === 'loading' ? <PostCardSkeleton /> : null}
          </ul>
          <div ref={boxRef} />
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

export const CatchBoundary = () => {
  const caught = useCatch();
  if (caught.status === 500) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center ">
        <div className="text-center">
          <h1 className="text-2xl ">{caught.data.message}</h1>
          <p>We are working on it right now!</p>
        </div>
      </div>
    );
  }
};
export const ErrorBoundary = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center ">
      <div className="text-center">
        <h1 className="text-2xl ">Oooops.. something went wrong!</h1>
        <p>We are working on it right now!</p>
        <p>Please try to clear or reload the page</p>
      </div>
    </div>
  );
};
