import { useState } from 'react';
import {
  json,
  redirect,
  useFetcher,
  useSearchParams,
  useTransition,
} from 'remix';
import { supabase } from '../../server/db.server';
import { createUserSession, getUserId } from '../utils/session.server';
import { validateUsername } from '../utils/supabase.server';
import {
  validateEmail,
  validatePassword,
  haveErrors,
} from '../utils/formUtils';

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
  const username = formData.get('username') ?? null;
  const redirectTo = formData.get('redirectTo') ?? '/';

  const fields = { email, password, username };
  const fieldErrors = {
    username: await validateUsername(username),
    password: validatePassword(password),
    email: validateEmail(email),
  };
  if (haveErrors(fieldErrors))
    return json({ fieldErrors, fields }, { status: 400 });

  if (authType === 'signup') {
    const { user, error, session } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      fieldErrors.email = error.message;
      return json({ fields, fieldErrors }, { status: 400 });
    }

    await supabase.from('user').insert([
      {
        username,
        id: user.id,
        avatar_url: `https://avatars.dicebear.com/api/micah/${username}.svg`,
      },
    ]); //  user profile

    return await createUserSession(user.id, redirectTo, session.access_token);
  }
  if (authType === 'login') {
    const { user, error, session } = await supabase.auth.signIn({
      email,
      password,
    });
    if (error) {
      fieldErrors.email = error.message;
      fieldErrors.password = error.message;
      return json({ fields, fieldErrors }, { status: 400 });
    }
    return await createUserSession(user.id, redirectTo, session.access_token);
  }
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const [formType, setFormType] = useState('login');
  const fetcher = useFetcher();
  const transition = useTransition();

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <div className="flex w-11/12 max-w-lg flex-col items-center gap-6">
        <h1 className="text-2xl font-bold">
          {formType === 'login' ? 'Login' : 'Signup'}
        </h1>
        <fetcher.Form
          method="post"
          className="flex w-10/12 flex-col gap-6 rounded-md py-4 px-6 shadow-md ring-1 ring-gray-300"
        >
          <input
            type="text"
            hidden
            name="redirectTo"
            defaultValue={searchParams.get('redirectTo') ?? undefined}
          />
          <fieldset
            onChange={e => setFormType(e.target.value)}
            className="mb-4 flex items-center gap-4 self-center"
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
                Username
              </label>
              <input
                name="username"
                id="username"
                type="text"
                placeholder="cool_kidz"
                required
                defaultValue={
                  fetcher.data?.fields ? fetcher.data.fields.username : ''
                }
                className={`w-full rounded-md ${
                  fetcher.data?.fieldErrors?.username ? 'border-red-400' : ''
                }`}
              />
              {fetcher.data?.fieldErrors ? (
                <span className="text-sm text-red-500">
                  {fetcher.data.fieldErrors.username}
                </span>
              ) : null}
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
              placeholder="email@example.com"
              required
              defaultValue={
                fetcher.data?.fields ? fetcher.data.fields.email : ''
              }
              className={`w-full rounded-md ${
                fetcher.data?.fieldErrors?.email ? 'border-red-400' : ''
              }`}
            />
            {fetcher.data?.fieldErrors ? (
              <span className="text-sm text-red-500">
                {fetcher.data.fieldErrors.email}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col">
            <label htmlFor="password" className="font-semibold">
              Password
            </label>
            <input
              name="password"
              id="password"
              type="password"
              placeholder="password"
              required
              defaultValue={
                fetcher.data?.fields ? fetcher.data.fields.password : ''
              }
              className={`w-full rounded-md ${
                fetcher.data?.fieldErrors?.password ? 'border-red-400' : ''
              }`}
            />
            {fetcher.data?.fieldErrors ? (
              <span className="text-sm text-red-500">
                {fetcher.data.fieldErrors.password}
              </span>
            ) : null}
          </div>
          <button
            className="mt-4 rounded-sm bg-blue-500 px-4 py-1  font-semibold text-white hover:opacity-90 disabled:opacity-75"
            type="submit"
            disabled={
              fetcher.state === 'submitting' || transition.state === 'loading'
            }
          >
            {fetcher.state === 'submitting'
              ? 'Submitting'
              : transition.state === 'loading'
              ? 'Logging you in'
              : 'Submit'}
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}
