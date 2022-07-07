import { Link, useFetcher } from '@remix-run/react';
import { PostMenu } from './post-menu';
import { useState, useRef, MouseEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { ExclamationIcon } from '@heroicons/react/outline';
import { PostWithUser } from '~/types/database';

type PostWithTrack = PostWithUser & {
  thumbnail: string;
  artist: string;
  title: string;
};

type Post1 = {
  currentUserId: string | null;
  postWithUser: PostWithTrack;
  displayUser?: boolean;
  displayTrack: true;
};
type Post2 = {
  currentUserId: string | null;
  postWithUser: PostWithUser;
  displayUser?: boolean;
  displayTrack?: never;
};

type PostCardProps = Post1 | Post2;

export const PostCard = ({
  postWithUser: post,
  currentUserId,
  displayUser,
  displayTrack,
}: PostCardProps) => {
  const fetcher = useFetcher();
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const isPostOwner = post.author_id === currentUserId;

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    if (!(e.target instanceof HTMLButtonElement)) return;
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    fetcher.submit(
      { postId: e.target.value, action: 'delete' },
      { action: '/user/posts', method: 'post' },
    );
  };

  return (
    <li
      tabIndex={0}
      className="mx-auto w-full max-w-lg space-y-4 self-stretch rounded-md bg-white p-4 shadow-md ring-1 ring-slate-300"
      aria-label={displayTrack ? post.title : 'Thought on a song'}
      aria-describedby={`post-user${post.id} post-content${post.id}`}
    >
      <div className="flex w-full items-center gap-2 ">
        {displayUser ? (
          <>
            <img
              role="presentation"
              src={post.avatar_url}
              className="aspect-square h-8 rounded-full bg-gray-200"
            />
            <div className="flex w-full flex-col items-start" id={`post-user${post.id}`}>
              <p>
                <span className="sr-only">created by:</span> {isPostOwner ? 'You' : post.username}
              </p>
              <span className="text-xs text-gray-600">
                <span className="sr-only">created_at:</span>{' '}
                {new Date(post.created_at).toDateString()}
              </span>
            </div>
          </>
        ) : null}
        {isPostOwner ? (
          <div className="ml-auto ">
            <PostMenu postId={post.id} openDialog={() => setIsOpen(true)} />
          </div>
        ) : null}
      </div>
      {displayTrack ? (
        <div className="relative mb-4 flex items-center gap-4 rounded-sm shadow-md ring-1 ring-slate-200 transition-all focus-within:ring-2 focus-within:ring-gray-300 hover:cursor-pointer hover:ring-2 hover:ring-gray-300">
          <img
            src={post.thumbnail}
            role="presentation"
            height="64px"
            width="64px"
            className="h-16"
          />
          <div className="pr-4">
            <Link
              to={`/track/${post.track_id}`}
              aria-label={`Go to ${post.title} by ${post.artist} feed`}
              className="block text-sm font-semibold after:absolute after:inset-0 after:z-10"
            >
              {post.title}
            </Link>
            <p className="text-xs">{post.artist}</p>
          </div>
        </div>
      ) : null}
      <div className="space-y-4 break-words" id={`post-content${post.id}`}>
        {post.lyrics === '' ? null : (
          <div>
            <p className="font-semibold">Featured lyrics</p>
            <p className="text-justify indent-8  text-gray-700">{post.lyrics}</p>
          </div>
        )}
        <div>
          <p className="font-semibold">
            Thought <span className="sr-only">on this song:</span>
          </p>
          <p className="text-justify indent-8 text-gray-700">{post.thought}</p>
        </div>
      </div>
      <Dialog
        className="fixed inset-0 z-20 "
        open={isOpen}
        onClose={() => setIsOpen(false)}
        initialFocus={cancelRef}
      >
        <div className="h-screen w-screen">
          <Dialog.Overlay className="fixed inset-0 bg-gray-400/25" />
          <div className="fixed top-1/2 left-1/2 z-30 w-full -translate-x-1/2 -translate-y-1/2">
            <div className="mx-auto w-10/12 max-w-xl space-y-8 rounded-md bg-white p-6 text-center shadow-lg ring-2 ring-gray-400/10">
              <div className="space-y-2 sm:flex sm:items-start sm:gap-4  sm:space-y-0">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="sm:text-left">
                  <Dialog.Title className="text-lg font-semibold ">Delete post</Dialog.Title>
                  <Dialog.Description className="text-gray-600">
                    Are you sure you wan to delete your post on{' '}
                    <span className="font-semibold">{displayTrack && post.title}</span>?
                  </Dialog.Description>
                </div>
              </div>
              <div className=" sm:flex sm:flex-row-reverse  ">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  value={post.id}
                  onClick={handleDelete}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsOpen(false)}
                  ref={cancelRef}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </li>
  );
};

export const PostCardSkeleton = ({ displayUser = true, displayTrack = true }) => {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-lg animate-pulse space-y-4 self-stretch rounded-md bg-white p-4 shadow-md ring-1 ring-slate-300"
    >
      <div className="flex w-full items-center gap-2 ">
        {displayUser ? (
          <>
            <div className="aspect-square h-8 rounded-full bg-gray-300" />
            <div className="flex w-full flex-col items-start gap-1">
              <div className="h-4 w-5/12 bg-gray-300 " />
              <div className="h-2 w-3/12 bg-gray-300 " />
            </div>
          </>
        ) : null}
      </div>
      {displayTrack ? (
        <div className="mb-4 flex w-full items-center  gap-4 rounded-sm shadow-md ">
          <div className="aspect-square h-16 bg-gray-300" />
          <div className="w-full space-y-1 pr-4">
            <div className="h-4 w-7/12 bg-gray-300 " />
            <div className="h-2 w-5/12 bg-gray-300 " />
          </div>
        </div>
      ) : null}
      <section className="space-y-4 ">
        <div className="space-y-1 overflow-hidden">
          <div className="h-4  w-2/12 bg-gray-300" />
          <div className="ml-4 h-2 w-full bg-gray-300" />
          <div className="h-2 w-full bg-gray-300" />
          <div className="h-2  w-full bg-gray-300" />
        </div>
        <div className="space-y-1 overflow-hidden">
          <div className="h-4  w-2/12 bg-gray-300" />
          <div className="ml-4 h-2 w-full bg-gray-300" />
          <div className="h-2  w-full bg-gray-300" />
          <div className="h-2  w-full bg-gray-300" />
        </div>
      </section>
    </div>
  );
};
