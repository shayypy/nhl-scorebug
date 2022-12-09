import React from 'react';
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';
import { LiveFeed } from './types/LiveFeed';

const queryClient = new QueryClient();

const BASE = 'https://statsapi.web.nhl.com/api/v1';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='bg-black w-screen h-screen overflow-auto'>
        <div className='bg-teal-100 w-full h-full rounded-3xl pt-1 pb-2 px-6 font-black overflow-auto'>
          <Index />
        </div>
      </div>
    </QueryClientProvider>
  );
}

function Index() {
  const gameId = new URLSearchParams(window.location.search).get('gameId');
  if (!gameId) {
    return <BigInfoText>No game ID provided</BigInfoText>;
  }

  const { data } = useQuery<LiveFeed>(
    ['game', gameId],
    async () => {
      const response = await fetch(`${BASE}/game/${gameId}/feed/live`, {
        method: 'GET',
      });
      return await response.json();
    },
    {
      // refetchInterval: 10000,
      refetchOnWindowFocus: false,
    }
  );

  return !data ? (
    <BigInfoText>Loading...</BigInfoText>
  ) : (
    <LiveFeedDisplay data={data} />
  );
}

const LiveFeedDisplay: React.FC<{ data: LiveFeed }> = ({ data }) => {
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
    <div className='m-auto text-6xl'>{children}</div>
  </div>
);

const teamLogo = (teamId: number) => {
  return `https://www-league.nhlstatic.com/images/logos/teams-20222023-light/${teamId}.svg`;
};
