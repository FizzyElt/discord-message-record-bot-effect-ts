import {
  flow,
  pipe,
  Option,
  Equal,
  Effect,
  Array as ReadonlyArray,
} from "effect";
import {
  getCategoryTextChannels,
  getTextChannelsInfo,
  getTextChannelInfo,
  isCategoryChannel,
  isTextChannel,
} from "@utils/channel";
import { getCommandOptionString } from "@utils/command";
import {
  addChannel,
  addChannels,
  getChannelStore,
  removeChannel,
  removeChannels,
} from "@services/channel_store";

import type { CommandInteraction, Channel, Client } from "discord.js";

const excludeChannels = (channel: Channel) => {
  if (isCategoryChannel(channel)) {
    return pipe(
      Effect.succeed(channel),
      Effect.tap((channel) => pipe(getTextChannelsInfo(channel), addChannels)),
      Effect.map((channel) => `已排除 **${channel.name}** 下的所有文字頻道`),
    );
  }

  if (isTextChannel(channel)) {
    return pipe(
      Effect.succeed(channel),
      Effect.tap((channel) => pipe(getTextChannelInfo(channel), addChannel)),
      Effect.map((channel) => `已排除 **${channel.name}**`),
    );
  }

  return Effect.succeed("不支援的頻道類型");
};

export const addChannelFlow =
  (client: Client<true>) => (interaction: CommandInteraction) =>
    pipe(
      Effect.succeed(interaction),
      Effect.flatMap((interaction) =>
        pipe(interaction, getCommandOptionString("id"), (idOrName) =>
          Option.fromNullable(
            client.channels.cache.find((channel) =>
              Equal.equals(channel.id, idOrName),
            ),
          ),
        ),
      ),
      Effect.flatMap(excludeChannels),
      Effect.orElseFail(() => "找不到頻道"),
      Effect.flatMap((msg) => Effect.tryPromise(() => interaction.reply(msg))),
    );

const includeChannels = (channel: Channel) => {
  if (isCategoryChannel(channel)) {
    return pipe(
      Effect.succeed(channel),
      Effect.tap((channel) =>
        pipe(
          getCategoryTextChannels(channel),
          ReadonlyArray.map((channel) => channel.id),
          removeChannels,
        ),
      ),
      Effect.map((channel) => `已監聽 **${channel.name}** 下的所有文字頻道`),
    );
  }

  if (isTextChannel(channel)) {
    return pipe(
      Effect.succeed(channel),
      Effect.tap((channel) => removeChannel(channel.id)),
      Effect.map((channel) => `已監聽 **${channel.name}**`),
    );
  }

  return Effect.succeed("不支援的頻道類型");
};

export const removeChannelFlow =
  (client: Client<true>) => (interaction: CommandInteraction) =>
    pipe(
      Effect.succeed(interaction),
      Effect.flatMap((interaction) =>
        pipe(interaction, getCommandOptionString("id"), (idOrName) =>
          Option.fromNullable(
            client.channels.cache.find((channel) =>
              Equal.equals(channel.id, idOrName),
            ),
          ),
        ),
      ),
      Effect.flatMap(includeChannels),
      Effect.orElseFail(() => "找不到頻道"),
      Effect.flatMap((msg) => Effect.tryPromise(() => interaction.reply(msg))),
    );

export const listChannels = (interaction: CommandInteraction) =>
  pipe(
    getChannelStore,
    Effect.map(
      flow(
        ReadonlyArray.fromIterable,
        ReadonlyArray.map(([id, name]) => `(${id}) ${name}`),
        ReadonlyArray.join("\n"),
      ),
    ),
    Effect.flatMap((msg) => Effect.tryPromise(() => interaction.reply(msg))),
  );
