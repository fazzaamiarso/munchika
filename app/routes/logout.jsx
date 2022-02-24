import { redirect } from 'remix';
import { supabase } from '../../server/db.server';
import { destroyUserSession } from '../utils/session.server';

export const loader = async () => {
  return redirect('/');
};
export const action = async ({ request }) => {
  await supabase.auth.signOut();
  return await destroyUserSession(request);
};

export default function Logout() {
  return null;
}
