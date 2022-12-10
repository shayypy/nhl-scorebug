import { createCookieSessionStorage } from '@remix-run/node';
import { verifyCode } from './redis.server';

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: '__scorebug_link_session',

      expires: new Date(2038, 1, 1),
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    },
  });

export { getSession, commitSession, destroySession };

export const verifySession = (session: any) => {
  return verifyCode(session.get('code'), session.get('token'));
};
