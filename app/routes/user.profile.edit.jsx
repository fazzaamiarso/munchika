import {
  json,
  redirect,
  useFetcher,
  useLoaderData,
  Form,
  useActionData,
  useTransition,
  useNavigate,
} from 'remix';
import { getUserId, requireUserId } from '~/utils/session.server';
import { supabase, validateUsername } from '~/utils/supabase.server';
import { badRequest, haveErrors } from '~/utils/formUtils';

const generateRandomString = () => {
  const ALPHABET = 'abcdefghijklmnovqrstuvwxyz';
  const NUMBER = '1234567890';
  let generated = [];
  for (let i = 0; i < 8; i++) {
    if (Math.random() > 0.5) {
      generated.push(ALPHABET[Math.floor(Math.random() * 26)]);
      continue;
    }
    generated.push(NUMBER[Math.floor(Math.random() * 10)]);
  }
  return generated.join('');
};

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
  if (haveErrors(fieldErrors) && isUsernameChanged)
    return badRequest({ fieldErrors, fields });

  await supabase
    .from('user')
    .update({ avatar_url: newAvatar, username })
    .match({ id: userId });

  return redirect('/user/posts');
};

export default function EditProfile() {
  const userData = useLoaderData();
  const actionData = useActionData();
  const fetcher = useFetcher();
  const transition = useTransition();
  const navigate = useNavigate();
  const isRandomizing =
    fetcher.state === 'loading' || fetcher.state === 'submitting';
  return (
    <main className="mt-8 h-screen">
      <section className="mx-auto flex w-10/12 max-w-md flex-col items-center">
        <h1 className="mb-8 text-xl font-semibold ">Edit Profile</h1>
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
          </fetcher.Form>
        </div>
        <section className="w-full py-8">
          <Form method="post" id="edit">
            <input
              type="text"
              hidden
              name="avatar"
              key={fetcher.data?.avatar_url ?? userData.avatar_url}
              defaultValue={fetcher.data?.avatar_url ?? userData.avatar_url}
            />
            <input
              type="text"
              hidden
              name="old_username"
              defaultValue={userData.username}
            />
            <div className="flex w-full flex-col items-start">
              <label htmlFor="username" className=" mb-2 text-sm font-semibold">
                Username
              </label>
              <input
                name="username"
                id="username"
                type="text"
                required
                autoComplete="off"
                defaultValue={userData.username}
                className={`w-full rounded-md ${
                  actionData?.fieldErrors?.username ? 'border-red-400' : ''
                }`}
              />
              {actionData?.fieldErrors?.username ? (
                <span className="text-sm text-red-500">
                  {actionData.fieldErrors.username}
                </span>
              ) : null}
            </div>
          </Form>
        </section>
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
            className=" rounded-sm bg-blue-500 px-4 py-1  font-semibold text-white hover:opacity-90 disabled:opacity-75"
          >
            {transition.type === 'actionSubmission' ||
            transition.type === 'actionRedirect'
              ? 'Saving..'
              : 'Save'}
          </button>
        </div>
      </section>
    </main>
  );
}
