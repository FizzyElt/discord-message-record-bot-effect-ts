import { Client, CommandInteraction, Channel } from 'discord.js';
import { pipe, Option, Equal, Effect } from 'effect';
import {
  getTextChannelsInfo,
  getTextChannelInfo,
  isCategoryChannel,
  isTextChannel,
} from '@utils/channel';
import { getCommandOptionString } from '@utils/command';
import { addChannel, addChannels } from '@services/channel_store';

const excludeChannels = (channel: Channel) => {
  if (isCategoryChannel(channel)) {
    return pipe(
      Effect.succeed(channel),
      Effect.tap((channel) => pipe(getTextChannelsInfo(channel), addChannels)),
      Effect.map((channel) => `已排除 **${channel.name}** 下的所有文字頻道`)
    );
  }

  if (isTextChannel(channel)) {
    return pipe(
      Effect.succeed(channel),
      Effect.tap((channel) => pipe(getTextChannelInfo(channel), addChannel)),
      Effect.map((channel) => `已排除 **${channel.name}**`)
    );
  }

  return Effect.succeed('不支援的頻道類型');
};

export const addChannelFlow = (client: Client<true>) => (interaction: CommandInteraction) =>
  pipe(
    Effect.succeed(interaction),
    Effect.flatMap((interaction) =>
      pipe(interaction, getCommandOptionString('id'), (idOrName) =>
        Option.fromNullable(
          client.channels.cache.find((channel) => Equal.equals(channel.id, idOrName))
        )
      )
    ),
    Effect.flatMap(excludeChannels),
    Effect.orElseFail(() => '找不到頻道'),
    Effect.flatMap((msg) => Effect.tryPromise(() => interaction.reply(msg)))
  );
