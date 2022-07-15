import { Menu } from '@headlessui/react';
import { Link, useLocation } from '@remix-run/react';
import { DotsHorizontalIcon } from '@heroicons/react/solid';

type Props = { postId: string; openDialog: () => void };

export const PostMenu = ({ postId, openDialog }: Props) => {
  const location = useLocation();
  return (
    <>
      <Menu as="div" className="relative ml-3 py-2">
        <Menu.Button
          data-cy="post-menu"
          className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          <span className="sr-only">Open post menu</span>
          <DotsHorizontalIcon className="h-4" aria-hidden="true" />
        </Menu.Button>
        <Menu.Items className="absolute  right-0 z-40 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <Link
                to={`/post/edit/${postId}`}
                className={`block px-4 py-2 text-sm ${active ? 'bg-gray-200' : ''}`}
              >
                Edit post
              </Link>
            )}
          </Menu.Item>
          {location.pathname === '/user/posts' ? (
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`block w-full px-4 py-2 text-left text-sm ${
                    active ? 'bg-gray-200' : ''
                  }`}
                  name="postId"
                  value={postId}
                  type="submit"
                  onClick={openDialog}
                >
                  Delete post
                </button>
              )}
            </Menu.Item>
          ) : null}
        </Menu.Items>
      </Menu>
    </>
  );
};
