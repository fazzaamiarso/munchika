import { Outlet, Form, useLocation, Link, useTransition } from 'remix';
import { useEffect, useRef } from 'react';
export default function SearchLayout() {
  const location = useLocation();
  const searchRef = useRef();
  const transition = useTransition();

  useEffect(() => {
    searchRef.current.focus();
  }, []);

  return (
    <>
      <div className="mx-auto flex w-10/12 max-w-lg flex-col items-center gap-4 py-8">
        <Form
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
            placeholder="Try searching by keyword"
          />
          <button
            type="submit"
            className="rounded-md bg-blue-500 px-4 py-2 text-white"
            disabled={
              transition.state === 'submitting' ||
              transition.state === 'loading'
            }
          >
            {transition.state === 'submitting' ? 'Searching...' : 'Search'}
          </button>
        </Form>
        <ul className="flex gap-4">
          <li>
            <Link
              to="."
              className={`rounded-md font-semibold leading-none ${
                location.pathname === '/search'
                  ? 'px-3 py-1  text-blue-500 shadow-md ring-1  ring-gray-300'
                  : ' text-gray-400 '
              }`}
            >
              Post
            </Link>
          </li>
          <li>
            <Link
              to="track"
              className={`rounded-md font-semibold leading-none ${
                location.pathname === '/search/track'
                  ? 'px-3 py-1  text-blue-500 shadow-md ring-1  ring-gray-300'
                  : ' text-gray-400 '
              }`}
            >
              Song
            </Link>
          </li>
        </ul>
      </div>
      <main className="mx-auto w-5/6 max-w-xl">
        <Outlet />
      </main>
    </>
  );
}
