import { useRef } from 'react';
import { useSearchParams, useTransition, Form, useActionData, Link } from 'remix';
import { PasswordField } from '~/components/form/password-field';
import { useFocusOnError } from '~/hooks/useFocusOnError';
import { createUserSession } from '~/utils/session.server';
import { validateUsername, supabase } from '~/utils/supabase.server';
import { validateEmail, validatePassword, haveErrors, badRequest } from '~/utils/formUtils';
import { ErrorMessage } from '~/components/form/error-message';
import { InputField } from '~/components/form/input-field';
import { useFocusToHeading } from '~/hooks/useFocusToHeading';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const username = formData.get('username') ?? null;
  const redirectTo = formData.get('redirectTo') ?? '/';

  const fields = { email, password, username };
  const fieldErrors = {
    username: await validateUsername(username),
    password: validatePassword(password),
    email: validateEmail(email),
  };
  if (haveErrors(fieldErrors)) return badRequest({ fieldErrors, fields });

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
};

export default function Register() {
  const [searchParams] = useSearchParams();
  const transition = useTransition();
  const actionData = useActionData();
  const isBusy = transition.state === 'submitting' || transition.state === 'loading';
  const formRef = useRef();

  useFocusOnError(formRef, actionData?.fieldErrors);
  useFocusToHeading();
  return (
    <main id="main" className="mx-auto flex w-11/12 max-w-lg flex-col items-center gap-6 py-12 ">
      <div className="self-start">
        <h1 id="form-name" tabIndex="-1" className="text-2xl font-bold">
          Register
        </h1>
        <p>
          Already have an account?{' '}
          <Link
            className="text-blue-600 underline hover:no-underline"
            to={`/login?redirectTo=${searchParams.get('redirectTo') ?? ''}`}
          >
            Login
          </Link>
        </p>
      </div>
      <Form
        method="post"
        aria-labelledby="form-name"
        className="flex w-full flex-col gap-4 rounded-md bg-white py-4 px-6 shadow-md ring-2 ring-gray-500/10"
        replace
        ref={formRef}
      >
        <input
          type="text"
          hidden
          name="redirectTo"
          defaultValue={searchParams.get('redirectTo') ?? undefined}
        />
        <div className="flex flex-col gap-2">
          <InputField
            name="username"
            label="Username"
            placeholder="e.g. cool_kidz"
            fieldData={actionData?.fields?.username}
            fieldError={actionData?.fieldErrors?.username}
            hint="Must contain 4+ characters and only lowercase letter"
          />
          <ErrorMessage id="username-error">
            {actionData?.fieldErrors?.username && !isBusy ? actionData.fieldErrors.username : ''}
          </ErrorMessage>
        </div>
        <div className="flex flex-col gap-2">
          <InputField
            name="email"
            label="Email"
            type="email"
            fieldData={actionData?.fields?.email}
            fieldError={actionData?.fieldErrors?.email}
          />
          <ErrorMessage id="email-error">
            {actionData?.fieldErrors?.email && !isBusy ? actionData.fieldErrors.email : ''}
          </ErrorMessage>
        </div>
        <div className="flex flex-col gap-2">
          <PasswordField fieldData={actionData} isBusy={isBusy} autoComplete="new-password" />
          <ErrorMessage id="password-error">
            {actionData?.fieldErrors?.password && !isBusy ? actionData.fieldErrors.password : ''}
          </ErrorMessage>
        </div>
        <button
          className="mt-4 rounded-sm bg-blue-600 px-4 py-1  font-semibold text-white hover:opacity-90 disabled:opacity-75"
          type="submit"
          disabled={transition.state === 'submitting' || transition.state === 'loading'}
        >
          {transition.state === 'submitting'
            ? 'Registering'
            : transition.type === 'actionRedirect'
            ? 'Logging you in'
            : 'Register'}
        </button>
        <span aria-live="polite" className="sr-only">
          {transition.state === 'submitting'
            ? 'Registering'
            : transition.type === 'actionRedirect'
            ? 'Logging you in'
            : ''}
        </span>
      </Form>
    </main>
  );
}
