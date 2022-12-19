import React, { useState } from 'react';
import { ActionArgs, MetaFunction, redirect } from '@remix-run/node';
import {
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from '@remix-run/react';
import { randomString, redisCodeKey } from './link.setup';
import { commitSession, getSession } from '~/sessions';
import { getClient } from '~/redis.server';

export const loader = async () => {
  const client = await getClient();
  const code = await client.get(redisCodeKey);
  return { codeExists: !!code };
};

export const action = async ({ request }: ActionArgs) => {
  const client = await getClient();
  const code = await client.get(redisCodeKey);
  if (!code) {
    return {
      msg: 'No code is available. Make sure the setup page is shown on your scorebug.',
    };
  }

  const body = await request.formData();
  if (code === body.get('code')) {
    const token = randomString(32);
    const session = await getSession(request.headers.get('Cookie'));
    session.set('code', code);
    session.set('token', token);
    session.set('deviceName', process.env.DEVICE_NAME);
    await client.set(
      `nhl-scorebug-code-${code}`,
      JSON.stringify({ token, deviceName: process.env.DEVICE_NAME }),
      { EX: 5184000 } // 60 days
    );

    return redirect('/', {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } else {
    return {
      msg: 'Code provided does not match the one on screen.',
      usedCode: code,
    };
  }
};

export const meta: MetaFunction = () => ({
  title: 'Link Device | NHL Scorebug',
  viewport: 'width=device-width,initial-scale=1',
});

export default function LinkPage() {
  const { codeExists } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [hideError, setHideError] = useState(false);

  const submit = useSubmit();
  const transition = useTransition();

  return (
    <div className='flex h-full max-w-lg mx-auto'>
      <div className='m-auto'>
        <p className='font-bold text-xl'>Input the code shown on screen</p>
        <input
          className='uppercase tracking-widest text-2xl rounded-xl p-4 w-full text-center disabled:animate-pulse disabled:cursor-not-allowed'
          placeholder='1A2B'
          minLength={4}
          maxLength={4}
          disabled={!codeExists || transition.state !== 'idle'}
          autoCorrect='off'
          autoComplete='off'
          onChange={(e) => {
            const val = e.target.value.toUpperCase();
            if (actionData && 'usedCode' in actionData) {
              setHideError(val !== actionData.usedCode);
            }
            // All chars are accepted here instead of only the valid subset just to avoid a
            // confusing lack of feedback when a user inputs an invalid code
            if (/[A-Z0-9]{4}/.test(val)) {
              submit({ code: val }, { method: 'post' });
              setHideError(false);
            }
          }}
        />
        {(!codeExists || (actionData && 'msg' in actionData && !hideError)) && (
          <p className='font-normal'>
            {actionData && 'msg' in actionData
              ? actionData.msg
              : !codeExists &&
                'There is currently no code available to input. Click the "SET UP" button on your scorebug, then refresh this page.'}
          </p>
        )}
      </div>
    </div>
  );
}
