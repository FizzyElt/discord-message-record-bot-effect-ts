import { Client } from 'discord.js';
import { Option } from 'effect';

export const getChannelByClient = (id: string) => (client: Client<true>) =>
  Option.fromNullable(client.channels.cache.get(id));
