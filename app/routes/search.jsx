import { Outlet, NavLink, Form, useLocation } from 'remix';

export default function SearchLayout() {
  const location = useLocation();
  return (
    <>
      <h1 className="text-2xl">Search page</h1>
      <div className="mx-auto flex flex-col items-center gap-4">
        <Form
          method="get"
          action={location.pathname}
          className="flex items-center gap-4"
        >
          <input name="term" type="text" className="py-1 ring-1 ring-black" />
          <button type="submit" className="">
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
