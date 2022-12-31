import { LoaderArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { BASE } from '~/root';
import { ErrorMessage } from '~/types/Error';
import { LiveFeed } from '~/types/LiveFeed';
import { Player } from '~/types/Player';
import { BigInfoText, RoundedBox, teamLogo } from './index';

export const loader = async ({ params }: LoaderArgs) => {
  return {
    gameId: params.gameId as string,
  };
};

export const meta: MetaFunction = () => ({
  viewport: 'width=device-width,initial-scale=1',
});

export default function GamePage() {
  const { gameId } = useLoaderData<typeof loader>();
  const [teamId, setTeamId] = useState<number | undefined>(undefined);

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
      refetchOnWindowFocus: false,
    }
  );

  if (!data) {
    return <BigInfoText>Loading...</BigInfoText>;
  } else if ('message' in data) {
    return (
      <BigInfoText>
        {data.message}{' '}
        <span className='opacity-30'>[{data.messageNumber}]</span>
      </BigInfoText>
    );
  }

  const {
    teams: { away, home },
    players: allPlayers,
  } = data.gameData;

  const team =
    teamId === away.id ? away : teamId === home.id ? home : undefined;
  const teamStr = teamId === away.id ? 'away' : 'home';

  const players = Object.values(allPlayers as Record<string, Player>).filter(
    (p) => p.currentTeam.id === teamId
  );
  const onIce = players.filter((p) =>
    data.liveData.boxscore.teams[teamStr].onIce.includes(p.id)
  );
  const offIce = players.filter(
    (p) =>
      !data.liveData.boxscore.teams[teamStr].onIce.includes(p.id) &&
      (data.liveData.boxscore.teams[teamStr].skaters.includes(p.id) ||
        data.liveData.boxscore.teams[teamStr].goalies.includes(p.id))
  );
  const otherPlayers = players.filter(
    (p) =>
      !onIce.map((pl) => pl.id).includes(p.id) &&
      !offIce.map((pl) => pl.id).includes(p.id)
  );

  return !teamId ? (
    <div className='h-full w-full flex'>
      <div className='m-auto w-full space-y-2'>
        <h1 className='text-2xl'>Select a team</h1>
        <RoundedBox className='w-full'>
          <button
            className='p-2 w-full flex'
            onClick={() => setTeamId(away.id)}
          >
            <img
              src={teamLogo(away.id)}
              className='w-16 h-16 mr-1'
              alt={away.name}
            />
            <p className='text-xl my-auto'>{away.teamName}</p>
            <p className='uppercase text-lg opacity-50 my-auto ml-2'>
              {away.abbreviation}
            </p>
          </button>
        </RoundedBox>
        <RoundedBox className='w-full'>
          <button
            className='p-2 w-full flex'
            onClick={() => setTeamId(home.id)}
          >
            <img
              src={teamLogo(home.id)}
              className='w-16 h-16 mr-1'
              alt={home.name}
            />
            <p className='text-xl my-auto'>{home.teamName}</p>
            <p className='uppercase text-lg opacity-50 my-auto ml-2'>
              {home.abbreviation}
            </p>
          </button>
        </RoundedBox>
      </div>
    </div>
  ) : (
    <div className='h-full w-full flex py-4'>
      <div className='m-auto w-full'>
        <div className='flex'>
          <img
            src={teamLogo(teamId)}
            className='w-8 h-8 mr-1 my-auto'
            alt={team.name}
          />
          <p className='my-auto text-base opacity-50'>{team.name}</p>
          <button
            onClick={() => setTeamId(undefined)}
            className='rounded-xl py-2 px-3 bg-teal-800 text-teal-200 text-sm ml-auto my-auto'
          >
            Back
          </button>
        </div>
        {onIce.length ? (
          <>
            <h1 className='text-2xl mb-2'>On Ice</h1>
            {onIce.map((player) => (
              <RosterPlayer key={player.id} player={player} />
            ))}
            <h1 className='text-2xl mb-2'>Off Ice</h1>
            {offIce.map((player) => (
              <RosterPlayer key={player.id} player={player} />
            ))}
            {!!otherPlayers.length && (
              <>
                <h1 className='text-2xl mb-2'>Remaining Roster</h1>
                {otherPlayers.map((player) => (
                  <RosterPlayer key={player.id} player={player} />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <h1 className='text-2xl mb-2'>Roster</h1>
            {players.map((player) => (
              <RosterPlayer key={player.id} player={player} />
            ))}
          </>
        )}
        <button
          onClick={() => setTeamId(undefined)}
          className='rounded-xl p-4 w-full bg-teal-800 my-4 text-teal-200'
        >
          Back
        </button>
      </div>
    </div>
  );
}

export const RosterPlayer = ({ player }: { player: Player }) => (
  <RoundedBox className='w-full mb-2'>
    <a
      className='p-2 w-full flex'
      href={`https://www.nhl.com/player/${player.id}`}
      target='_blank'
      rel='noreferrer'
    >
      <img
        src={playerImage(player.id)}
        className='w-14 h-14 mr-2.5 rounded-full'
        alt={player.fullName}
        onError={(e) => (e.currentTarget.src = playerImage(null))}
      />
      <p className='text-xl my-auto'>{player.lastName},</p>
      <p className='text-base my-auto truncate ml-1'>{player.firstName}</p>
      <p className='uppercase text-lg opacity-50 my-auto ml-2'>
        {player.primaryNumber}
      </p>
    </a>
  </RoundedBox>
);

export const playerImage = (playerId: number | null, size?: string) =>
  `https://cms.nhl.bamgrid.com/images/headshots/current/${size ?? '60x60'}/${
    playerId ?? 'skater'
  }@2x.jpg`;
