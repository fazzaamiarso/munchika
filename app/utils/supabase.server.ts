import { createClient } from '@supabase/supabase-js';
import { env } from '~/env';
import { User } from '~/types/database';

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_KEY;
if (!supabaseUrl) throw Error('SUPABASE_URL env variable is not set');
if (!supabaseKey) throw Error('SUPABASE_KEY env variable is not set');

export const supabase = createClient(supabaseUrl, supabaseKey);

export const toTextSearchFormat = (query: string) => {
  const formatted = query.trim().split(' ');
  return formatted.join('|');
};

const findUsername = async (username: string) => {
  return await supabase.from<User>('user').select('*').limit(1).eq('username', username).single();
};
export const validateUsername = async (username: string) => {
  const uppercaseRegex = /[A-Z]/;
  const whiteSpaceRegex = /\s/;
  const allNumberRegex = /^\d+$/;
  if (username.length < 4) return 'Username must be atleast 4 characters long';
  if (allNumberRegex.test(username)) return 'Username must be alphanumerical';

  if (uppercaseRegex.test(username)) return 'Username cannot contain uppercase letter';

  if (whiteSpaceRegex.test(username))
    return 'Username cannot have special characters except underscore (_)';

  const { data: userFound } = await findUsername(username);

  const isUsernameExist = userFound !== null;
  if (isUsernameExist) return 'Username already exist';
};

// export const checkReaction = (posts, currentUserId = null) => {
//   const counted = posts.map(async post => {
//     const { data, count } = await supabase
//       .from('post_reaction')
//       .select('*', { count: 'exact' })
//       .match({ post_id: post.id });

//     const haveLiked = data.some(reaction => reaction.sender_id === currentUserId);

//     return { ...post, reactions: count, haveLiked };
//   });
//   return Promise.all(counted);
// };
