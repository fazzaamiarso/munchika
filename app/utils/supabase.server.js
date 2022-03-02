import { supabase } from '../../server/db.server';

export const toTextSearchFormat = query => {
  const formatted = query.trim().split(' ');
  return formatted.join('|');
};

export const validateUsername = async username => {
  const uppercaseRegex = /[A-Z]/;
  const whiteSpaceRegex = /\s/;
  const allNumberRegex = /^\d+$/;
  if (!username) return null;
  if (username.length < 4) return 'Username must be atleast 4 characters long';
  if (allNumberRegex.test(username)) return 'Username must be alphanumerical';

  if (uppercaseRegex.test(username))
    return 'Username cannot contain uppercase letter';

  if (whiteSpaceRegex.test(username))
    return 'Username cannot have special characters except underscore ( _ )';

  const { data: userFound } = await supabase
    .from('user')
    .select('*')
    .single()
    .limit()
    .eq('username', username);
  const isUsernameExist = userFound !== null;
  if (isUsernameExist) return 'Username already exist';
};
