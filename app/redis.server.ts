import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URI });
client.connect();

export default client;

export const verifyCode = async (code: string, token: string) => {
  if (!code || !token) return false;

  const stringData = await client.get(`nhl-scorebug-code-${code}`);
  if (!stringData) {
    return false;
  } else {
    const data = JSON.parse(stringData);
    return data.token === token;
  }
};
