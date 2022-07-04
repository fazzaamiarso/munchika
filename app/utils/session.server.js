import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set');
}

export const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: 'auth_session',
    secrets: [sessionSecret],
    maxAge: 60 * 60,
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
  },
});
export const getUserSession = request => {
  return getSession(request.headers.get('Cookie'), {});
};

export const getUserId = async request => {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId) return null;
  return userId;
};
export const requireUserId = async (request, redirectTo = new URL(request.url).pathname) => {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    session.flash('unauthorized', 'Please Log in to continue!');
    throw redirect(`/login?${searchParams}`, {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
  return userId;
};

export const createUserSession = async (userId, redirectTo = '/', jwtToken) => {
  const session = await getSession();
  session.set('userId', userId);
  session.set('access_token', jwtToken);
  session.flash('login', 'Welcome!');

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export const destroyUserSession = async request => {
  const session = await getUserSession(request);
  const redirectTo = new URL(request.url);
  return redirect(redirectTo.pathname, {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
};

export const getAccessToken = async request => {
  const session = await getUserSession(request);
  return session.get('access_token');
};
