import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  Link,
} from 'remix';
import styles from './tailwind.css';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';

export function links() {
  return [{ rel: 'stylesheet', href: styles }];
}

export function meta() {
  return { title: 'New Remix App' };
}

export default function App() {
  const location = useLocation();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden">
        {location.pathname.includes('/login') ? null : <Navbar />}
        <Outlet />
        {location.pathname.includes('/login') ? null : <Footer />}

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
