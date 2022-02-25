import { Outlet, NavLink, Form, useLocation } from 'remix';
import { useRef } from 'react';
export default function SearchLayout() {
  const location = useLocation();
  const searchRef = useRef();
  return (
    <>
      <div className="mx-auto flex flex-col items-center gap-4 py-8">
        <Form
          method="get"
          action={location.pathname}
          className="flex items-center gap-4"
        >
          <input
            type="search"
            name="term"
            autoComplete="off"
            className="rounded-md ring-gray-400 placeholder:text-gray-400"
            ref={searchRef}
          />
          <button
            type="submit"
            className="rounded-md bg-blue-500 px-4 py-2 text-white"
          >
            Search
          </button>
        </Form>
        <div className="flex gap-4">
          <NavLink to=".">
            {({ isActive }) => (
              <span
                className={`${
                  isActive ? 'text-red-500' : ''
                } font-semibold text-blue-500`}
              >
                Post
              </span>
            )}
          </NavLink>
          <NavLink to="track">
            {({ isActive }) => (
              <span
                className={`${
                  isActive ? 'text-red-500' : ''
                } font-semibold text-blue-500`}
              >
                Song
              </span>
            )}
          </NavLink>
        </div>
      </div>
      <main className="mx-auto w-5/6">
        <Outlet />
      </main>
    </>
  );
}
