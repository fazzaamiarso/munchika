import { useFetcher, useNavigate } from 'remix';
import { PostMenu } from './post-menu';
import { useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { ExclamationIcon, HeartIcon } from '@heroicons/react/outline';

export const PostCard = ({
  postWithUser: post,
  currentUserId,
  displayUser = true,
  displayTrack = true,
}) => {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const cancelRef = useRef();
  const [isOpen, setIsOpen] = useState(false);

  const isPostOwner = post.author_id === currentUserId;

  const handleToFeed = () => navigate(`/track/${post.track_id}`);
  const handleDelete = e => {
    setIsOpen(false);
    fetcher.submit(
      { postId: e.target.value, action: 'delete' },
      { action: '/user/posts', method: 'post' },
    );
  };

  return (
    <li className="max-w-lg space-y-4 self-stretch rounded-md bg-white p-4 shadow-md ring-1 ring-slate-300">
      <div className="flex w-full items-center gap-2 ">
        {displayUser ? (
          <>
            <img
              src={post.avatar}
              alt={post.username}
              className="aspect-square h-8 rounded-full bg-gray-200"
            />
            <div className="flex w-full flex-col items-start ">
              <p>{isPostOwner ? 'You' : post.username}</p>
              <span className="text-xs text-gray-400">
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
        <div
          onClick={handleToFeed}
          className="mb-4 flex  items-center gap-4 rounded-sm shadow-md ring-1 ring-slate-200 transition-all hover:cursor-pointer hover:ring-2 hover:ring-gray-300"
        >
          <img src={post.thumbnail} alt={post.title} className="h-16" />
          <div className="pr-4">
            <p className="text-sm font-semibold">{post.title}</p>
            <p className="text-xs">{post.artist}</p>
          </div>
        </div>
      ) : null}
      <section className="space-y-4 ">
        {post.lyrics === '' ? null : (
          <div>
            <h4 className="font-semibold">Featured lyrics</h4>
            <p className="text-justify indent-8  text-gray-700">
              {post.lyrics}
            </p>
          </div>
        )}
        <div>
          <h4 className="font-semibold">Thought</h4>
          <p className="text-justify indent-8 text-gray-700">{post.thought}</p>
        </div>
      </section>
      <fetcher.Form
        action="/user/posts"
        method="post"
        className="flex items-center gap-2"
      >
        <input type="text" name="postId" defaultValue={post.id} hidden />
        <button
          type="submit"
          name="action"
          value="reaction"
          disabled={!currentUserId}
        >
          <HeartIcon className="h-4" />
        </button>
        <span className="text-gray-400">{post.reactions ?? 0}</span>
      </fetcher.Form>

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
                  <ExclamationIcon
                    className="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="sm:text-left">
                  <Dialog.Title className="text-lg font-semibold ">
                    Delete post
                  </Dialog.Title>
                  <Dialog.Description className="text-gray-500">
                    Are you sure you wan to delete your post on{' '}
                    <span className="font-semibold">{post.title}</span>?
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

export const PostCardSkeleton = ({
  displayUser = true,
  displayTrack = true,
}) => {
  return (
    <div className="max-w-lg animate-pulse space-y-4 self-stretch rounded-md bg-white p-4 shadow-md ring-1 ring-slate-300">
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
