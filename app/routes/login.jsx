import { useState } from 'react';
import { redirect, useFetcher, useSearchParams } from 'remix';
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
  console.log(redirectTo);

  if (authType === 'signup') {
    const { user, error, session } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) return { error };
    await supabase.from('user').insert([
      {
        username,
        id: user.id,
        avatar_url: `https://avatars.dicebear.com/api/micah/${username}.svg`,
      },
    ]); // insert user profile
    return await createUserSession(user.id, redirectTo, session.access_token);
  }
  if (authType === 'login') {
    const { user, error, session } = await supabase.auth.signIn({
      email,
      password,
    });
    if (error) return { error };

    return await createUserSession(user.id, redirectTo, session.access_token);
  }
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const [formType, setFormType] = useState('login');
  const fetcher = useFetcher();

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex w-11/12 max-w-lg flex-col items-center gap-6">
        <h1 className="text-2xl font-bold">
          {formType === 'login' ? 'Login' : 'Signup'}
        </h1>
        <fetcher.Form
          method="post"
          className="flex w-10/12 flex-col gap-6 rounded-md py-4 px-6 ring-1 ring-gray-200"
        >
          <input
            type="text"
            hidden
            name="redirectTo"
            defaultValue={searchParams.get('redirectTo') ?? null}
          />
          <fieldset
            onChange={e => setFormType(e.target.value)}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 font-semibold">
              <input
                id="login"
                name="authType"
                value="login"
                type="radio"
                defaultChecked={formType === 'login'}
              />
              <label htmlFor="login">Login</label>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <input id="signup" name="authType" value="signup" type="radio" />
              <label htmlFor="signup">Signup</label>
            </div>
          </fieldset>
          {formType === 'signup' ? (
            <div className="flex flex-col">
              <label htmlFor="username" className=" font-semibold ">
                username
              </label>
              <input
                name="username"
                id="username"
                type="text"
                className="w-full rounded-md ring-gray-300 "
              />
            </div>
          ) : null}
          <div className="flex flex-col">
            <label htmlFor="email" className=" font-semibold ">
              Email
            </label>
            <input
              name="email"
              id="email"
              type="email"
              className="w-full rounded-md ring-gray-300 "
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password" className="font-semibold">
              Password
            </label>
            <input
              name="password"
              id="password"
              type="password"
              className="w-full rounded-md ring-gray-300 "
            />
          </div>
          <button
            className="rounded-md bg-blue-500 px-4 py-1 font-semibold  text-white"
            type="submit"
          >
            Submit
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}
