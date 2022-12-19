import { ActionArgs, json, LoaderArgs } from '@remix-run/node';
import { getClient } from '~/redis.server';
import { currentGameIdKey } from './index';

export const loader = async () => {
  const client = await getClient();
  const currentGameId = await client.get(currentGameIdKey);

  return { currentGameId };
};

