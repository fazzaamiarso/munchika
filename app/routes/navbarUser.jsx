import { json } from "@remix-run/node";
import { getUserId } from '../utils/session.server';
import { supabase } from '../utils/supabase.server';

export const loader = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) return null;

  const { data: userProfile } = await supabase
    .from('user')
    .select('*')
    .eq('id', userId)
    .limit(1)
    .single();

  return json(userProfile);
};

export default function Bug() {
  return null;
}
