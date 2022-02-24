import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from 'remix';
import styles from './tailwind.css';
import { Navbar } from './components/navbar';

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
      <body>
        {location.pathname.includes('/login') ? null : <Navbar />}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
