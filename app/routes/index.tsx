import { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import {
  Link,
  useActionData,
  useLoaderData,
  useSubmit,
} from '@remix-run/react';
import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import { getClient } from '~/redis.server';
import { BASE } from '~/root';
import { getSession } from '~/sessions';
import { ErrorMessage } from '~/types/Error';
import { LiveFeed } from '~/types/LiveFeed';
import { Schedule } from '~/types/Schedule';
import { loader as displayLoader } from './api.display';

export const currentGameIdKey = 'nhl-scorebug-current-game-id';

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request.headers.get('Cookie'));

  const url = new URL(request.url);
  const gameId = url.searchParams.get('gameId') || null;

  const client = await getClient();
  const currentGameId = await client.get(currentGameIdKey);

  return {
    gameId,
    currentGameId,
    authenticated: session.has('code') as boolean,
    deviceName: session.get('deviceName') as string | null,
  };
};

export const action = async ({ request }: ActionArgs) => {
  // const session = await getSession(request.headers.get('Cookie'));
  // if (!(await verifySession(session))) {
  //   return redirect('/', {
  //     headers: { 'Set-Cookie': await destroySession(session) },
  //   });
  // }

  const client = await getClient();
  const body = await request.formData();
  const gameId = body.get('gameId');
  if (!gameId || gameId === 'null') {
    await client.del(currentGameIdKey);
    return { currentGameId: null };
  } else {
    await client.set(
      currentGameIdKey,
      gameId.toString(),
      { EX: 14400 } // 4 hours, room for a full regulation game + intermission + overtime + some more for good measure
    );
    return { currentGameId: gameId.toString() };
  }
};

export const meta: MetaFunction = ({ data }) => ({
  viewport: data.gameId ? undefined : 'width=device-width,initial-scale=1',
});

export default function Index() {
  const submit = useSubmit();

  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { gameId, authenticated, deviceName } = loaderData;

  let currentGameId =
    (actionData && 'currentGameId' in actionData
      ? actionData?.currentGameId
      : undefined) ?? loaderData.currentGameId;

  // Refresh the current game ID (loader data) every X seconds for authenticated
  // machines (clients) and every Y seconds for the host machine
  useEffect(() => {
    const id = setInterval(
      () => {
        fetch('/api/display', { method: 'GET' })
          .then((r) => r.json() as ReturnType<typeof displayLoader>)
          .then((d) => {
            currentGameId = d.currentGameId;
            if (currentGameId !== gameId && !authenticated) {
              submit({ gameId: currentGameId ?? '' }, { method: 'get' });
            }
          });
      },
      authenticated ? 30000 : 3000
    );

    return () => clearInterval(id);
  }, [gameId]);

  // Support Amazon Fire TV remotes (or any other remote that uses these button inputs)
  // This feature was tested with model number CV98LM
  // Unfortunately some keys do not seem to be possible to detect with browser
  // JS, like the home button--BrowserHome--and the back/menu buttons. If you
  // know how to do this, please file an issue!
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          // Up on circle
          break;
        case 'ArrowDown':
          // Down on circle
          break;
        case 'ArrowLeft':
          // Left on circle
          break;
        case 'ArrowRight':
          // Right on circle
          break;
        case 'Enter':
          // Middle button
          break;
        default:
          break;
      }
    };

    addEventListener('keydown', handler);
    return () => removeEventListener('keydown', handler);
  }, []);

  if (!gameId) {
    const now = new Date();
    const { data } = useQuery<Schedule>(
      'schedule',
      async () => {
        const response = await fetch(
          `${BASE}/schedule?hydrate=team,linescore&date=${now.getFullYear()}-${
            now.getMonth() + 1
          }-${now.getDate()}`,
          {
            method: 'GET',
          }
        );
        return await response.json();
      },
      {
        refetchInterval: 1200000,
        refetchOnWindowFocus: true,
      }
    );

    return !data ? (
      <BigInfoText>Loading...</BigInfoText>
    ) : !data.dates.length ? (
      <BigInfoText>No games are scheduled today</BigInfoText>
    ) : (
      <div className='h-full flex flex-col'>
        <h1 className='text-5xl mt-4 ml-2'>
          Games today,{' '}
          <span className='text-teal-900'>{now.toLocaleDateString()}</span>
        </h1>
        <div
          className={`flex flex-wrap ${
            authenticated ? '' : 'ml-4'
          } mt-4 text-2xl text-teal-900 overflow-y-auto`}
        >
          {data.dates[0].games.map((game) => {
            const isCurrentGame = currentGameId === game.gamePk.toString();
            const box = (
              <RoundedBox
                className={`p-3 m-2 w-40 ${
                  game.linescore?.currentPeriodTimeRemaining === 'Final'
                    ? 'grayscale'
                    : ''
                }`}
              >
                <div className='flex'>
                  <span className='mx-auto'>
                    {game.teams.away.team.abbreviation}
                  </span>{' '}
                  <span className='mx-auto opacity-30 text-lg'>@</span>{' '}
                  <span className='mx-auto'>
                    {game.teams.home.team.abbreviation}
                  </span>
                </div>
                {game.linescore && game.linescore.currentPeriod !== 0 && (
                  <>
                    <hr className='rounded-full border-2 border-teal-600 my-1' />
                    <div className='flex'>
                      <p>
                        {game.linescore.teams.away.goals}
                        <span className='opacity-30 mx-0.5'>-</span>
                        {game.linescore.teams.home.goals}
                      </p>
                      <span className='opacity-30 mx-auto'>•</span>
                      <p>{game.linescore.currentPeriodOrdinal}</p>
                    </div>
                  </>
                )}
              </RoundedBox>
            );
            return authenticated ? (
              <div className='mx-auto'>
                {box}
                <button
                  className={`rounded-xl w-40 mx-2 mb-4 w-full bg-teal-300 text-lg p-3 active:bg-teal-400 transition ${
                    isCurrentGame ? 'grayscale' : ''
                  }`}
                  onClick={() => {
                    submit(
                      { gameId: isCurrentGame ? '' : game.gamePk.toString() },
                      { method: 'post', replace: true }
                    );
                  }}
                >
                  {isCurrentGame ? 'Showing' : 'Show'}
                </button>
              </div>
            ) : (
              <Link
                key={game.gamePk}
                to={`/?gameId=${game.gamePk}`}
                className='hover:-translate-y-1 transition'
              >
                {box}
              </Link>
            );
          })}
        </div>
        <div className='mt-auto rounded-xl bg-teal-600/50 -mx-6 -mb-2 px-6 pt-3 pb-4 flex flex-col'>
          <div className='flex flex-wrap mx-auto'>
            {authenticated ? (
              <>
                <p className='text-4xl text-center py-1 mr-3'>
                  Linked to {!deviceName && 'a scorebug'}
                </p>
                {deviceName && (
                  <p className='rounded-xl bg-teal-100 text-4xl text-center py-1 px-4'>
                    {deviceName}
                  </p>
                )}
              </>
            ) : (
              // If the client is authenticated then we can safely assume it is not a host device
              <>
                <p className='text-4xl text-center py-1 mr-4'>
                  Use your phone:
                </p>
                <Link
                  to='/link/setup'
                  className='rounded-xl bg-teal-100 hover:bg-teal-100/70 transition text-4xl text-center py-1 px-4'
                >
                  SET UP
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { data } = useQuery<LiveFeed | ErrorMessage>(
    ['game', gameId],
    async () => {
      const response = await fetch(`${BASE}/game/${gameId}/feed/live`, {
        method: 'GET',
      });
      return await response.json();
    },
    {
      refetchInterval: 20000,
      refetchOnWindowFocus: true,
    }
  );

  return !data ? (
    <BigInfoText>Loading...</BigInfoText>
  ) : 'message' in data ? (
    <BigInfoText>
      {data.message} <span className='opacity-30'>[{data.messageNumber}]</span>
    </BigInfoText>
  ) : (
    <LiveFeedDisplay data={data} />
  );
}

const LiveFeedDisplay: React.FC<{ data: LiveFeed }> = ({ data }) => {
  const submit = useSubmit();

  const home = data.gameData.teams.home;
  const away = data.gameData.teams.away;
  // const play = data.liveData.plays.currentPlay;
  const linescore = data.liveData.linescore;

  const awayWinning = linescore.teams.away.goals > linescore.teams.home.goals;
  const homeWinning = linescore.teams.home.goals > linescore.teams.away.goals;

  return (
    <div className='w-full'>
      <div className='flex'>
        <div className='mx-auto'>
          <div className='flex'>
            <img
              src={teamLogo(away.id)}
              className='w-32 h-32 mr-4'
              alt={away.name}
            />
            <RoundedBox
              className='text-teal-900 px-4 py-2 text-7xl my-auto'
              winning={awayWinning}
            >
              {away.abbreviation}
            </RoundedBox>
          </div>
          <RoundedBox className='text-center p-5 flex' winning={awayWinning}>
            <p className='text-[10rem] leading-none m-auto'>
              {linescore.teams.away.goals}
            </p>
            <div className='my-auto'>
              <p className='text-4xl text-teal-900'>SHOTS</p>
              <p className='text-8xl'>{linescore.teams.away.shotsOnGoal}</p>
            </div>
          </RoundedBox>
        </div>
        <div className='mt-10 text-center mx-5'>
          <p className='text-teal-600/40 text-4xl'>@</p>
        </div>
        <div className='mx-auto'>
          <div className='flex'>
            <RoundedBox
              className='text-teal-900 px-4 py-2 text-7xl my-auto'
              winning={homeWinning}
            >
              {home.abbreviation}
            </RoundedBox>
            <img
              src={teamLogo(home.id)}
              className='w-32 h-32 ml-4'
              alt={home.name}
            />
          </div>
          <RoundedBox className='text-center p-5 flex' winning={homeWinning}>
            <p className='text-[10rem] leading-none m-auto'>
              {linescore.teams.home.goals}
            </p>
            <div className='my-auto'>
              <p className='text-4xl text-teal-900'>SHOTS</p>
              <p className='text-8xl'>{linescore.teams.home.shotsOnGoal}</p>
            </div>
          </RoundedBox>
        </div>
      </div>
      <RoundedBox className='p-5 mt-4 text-center text-7xl'>
        {linescore.currentPeriodOrdinal} -{' '}
        {linescore.currentPeriodTimeRemaining}
        <button
          className='absolute right-[1.5rem] bottom-5 p-8 w-28 rounded-xl bg-red-400 text-5xl opacity-20 hover:opacity-100 transition'
          onClick={() => {
            submit({ gameId: 'null' }, { method: 'post' });
            submit(null, { method: 'get', replace: true });
          }}
        >
          x
        </button>
      </RoundedBox>
    </div>
  );
};

const RoundedBox: React.FC<
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > & { winning?: boolean; className?: string }
> = (props) => (
  <div
    {...props}
    className={`${
      props.winning ? 'bg-teal-300/90' : 'bg-teal-600/20'
    } rounded-xl ${props.className ?? ''}`}
  />
);

const BigInfoText: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className='flex w-full h-full'>
    <div className='m-auto text-6xl text-center'>{children}</div>
  </div>
);

/** 20220101_010203 => January 1, 2022, 01:02:03 (24hr) */
const timestampToDate = (timestamp: string) => {
  const match = timestamp.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (match) {
    const t = match.slice(1, 6).map((e) => Number(e));
    return new Date(t[0], t[1] - 1, t[2], t[3], t[4]);
  }
};

const teamLogo = (teamId: number) => {
  return `https://www-league.nhlstatic.com/images/logos/teams-20222023-light/${teamId}.svg`;
};
