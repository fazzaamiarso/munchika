import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useLoaderData,
} from 'remix';
import styles from './tailwind.css';
import { Navbar } from './components/navbar';
import { getUserId } from './utils/session.server';
import { supabase } from '../server/db.server';

export function links() {
  return [{ rel: 'stylesheet', href: styles }];
}

export function meta() {
  return { title: 'New Remix App' };
}

export const loader = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) return null;

  const { data: userProfile } = await supabase
    .from('user')
    .select('*')
    .eq('id', userId)
    .limit(1)
    .single();

  return userProfile;
};

export default function App() {
  const location = useLocation();
  const userProfile = useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {location.pathname.includes('/login') ? null : (
          <Navbar user={userProfile} />
        )}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
