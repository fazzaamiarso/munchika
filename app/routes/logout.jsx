import { redirect } from 'remix';
import { supabase } from '../utils/supabase.server';
import { destroyUserSession, getAccessToken } from '../utils/session.server';

export const loader = async () => {
  return redirect('/');
};

export const action = async ({ request }) => {
  const token = await getAccessToken(request);
  await supabase.auth.api.signOut(token);
  return await destroyUserSession(request);
};
