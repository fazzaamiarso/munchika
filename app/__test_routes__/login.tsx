import { ActionFunction } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { validatePassword, validateEmail, haveErrors, badRequest } from '~/utils/formUtils';
import { createUserSession } from '~/utils/session.server';
import { supabase } from '~/utils/supabase.server';

export const action: ActionFunction = async ({ request }) => {
  const data = await request.json();
  const email = data.email;
  const password = data.password;

  const fields = { email, password };
  const fieldErrors = {
    password: validatePassword(password),
    email: validateEmail(email),
  };
  if (haveErrors(fieldErrors)) return badRequest({ fieldErrors, fields });

  const { user, error, session } = await supabase.auth.signIn({
    email,
    password,
  });

  if (error) {
    fieldErrors.email = error.message;
    fieldErrors.password = error.message;
    return badRequest({ fields, fieldErrors });
  }

  invariant(session?.access_token, 'Logged in user should have session token');
  invariant(user?.id, 'Logged in user should have an Id');

  return await createUserSession(user.id, '/', session.access_token);
};
