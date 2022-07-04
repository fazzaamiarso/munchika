import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useFetcher, useLoaderData, useNavigate, useTransition } from "@remix-run/react";
import { getUserId, requireUserId } from '~/utils/session.server';
import { supabase, validateUsername } from '~/utils/supabase.server';
import { badRequest, haveErrors, generateRandomString } from '~/utils/formUtils';
import { useFocusToHeading } from '~/hooks/useFocusToHeading';
import { ErrorMessage } from '~/components/form/error-message';
import { InputField } from '~/components/form/input-field';
import { useFocusOnError } from '~/hooks/useFocusOnError';
import { useRef } from 'react';
export const loader = async ({ request }) => {
  const userId = await requireUserId(request);
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'randomize') {
    const newAvatar = `https://avatars.dicebear.com/api/micah/${generateRandomString()}.svg`;
    return json({ avatar_url: newAvatar });
  }

  const { data: userData } = await supabase
    .from('user')
    .select('*')
    .match({ id: userId })
    .maybeSingle();

  return json(userData);
};

export const action = async ({ request }) => {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const newAvatar = formData.get('avatar');
  const username = formData.get('username');
  const oldUsername = formData.get('old_username');
  const isUsernameChanged = username !== oldUsername;

  const fields = { username };
  const fieldErrors = {
    username: await validateUsername(username),
  };
  if (haveErrors(fieldErrors) && isUsernameChanged) return badRequest({ fieldErrors, fields });

  await supabase.from('user').update({ avatar_url: newAvatar, username }).match({ id: userId });

  return redirect('/user/posts');
};

export default function EditProfile() {
  const userData = useLoaderData();
  const actionData = useActionData();
  const fetcher = useFetcher();
  const transition = useTransition();
  const navigate = useNavigate();
  const isRandomizing = fetcher.state === 'loading' || fetcher.state === 'submitting';
  const formRef = useRef();

  useFocusOnError(formRef, actionData?.fieldErrors);
  useFocusToHeading();
  return (
    <main className="mt-8 h-screen">
      <section className="mx-auto flex w-10/12 max-w-sm flex-col items-center gap-6">
        <h1 className="mb-8 text-xl font-semibold" tabIndex="-1">
          Edit Profile
        </h1>
        <div className="flex flex-col items-center gap-4">
          <img
            className="aspect-square h-20 rounded-full ring-1 ring-black"
            src={fetcher.data?.avatar_url ?? userData.avatar_url}
            alt={userData.username}
          />

          <fetcher.Form method="get">
            <button
              type="submit"
              name="action"
              value="randomize"
              disabled={isRandomizing}
              className="rounded-md px-3 py-1 text-sm  ring-1 ring-gray-500 hover:opacity-80 disabled:opacity-50"
            >
              {isRandomizing ? 'Randomizing' : 'Randomize avatar'}
            </button>
            <span className="sr-only" aria-live="polite">
              {isRandomizing ? 'Randomizing' : 'Randomize avatar'}
            </span>
          </fetcher.Form>
        </div>
        <Form method="post" id="edit" className="w-full" ref={formRef}>
          <input
            type="text"
            hidden
            name="avatar"
            className="w-full py-8"
            key={fetcher.data?.avatar_url ?? userData.avatar_url}
            defaultValue={fetcher.data?.avatar_url ?? userData.avatar_url}
            aria-label="Edit profile"
          />
          <input type="text" hidden name="old_username" defaultValue={userData.username} />
          <div className="flex w-full flex-col items-start gap-2">
            <InputField
              name="username"
              label="Username"
              placeholder="e.g. cool_kidz"
              fieldData={actionData?.fields?.username ?? userData.username}
              fieldError={actionData?.fieldErrors?.username}
              hint="Must contain 4+ characters and only lowercase letter"
            />
            <ErrorMessage id="username-error">
              {actionData?.fieldErrors?.username ? actionData.fieldErrors.username : ''}
            </ErrorMessage>
          </div>
        </Form>
        <div className="flex gap-4 self-end">
          <button
            type="button"
            className=""
            onClick={() => navigate(-1)}
            disabled={transition.state === 'loading'}
          >
            Cancel
          </button>

          <button
            form="edit"
            type="submit"
            className=" rounded-sm bg-blue-600 px-4 py-1  font-semibold text-white hover:opacity-90 disabled:opacity-75"
          >
            {transition.type === 'actionSubmission' || transition.type === 'actionRedirect'
              ? 'Saving..'
              : 'Save'}
          </button>
        </div>
      </section>
    </main>
  );
}
