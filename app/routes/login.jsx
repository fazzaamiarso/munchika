import { useActionData } from 'remix';
import { supabase } from '../../server/db.server';
import { createUserSession, destroyUserSession } from '../utils/session.server';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const authType = formData.get('authType');

  if (authType === 'signup') {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error };
    return createUserSession(user.id);
  }
  if (authType === 'login') {
    const { user, error } = await supabase.auth.signIn({ email, password });
    if (error) return { error };
    return createUserSession(user.id);
  }
  if (authType === 'logout') {
    await supabase.auth.signOut();
    return destroyUserSession(request);
  }
  return null;
};

export default function Login() {
  const data = useActionData();

  return (
    <div className="flex h-screen w-screen max-w-lg flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Login</h1>
      <form method="post" className="space-y-12">
        <fieldset>
          <div>
            <input
              id="login"
              name="authType"
              value="login"
              type="radio"
              defaultChecked
            />
            <label htmlFor="login">Login</label>
          </div>
          <div>
            <input id="signup" name="authType" value="signup" type="radio" />
            <label htmlFor="signup">Signup</label>
          </div>
        </fieldset>
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
        <button
          type="submit"
          name="authType"
          value="logout"
          className="rounded-sm bg-red-500 px-4 py-1 font-semibold"
        >
          Logout
        </button>
      </form>
      <div className="space-x-4">
        <p>Email : {data?.email ? data.email : null}</p>
        <p>UUID: {data?.id ? data.id : null}</p>
        <p>{data?.error ? JSON.stringify(data.error.message) : null}</p>
      </div>
    </div>
  );
}
