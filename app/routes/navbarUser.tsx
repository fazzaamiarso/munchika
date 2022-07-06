import { json, LoaderFunction } from '@remix-run/node';
import { User } from '~/types/database';
import { getUserId } from '../utils/session.server';
import { supabase } from '../utils/supabase.server';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) return null;

  const { data: userProfile } = await supabase
    .from<User>('user')
    .select('*')
    .eq('id', userId)
    .limit(1)
    .single();

  return json(userProfile);
};
