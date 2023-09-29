import { Client, Channel, GuildTextBasedChannel } from 'discord.js';
import { Option, Effect, pipe } from 'effect';

export const isTextChannel = (channel: Channel): channel is GuildTextBasedChannel =>
  channel.isTextBased();

export const getChannelByClient = (id: string) => (client: Client<true>) =>
  Option.fromNullable(client.channels.cache.get(id));

export const getTextChannelByClient = (id: string) => (client: Client<true>) =>
  pipe(getChannelByClient(id)(client), Option.filter(isTextChannel));
