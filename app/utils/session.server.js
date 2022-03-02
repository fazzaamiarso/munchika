import { createCookieSessionStorage, redirect } from 'remix';

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set');
}

const storage = createCookieSessionStorage({
  cookie: {
    name: 'auth_session',
    secrets: [sessionSecret],
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
  },
});
const getUserSession = request => {
  return storage.getSession(request.headers.get('Cookie'), {});
};

export const getUserId = async request => {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId) return null;
  return userId;
};
export const requireUserId = async (
  request,
  redirectTo = new URL(request.url).pathname,
) => {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
};

export const createUserSession = async (userId, redirectTo = '/', jwtToken) => {
  const session = await storage.getSession();
  session.set('userId', userId);
  session.set('access_token', jwtToken);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  });
};

export const destroyUserSession = async request => {
  const session = await getUserSession(request);
  const redirectTo = new URL(request.url);
  return redirect(redirectTo.pathname, {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  });
};

export const getAccessToken = async request => {
  const session = await getUserSession(request);
  return session.get('access_token');
};
