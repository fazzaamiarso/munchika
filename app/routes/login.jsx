import { useState, useRef } from 'react';
import { redirect, useSearchParams, useTransition, Form, useActionData } from 'remix';
import { createUserSession, getUserId } from '../utils/session.server';
import { validateUsername, supabase } from '../utils/supabase.server';
import { validateEmail, validatePassword, haveErrors, badRequest } from '../utils/formUtils';
import { PasswordField } from '../components/form/password-field';
import { useFocusOnError } from '../hooks/useFocusOnError';

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
  if (haveErrors(fieldErrors)) return badRequest({ fieldErrors, fields });

  if (authType === 'signup') {
    const { user, error, session } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      fieldErrors.email = error.message;
      return badRequest({ fields, fieldErrors });
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
      return badRequest({ fields, fieldErrors });
    }
    return await createUserSession(user.id, redirectTo, session.access_token);
  }
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const [formType, setFormType] = useState('login');
  const transition = useTransition();
  const actionData = useActionData();
  const isBusy = transition.state === 'submitting' || transition.state === 'loading';
  const formRef = useRef();

  useFocusOnError(formRef, actionData?.fieldErrors);

  return (
    <div className="flex h-screen w-screen items-center justify-center ">
      <main className="flex w-11/12 max-w-lg flex-col items-center gap-6 ">
        <h1 id="form-name" className="text-2xl font-bold">
          {formType === 'login' ? 'Login to your account' : 'Create an account'}
        </h1>
        <Form
          aria-labelledby="form-name"
          method="post"
          className="flex w-10/12 flex-col gap-6 rounded-md bg-white py-4 px-6 shadow-md ring-2 ring-gray-500/10"
          replace
          ref={formRef}
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
            <legend className="sr-only">Authentication Type</legend>
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
                autoComplete="off"
                defaultValue={actionData?.fields ? actionData.fields.username : ''}
                className={`w-full rounded-md ${
                  actionData?.fieldErrors?.username && !isBusy ? 'border-red-400' : ''
                }`}
                aria-describedby="username-error"
                aria-invalid={actionData?.fieldErrors?.username ? 'true' : 'false'}
              />
              <span className=" text-sm text-red-500 " id="username-error">
                {actionData?.fieldErrors?.username && !isBusy
                  ? actionData.fieldErrors.username
                  : ''}
              </span>
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
              autoComplete="off"
              defaultValue={actionData?.fields ? actionData.fields.email : ''}
              className={` w-full rounded-md ${
                actionData?.fieldErrors?.email && !isBusy ? 'border-red-400' : ''
              }`}
              aria-describedby="email-error"
              aria-invalid={actionData?.fieldErrors?.email ? 'true' : 'false'}
            />
            <span className=" text-sm text-red-500 " id="email-error">
              {actionData?.fieldErrors?.email && !isBusy ? actionData.fieldErrors.email : ''}
            </span>
          </div>
          <div className=" flex flex-col">
            <PasswordField fieldData={actionData} isBusy={isBusy} />
            <span className=" text-sm text-red-500" id="password-error">
              {actionData?.fieldErrors?.password && !isBusy ? actionData.fieldErrors.password : ''}
            </span>
          </div>
          <button
            className="mt-4 rounded-sm bg-blue-600 px-4 py-1  font-semibold text-white hover:opacity-90 disabled:opacity-75"
            type="submit"
            disabled={transition.state === 'submitting' || transition.state === 'loading'}
          >
            {transition.state === 'submitting'
              ? 'Submitting'
              : transition.type === 'actionRedirect'
              ? 'Logging you in'
              : 'Submit'}
          </button>
          <span aria-live="polite" className="sr-only">
            {transition.state === 'submitting'
              ? 'Submitting'
              : transition.type === 'actionRedirect'
              ? 'Logging you in'
              : ''}
          </span>
        </Form>
      </main>
    </div>
  );
}
