import { redirect } from 'remix';
import { supabase } from '../../server/db.server';
import { destroyUserSession, getAccessToken } from '../utils/session.server';

export const loader = async () => {
  throw redirect('/');
};

export const action = async ({ request }) => {
  const token = await getAccessToken(request);
  await supabase.auth.api.signOut(token);
  return await destroyUserSession(request);
};

export default function Bug() {
  return null;
}
