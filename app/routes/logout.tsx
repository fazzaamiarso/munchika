import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node';
import { supabase } from '../utils/supabase.server';
import { destroyUserSession, getAccessToken } from '../utils/session.server';

export const loader: LoaderFunction = async () => {
  return redirect('/');
};

export const action: ActionFunction = async ({ request }) => {
  const token = await getAccessToken(request);
  await supabase.auth.api.signOut(token);
  return await destroyUserSession(request);
};
