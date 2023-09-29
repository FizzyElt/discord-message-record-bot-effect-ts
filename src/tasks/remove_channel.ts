import { Client, CommandInteraction, Channel } from 'discord.js';
import { pipe, Option, Equal, Effect, ReadonlyArray } from 'effect';
import { getCategoryTextChannels, isCategoryChannel, isTextChannel } from '@utils/channel';
import { getCommandOptionString } from '@utils/command';
import { removeChannel, removeChannels } from '@services/channel_store';

const includeChannels = (channel: Channel) => {
  if (isCategoryChannel(channel)) {
    return pipe(
      Effect.succeed(channel),
      Effect.tap((channel) =>
        pipe(
          getCategoryTextChannels(channel),
          ReadonlyArray.map((channel) => channel.id),
          removeChannels
        )
      ),
      Effect.map((channel) => `已監聽 **${channel.name}** 下的所有文字頻道`)
    );
  }

  if (isTextChannel(channel)) {
    return pipe(
      Effect.succeed(channel),
      Effect.tap((channel) => removeChannel(channel.id)),
      Effect.map((channel) => `已監聽 **${channel.name}**`)
    );
  }

  return Effect.succeed('不支援的頻道類型');
};

export const removeChannelFlow = (client: Client<true>) => (interaction: CommandInteraction) =>
  pipe(
    Effect.succeed(interaction),
    Effect.flatMap((interaction) =>
      pipe(interaction, getCommandOptionString('id'), (idOrName) =>
        Option.fromNullable(
          client.channels.cache.find((channel) => Equal.equals(channel.id, idOrName))
        )
      )
    ),
    Effect.flatMap(includeChannels),
    Effect.orElseFail(() => '找不到頻道'),
    Effect.flatMap((msg) => Effect.tryPromise(() => interaction.reply(msg)))
  );
