import { Outlet, Form, useLocation, Link, useTransition } from 'remix';
import { useEffect, useRef } from 'react';
import { RefreshIcon } from '@heroicons/react/outline';

export function meta() {
  return {
    title: 'Munchika | Browse',
    description: 'Search for song or post keyword to find what you looking for',
  };
}

const navigation = [
  {
    name: 'Post',
    to: '.',
    resetDestination: '/search',
  },
  {
    name: 'Song',
    to: 'track',
    resetDestination: '/search/track',
  },
];

export default function SearchLayout() {
  const location = useLocation();
  const searchRef = useRef();
  const transition = useTransition();

  useEffect(() => {
    if (transition.type === 'loaderSubmissionRedirect')
      searchRef.current.value = '';
  }, [transition]);
  useEffect(() => {
    searchRef.current.focus();
  }, [location]);

  return (
    <>
      <div className="mx-auto flex w-10/12 max-w-lg flex-col items-center gap-4 py-8">
        <Form
          id="search"
          method="get"
          action={location.pathname}
          className="flex w-full items-center gap-4"
        >
          <input
            type="search"
            name="term"
            autoComplete="off"
            className="w-full rounded-md ring-gray-400 placeholder:text-gray-400"
            ref={searchRef}
            required
            placeholder="Try search a word"
          />
          <button
            type="submit"
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:opacity-90 disabled:opacity-75"
            disabled={
              transition.state === 'submitting' ||
              transition.state === 'loading'
            }
          >
            {transition.state === 'submitting' ? 'Searching...' : 'Search'}
          </button>
          <button
            type="submit"
            name="action"
            value="clear"
            className=" flex items-center gap-1 rounded-md px-4 py-2 text-blue-500 ring-1 ring-blue-500 "
            disabled={
              transition.state === 'submitting' ||
              transition.state === 'loading'
            }
          >
            <span className="hidden sm:inline">Clear</span>{' '}
            <RefreshIcon
              className={`h-5 text-blue-500 ${
                transition.submission?.formData.get('action') === 'clear'
                  ? 'animate-spin'
                  : ''
              }`}
            />
          </button>
        </Form>
        <div className="flex w-full justify-between">
          <ul className="mt-2 flex gap-4">
            {navigation.map(item => {
              return (
                <li key={item.name}>
                  <Link
                    to={item.to}
                    className={`rounded-md font-semibold leading-none ${
                      location.pathname === item.resetDestination
                        ? 'bg-white px-3  py-1 text-blue-500 shadow-md  ring-1 ring-gray-300'
                        : ' text-gray-400 '
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <main className="mx-auto w-5/6 max-w-xl">
        <Outlet />
      </main>
    </>
  );
}
