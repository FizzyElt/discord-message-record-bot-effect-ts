import {
  Client,
  Channel,
  GuildTextBasedChannel,
  CategoryChannel,
  ChannelType,
  TextChannel,
} from 'discord.js';
import { Option, pipe, Equal, ReadonlyArray } from 'effect';

export const isTextChannel = (channel: Channel): channel is GuildTextBasedChannel =>
  Equal.equals(channel.type, ChannelType.GuildText);

export const isCategoryChannel = (channel: Channel): channel is CategoryChannel =>
  Equal.equals(channel.type, ChannelType.GuildCategory);

export const getChannelByClient = (id: string) => (client: Client<true>) =>
  Option.fromNullable(client.channels.cache.get(id));

export const getTextChannelByClient = (id: string) => (client: Client<true>) =>
  pipe(getChannelByClient(id)(client), Option.filter(isTextChannel));

export const getCategoryTextChannels = (channel: CategoryChannel) =>
  channel.children.cache.filter(isTextChannel).map((channel) => channel as TextChannel);

export const getTextChannelsInfo = (channel: CategoryChannel) =>
  pipe(getCategoryTextChannels(channel), ReadonlyArray.map(getTextChannelInfo));

export const getTextChannelInfo = (channel: TextChannel | GuildTextBasedChannel) => ({
  id: channel.id,
  name: channel.name || '',
});
