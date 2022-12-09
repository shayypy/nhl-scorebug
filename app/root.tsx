import React from 'react';
import styles from './styles/app.css';
import type { MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { QueryClient } from 'react-query';
import { QueryClientProvider } from 'react-query';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'NHL Scorebug',
});

const queryClient = new QueryClient();

export const BASE = 'https://statsapi.web.nhl.com/api/v1';

export default function App() {
  return (
    <html lang='en'>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <div className='bg-black w-screen h-screen overflow-auto'>
            <div className='bg-teal-100 w-full h-full rounded-3xl pt-1 pb-2 px-6 font-black overflow-auto'>
              <Outlet />
            </div>
          </div>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function links() {
  return [{ rel: 'stylesheet', href: styles }];
}
