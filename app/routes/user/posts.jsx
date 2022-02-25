import { Form, Link, useFetcher, useLoaderData } from 'remix';
import { getUserId } from '../../utils/session.server';
import {
  fetchFromGenius,
  removeTranslation,
} from '../../utils/geniusApi.server';
import { supabase } from '../../../server/db.server';
import { Menu } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/solid';
import { Dialog } from '@headlessui/react';
import { useState } from 'react';

export const loader = async ({ request }) => {
  const userId = await getUserId(request);

  const { data: userPosts } = await supabase
    .from('post')
    .select('*')
    .eq('author_id', userId);

  const tracks = userPosts.map(async post => {
    const response = await fetchFromGenius(`songs/${post.track_id}`);
    const track = response.song;
    return {
      ...post,
      title: removeTranslation(track.title),
      artist: track.primary_artist.name,
      thumbnail: track.song_art_image_thumbnail_url,
    };
  });
  const postsData = await Promise.all(tracks);
  return {
    postsData,
  };
};

export const action = async ({ request }) => {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const postId = formData.get('postId');
  await supabase.from('post').delete().match({ id: postId, author_id: userId });

  return null;
};

export default function UserPost() {
  const { postsData } = useLoaderData();
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher();

  const handleDelete = async e => {
    setIsOpen(false);
    fetcher.submit(e.currentTarget);
  };

  return (
    <main>
      <h3>Your post</h3>
      {postsData.length ? (
        <ul className="flex w-full flex-col items-center px-4 ">
          {postsData.map(post => {
            return (
              <li key={post.id} className="max-w-lg rounded-md p-4 shadow-lg ">
                <div className="flex w-full">
                  {fetcher.state === 'submitting' ? null : (
                    <Dialog
                      open={isOpen}
                      as="div"
                      className="fixed inset-0 z-10 overflow-y-auto"
                      onClose={() => setIsOpen(false)}
                    >
                      <div className="min-h-screen px-4 text-center">
                        <Dialog.Overlay className="fixed inset-0" />

                        {/* This element is to trick the browser into centering the modal contents. */}
                        <span
                          className="inline-block h-screen align-middle"
                          aria-hidden="true"
                        >
                          &#8203;
                        </span>

                        <div className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                          <Dialog.Title
                            as="h3"
                            className="text-lg font-medium leading-6 text-gray-900"
                          >
                            Payment successful
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Your payment has been successfully submitted.
                              We’ve sent you an email with all of the details of
                              your order.
                            </p>
                          </div>

                          <div className="mt-4">
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              onClick={() => setIsOpen(false)}
                            >
                              Got it, thanks!
                            </button>
                            <fetcher.Form method="post">
                              <button
                                name="postId"
                                value={post.id}
                                type="button"
                                onClick={handleDelete}
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              >
                                Delete
                              </button>
                            </fetcher.Form>
                          </div>
                        </div>
                      </div>
                    </Dialog>
                  )}
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <DotsVerticalIcon className="h-4" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        <Link
                          to={`/post/edit/${post.id}`}
                          className="block px-4 py-2 text-sm text-gray-700"
                        >
                          Edit post
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <button
                          onClick={() => setIsOpen(true)}
                          className="block px-4 py-2 text-sm text-gray-700"
                        >
                          Delete post
                        </button>
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
                <div className="mb-4 flex items-center gap-4 shadow-md transition-transform hover:-translate-y-1 hover:cursor-pointer hover:shadow-lg">
                  <img src={post.thumbnail} alt={post.title} className="h-24" />
                  <div className="pr-4">
                    <p className="text-sm font-semibold">{post.title}</p>
                    <p className="text-xs">{post.artist}</p>
                    <Link
                      to={`/track/${post.track_id}`}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Go to song&apos;s feed ➡
                    </Link>
                  </div>
                </div>
                <section className="space-y-4">
                  <div>
                    <h4 className="text-md font-semibold">Featured lyrics</h4>
                    <p className="text-justify indent-8">{post.lyrics}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-semibold">Thought</h4>
                    <p className="text-justify indent-8">{post.thought}</p>
                  </div>
                </section>
              </li>
            );
          })}
        </ul>
      ) : (
        <div>
          <p>You dont have any post</p>
        </div>
      )}
    </main>
  );
}
