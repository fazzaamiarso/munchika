import { useRef } from 'react';
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams, useTransition } from "@remix-run/react";
import { createUserSession, getUserId } from '~/utils/session.server';
import { supabase } from '~/utils/supabase.server';
import { validateEmail, validatePassword, haveErrors, badRequest } from '~/utils/formUtils';
import { PasswordField } from '~/components/form/password-field';
import { useFocusOnError } from '~/hooks/useFocusOnError';
import { ErrorMessage } from '~/components/form/error-message';
import { InputField } from '~/components/form/input-field';
import { useFocusToHeading } from '~/hooks/useFocusToHeading';
export const loader = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) throw redirect('/');
  return null;
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const redirectTo = formData.get('redirectTo') ?? '/';

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
  return await createUserSession(user.id, redirectTo, session.access_token);
};

export default function Login() {
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
        <h1 id="form-name" className="text-2xl font-bold" tabIndex="-1">
          Login
        </h1>
        <p>
          Don&apos;t have an account?{' '}
          <Link
            className="text-blue-600 underline hover:no-underline"
            to={`/register?redirectTo=${searchParams.get('redirectTo') ?? ''}`}
          >
            Register
          </Link>
        </p>
      </div>
      <Form
        aria-labelledby="form-name"
        method="post"
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
        <div className=" flex flex-col gap-2">
          <PasswordField fieldData={actionData} isBusy={isBusy} autoComplete="current-password" />
          <ErrorMessage id="password-error">
            {actionData?.fieldErrors?.password && !isBusy ? actionData.fieldErrors.password : ''}
          </ErrorMessage>
        </div>
        <button
          className="mt-4 rounded-sm bg-blue-600 px-4 py-1  font-semibold text-white hover:opacity-90 disabled:opacity-75"
          type="submit"
          disabled={isBusy}
        >
          {transition.state === 'submitting'
            ? 'Submitting'
            : transition.type === 'actionRedirect'
            ? 'Logging you in'
            : 'Log in'}
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
  );
}
