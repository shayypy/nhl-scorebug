import { createCookieSessionStorage } from '@remix-run/node';
import { verifyCode } from './redis.server';

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: '__scorebug_link_session',

      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 5184000,
      secrets: process.env.COOKIE_SECRET
        ? [process.env.COOKIE_SECRET]
        : undefined,
    },
  });

export { getSession, commitSession, destroySession };

export const verifySession = (session: any) => {
  return verifyCode(session.get('code'), session.get('token'));
};
