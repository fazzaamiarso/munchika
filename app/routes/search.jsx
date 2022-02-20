import { Outlet, Link, Form, useLocation } from 'remix';

export default function SearchLayout() {
  const location = useLocation();
  return (
    <>
      <h1 className="text-2xl">Search page</h1>

      <div className="">
        <Form method="get" action={location.pathname} className="flex">
          <input name="term" type="text" className="ring-1 ring-black" />
          <button type="submit" className="">
            Search
          </button>
        </Form>
        <div className="flex gap-4">
          <Link to=".">Post</Link>
          <Link to="track">Song</Link>
        </div>
      </div>
      <main className="">
        <Outlet />
      </main>
    </>
  );
}
