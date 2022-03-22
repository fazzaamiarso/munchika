import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  Link,
  useCatch,
  json,
  useLoaderData,
} from 'remix';
import styles from './tailwind.css';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';
import { commitSession, getUserSession } from './utils/session.server';
import { Toast, ToastWithSpinner } from './components/toast';

export function links() {
  return [{ rel: 'stylesheet', href: styles }];
}

export function meta() {
  return {
    title: 'Munchika',
    description:
      "See other's thought and find song that can help you or help others by sharing your thought",
  };
}

export const loader = async ({ request }) => {
  const userSession = await getUserSession(request);
  const loginMessage = userSession.get('login') ?? null;
  const deleteMessage = userSession.get('delete') ?? null;
  const unauthorizedMessage = userSession.get('unauthorized') ?? null;

  return json(
    { loginMessage, unauthorizedMessage, deleteMessage },
    { headers: { 'Set-Cookie': await commitSession(userSession) } },
  );
};

export default function App() {
  const location = useLocation();
  const { loginMessage, unauthorizedMessage, deleteMessage } = useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden">
        {location.pathname.includes('/login') ? null : (
          <Link
            className="fixed left-1/2 top-0 z-30  -translate-x-1/2 -translate-y-full bg-white px-3 py-1 underline  transition-transform focus:translate-y-0"
            to="#main"
          >
            Skip to content
          </Link>
        )}
        {location.pathname.includes('/login') ? null : <Navbar />}
        <Outlet />
        {location.pathname.includes('/login') ? null : <Footer />}
        <Toast message={loginMessage} className=" top-16 right-8 border-green-400 " />
        <Toast
          message={unauthorizedMessage}
          className="top-8 left-1/2 -translate-x-1/2 border-red-400 "
        />
        <Toast
          message={deleteMessage}
          className="top-8 left-1/2 -translate-x-1/2 border-red-400 "
        />
        <ToastWithSpinner message={'Deleting post'} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const ErrorBoundary = ({ error }) => {
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="flex h-screen w-screen flex-col items-center justify-center">
        <h1 className="text-5xl font-bold">Something Went wrong...</h1>
        <pre>{error.message}</pre>
        <Scripts />
      </body>
    </html>
  );
};

export const CatchBoundary = () => {
  const caught = useCatch();

  if (caught.status === 500)
    return (
      <div className="h=screen flex w-screen flex-col items-center justify-center">
        <h1 className="text-3xl font-semibold">Ooopsie there something wrong</h1>
        <Link to="/" className="text-blue-500 hover:underline">
          Go back home
        </Link>
      </div>
    );

  return (
    <div className="h=screen flex w-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold">
        Ooopsie we couldn&apos;t find what you are lookin for
      </h1>
      <Link to="/" className="text-blue-500 hover:underline">
        Go back home
      </Link>
    </div>
  );
};
