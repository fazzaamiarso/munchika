import { supabase } from '../../server/db.server';

export const validateUsername = async username => {
  const { data: userFound } = await supabase
    .from('user')
    .select('*')
    .single()
    .limit()
    .eq('username', username);
  const isUsernameExist = userFound !== null;
  if (isUsernameExist) return 'Username already exist';
};
