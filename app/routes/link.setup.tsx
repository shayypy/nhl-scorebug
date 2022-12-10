import React, { useEffect } from 'react';
import { LoaderArgs, redirect } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import client from '../redis.server';

export const randomString = (length: number) => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // No 1 0 I L O to avoid confusion
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const redisCodeKey = 'nhl-scorebug-link-code';

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const currentCode = url.searchParams.get('currentCode');
  if (currentCode) {
    const codeData = await client.get(`nhl-scorebug-code-${currentCode}`);
    if (codeData) {
      // The code has been authorized
      await client.del(redisCodeKey);
      return redirect('/');
    }
  }

  let code = await client.get(redisCodeKey);
  const ttl = await client.ttl(redisCodeKey);
  if (!code || ttl < 45) {
    // 45 seconds is probably too little time to pull out your
    // phone and type in the address in order to enter the code.
    // This is not the same as the initial TTL being 45 seconds shorter
    // because you would still be able to catch the tail 45 seconds of
    // it and run into the same problem.

    code = randomString(4);
    await client.set(redisCodeKey, code, { EX: 600 });
  }

  return { root: url.origin, code };
};

// This page is only supposed to be visited by the host machine's browser
export default function LinkSetup() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();

  // Should never happen, but this is to satisfy type checking
  if (!('code' in data)) {
    return <></>;
  }

  const { root, code } = data;

  // Refresh every 30 seconds to ensure the displayed code is probably valid
  useEffect(() => {
    const id = setInterval(() => {
      submit({ currentCode: code }, { method: 'get', replace: true });
    }, 30000);

    return () => clearInterval(id);
  }, []);

  return (
    <div className='flex h-full'>
      <div className='m-auto text-center'>
        <p className='text-3xl'>Go to </p>
        <p className='text-6xl text-teal-900'>
          {root.replace(/^https?:\/\//, '')}/link
        </p>{' '}
        <p className='text-3xl'>and enter the below code:</p>
        <p className='text-[10rem] leading-none mt-6 rounded-xl bg-teal-600/20 tracking-widest'>
          {code}
        </p>
        <p className='text-xl mt-2 opacity-30'>and be patient :)</p>
      </div>
    </div>
  );
}
