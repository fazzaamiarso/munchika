import { Form, Link, Outlet, useLocation, useTransition } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { ArrowCircleUpIcon, RefreshIcon } from '@heroicons/react/outline';
import throttle from 'lodash.throttle';

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
  const searchRef = useRef<HTMLInputElement>(null);
  const transition = useTransition();

  useEffect(() => {
    if (transition.type === 'loaderSubmissionRedirect' && searchRef.current)
      searchRef.current.value = '';
  }, [transition]);
  useEffect(() => {
    searchRef.current?.focus();
  }, [location]);

  return (
    <main id="main" className="mx-auto w-10/12 max-w-lg">
      <h1 className="py-4 text-lg font-bold">Browse</h1>
      <div className="mx-auto flex  flex-col items-center gap-4 pb-8">
        <Form
          id="search"
          method="get"
          action={location.pathname}
          className="flex w-full items-center gap-4"
          role="search"
          aria-label="search"
        >
          <input
            type="search"
            name="term"
            autoComplete="off"
            className="w-full rounded-md ring-gray-400 placeholder:text-gray-400"
            ref={searchRef}
            required
            placeholder="Try searching something"
          />
          <button
            name="action"
            value="search"
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:opacity-90 disabled:opacity-75"
            disabled={transition.state === 'submitting' || transition.state === 'loading'}
          >
            {transition.state === 'submitting' ? 'Searching...' : 'Search'}
          </button>
          <button
            type="submit"
            name="action"
            value="clear"
            className=" flex items-center gap-1 rounded-md bg-white px-4 py-2 text-blue-600 ring-1 ring-blue-500 "
            formNoValidate
            aria-labelledby="clear-msg"
          >
            <span id="clear-msg" className="sr-only">
              {transition.submission?.formData.get('action') === 'clear'
                ? 'Clearing search results'
                : 'clear Search results'}
            </span>
            <span className="hidden sm:inline ">Clear</span>{' '}
            <RefreshIcon
              className={`h-5 text-blue-500 ${
                transition.submission?.formData.get('action') === 'clear' ? 'animate-spin' : ''
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
                        ? 'bg-white px-3  py-1 text-blue-600 shadow-md  ring-1 ring-gray-300'
                        : ' text-gray-500 '
                    }`}
                    aria-label={`Browse ${item.name} page`}
                  >
                    {item.name}
                  </Link>
                  <span className="sr-only" aria-live="polite">
                    You are at page {item.name}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <Outlet />
      <GoToTopButton />
    </main>
  );
}

const GoToTopButton = () => {
  const [showButton, setShowButton] = useState(false);

  const handleToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    setShowButton(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 1400) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
    const throttledScroll = throttle(handleScroll, 1000);

    window.addEventListener('scroll', throttledScroll);

    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  if (!showButton) return null;
  return (
    <>
      <button
        type="button"
        onClick={handleToTop}
        className="fixed bottom-4 right-4 z-30 rounded-full bg-white shadow-md"
        aria-label="Go to top of page"
      >
        <ArrowCircleUpIcon className="h-12" />
      </button>
    </>
  );
};
