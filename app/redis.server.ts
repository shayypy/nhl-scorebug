import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;
export const getClient = async () => {
  if (client && client.isOpen) {
    return client;
  } else if (client) {
    await client.disconnect();
  }
  client = createClient({ url: process.env.REDIS_URI });
  await client.connect();
  return client;
};

export const verifyCode = async (code: string, token: string) => {
  if (!code || !token) return false;

  const stringData = await (await getClient()).get(`nhl-scorebug-code-${code}`);
  if (!stringData) {
    return false;
  } else {
    const data = JSON.parse(stringData);
    return data.token === token;
  }
};
