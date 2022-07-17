import { json, LoaderFunction, redirect } from '@remix-run/node';
import {
  useCatch,
  useFetcher,
  useLoaderData,
  useLocation,
  useSearchParams,
  useSubmit,
} from '@remix-run/react';
import { getPostWithTrack } from '../../utils/geniusApi.server';
import { supabase } from '../../utils/supabase.server';
import { getUserId } from '~/utils/session.server';
import { PostCard, PostCardSkeleton, PostWithTrack } from '../../components/post-card';
import { Fragment, useEffect, useState, useRef } from 'react';
import { Listbox } from '@headlessui/react';
import { SortAscendingIcon, SortDescendingIcon } from '@heroicons/react/outline';
import { Post } from '~/types/database';
import { mergeClassNames } from '~/utils/mergeClassNames';
import { createQueryString } from '~/utils/url';
import { usePrevious } from '~/hooks/usePrevious';
import { useTransitionActionType } from '~/hooks/useTransitionActionType';
import type { SearchActions } from '../search';

const POST_PER_LOAD = 10;
const INITIAL_PAGE = 1;
type LoaderData = {
  data: PostWithTrack[];
  hasNextPage: boolean;
  userId: string;
};

type FetchActions = SearchActions | 'fetchMore' | 'initialLoad';

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
  const totalPostsCount = (currPage + 1) * POST_PER_LOAD;

  let posts: PostWithTrack[] = [];
  let hasNextPage: boolean = false;
  switch (actionType) {
    case 'clear':
      throw redirect('/search');
    case 'initialLoad': {
      const { data } = await fetchPosts({ orderAscending: sortValue === 'CREATED_ASC' }).range(
        0,
        totalPostsCount - 1,
      );
      const { data: nextPageData } = await fetchPosts().range(totalPostsCount, totalPostsCount + 1);
      posts = data ? await getPostWithTrack(data) : [];
      hasNextPage = Boolean(nextPageData?.length);
      break;
    }
    case 'fetchMore': {
      const { data } = await fetchPosts({ orderAscending: sortValue === 'CREATED_ASC' }).range(
        currPage * POST_PER_LOAD,
        totalPostsCount - 1,
      );
      const { data: nextPageData } = await fetchPosts().range(totalPostsCount, totalPostsCount + 1);
      posts = data ? await getPostWithTrack(data) : [];
      hasNextPage = Boolean(nextPageData?.length);
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

  return json({ data: posts, userId, hasNextPage });
};

const sortItems = [
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
type SortList = typeof sortItems[number];

export default function SearchPost() {
  const { data: initialData, userId, hasNextPage } = useLoaderData<LoaderData>();
  const fetcher = useFetcher<LoaderData>();
  const submit = useSubmit();

  const location = useLocation();
  const prevLocationKey = usePrevious(location.key);
  const isSameLocation = prevLocationKey === location.key;

  const [postList, setPostList] = useState(initialData);
  const [sortValue, setSortValue] = useState<SortList>(sortItems[0]);

  const boxRef = useRef<HTMLDivElement>(null);
  const currPage = useRef(INITIAL_PAGE);
  const [searchParams] = useSearchParams();

  const isFetchingMoreData = fetcher.state === 'loading';
  const isInitialLoad = currPage.current === INITIAL_PAGE;
  const hasMoreData =
    (fetcher.data?.hasNextPage && !isInitialLoad) || (hasNextPage && isInitialLoad);

  const transitionAction = useTransitionActionType<FetchActions>();
  const shouldResetToInitialState =
    (transitionAction === 'search' || transitionAction === 'clear') && !isSameLocation;

  const handleSort = (selected: SortList) => {
    submit({ sortValue: selected.value }, { method: 'get' });
    setSortValue(selected);
  };

  const queryString = createQueryString({
    sortValue: sortValue.value,
    currPage: String(currPage.current),
    term: searchParams.get('term') ?? '',
    action: 'fetchMore',
  });
  const searchURL = `/search?index=&${queryString}`;

  useEffect(() => {
    if (initialData) setPostList(initialData);
  }, [initialData]);

  useEffect(() => {
    if (!isSameLocation) {
      fetcher.load('/reset-fetcher');
      currPage.current = INITIAL_PAGE;
    }
  }, [fetcher, isSameLocation]);

  useEffect(() => {
    if (hasMoreData && isSameLocation && fetcher.type === 'done')
      setPostList(prev => [...prev, ...(fetcher.data?.data ?? [])]);
  }, [hasMoreData, fetcher, isSameLocation]);

  useEffect(() => {
    const handleScroll = () => {
      const isFetchMoreRange = boxRef.current && boxRef.current.getBoundingClientRect().top < 1000;
      const shouldFetch = hasMoreData && isFetchMoreRange && !isFetchingMoreData;
      if (!shouldFetch) return;
      fetcher.load(searchURL);
      currPage.current++;
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetcher, hasMoreData, searchURL, isFetchingMoreData, isInitialLoad]);

  return (
    <div className="mx-auto flex min-h-screen w-full flex-col items-center gap-4">
      <Listbox value={sortValue} onChange={handleSort}>
        <div className="relative w-3/12">
          <Listbox.Button className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-1 text-white">
            <span className="sr-only">Sort by</span> {sortValue.name}{' '}
            <sortValue.Icon className="h-4" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10  w-full cursor-default rounded-md bg-white shadow-md ring-2 ring-gray-500/20">
            {sortItems.map((item, idx) => {
              return (
                <Listbox.Option key={idx} value={item} as={Fragment}>
                  {({ selected, active }) => (
                    <li
                      className={mergeClassNames(
                        `flex items-center justify-between p-1  ring-1 hover:cursor-pointer`,
                        selected ? ' font-semibold' : '',
                        active ? 'bg-blue-100' : '',
                      )}
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
              return <PostCard key={post.id} posts={post} currentUserId={userId} displayTrack />;
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
            Reset
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
