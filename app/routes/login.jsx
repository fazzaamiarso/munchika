import { useState } from 'react';
import { useSearchParams, redirect } from 'remix';
import { supabase } from '../../server/db.server';
import { createUserSession, getUserId } from '../utils/session.server';

export const loader = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) throw redirect('/');
  return null;
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const authType = formData.get('authType');
  const username = formData.get('username');
  const redirectTo = formData.get('redirectTo') ?? '/';

  if (authType === 'signup') {
    const { user, error, session } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) return { error };

    const redirectPath = redirectTo.include('/login') ? '/' : redirectTo;
    await supabase.from('user').insert([{ username, id: user.id }]); // insert user profile
    return await createUserSession(user.id, redirectPath, session.access_token);
  }
  if (authType === 'login') {
    const { user, error, session } = await supabase.auth.signIn({
      email,
      password,
    });
    if (error) return { error };

    return await createUserSession(user.id, '/', session.access_token);
  }
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const [formType, setFormType] = useState('login');

  return (
    <div className="flex h-screen w-screen max-w-lg flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Login</h1>
      <form method="post" className="space-y-12">
        <input
          type="text"
          name="redirectTo"
          value={searchParams.get('redirectTo') ?? undefined}
          hidden
        />
        <fieldset onChange={e => setFormType(e.target.value)}>
          <div>
            <input
              id="login"
              name="authType"
              value="login"
              type="radio"
              defaultChecked={formType === 'login'}
            />
            <label htmlFor="login">Login</label>
          </div>
          <div>
            <input id="signup" name="authType" value="signup" type="radio" />
            <label htmlFor="signup">Signup</label>
          </div>
        </fieldset>
        {formType === 'signup' ? (
          <div className="flex flex-col">
            <label htmlFor="username" className="font-semibold">
              username
            </label>
            <input name="username" id="username" type="text" />
          </div>
        ) : null}
        <div className="flex flex-col">
          <label htmlFor="email" className="font-semibold">
            Email
          </label>
          <input name="email" id="email" type="email" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="font-semibold">
            Password
          </label>
          <input name="password" id="password" type="password" />
        </div>
        <button
          className="bg-blue-500 px-4 py-1 font-semibold text-white"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
