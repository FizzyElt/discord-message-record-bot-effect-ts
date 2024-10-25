import type {
  CacheType,
  ChatInputCommandInteraction,
  CommandInteraction,
} from "discord.js";
import { Effect, pipe } from "effect";

import * as StickyStore from "~/services/sticky_store";
import { getCommandOptionString } from "~/utils/command";

export const showSticky = (
  interaction: ChatInputCommandInteraction<CacheType>,
) => {
  const name = interaction.options.getString("name") || "";

  return pipe(
    StickyStore.getSticky(name),
    Effect.match({
      onSuccess: ({ imageUrl }) => imageUrl,
      onFailure: () => `找不到 ${name}`,
    }),
    Effect.flatMap((msg) =>
      Effect.tryPromise(() =>
        interaction.reply({ content: msg, fetchReply: true }),
      ),
    ),
  );
};

export const createSticky = (interaction: CommandInteraction) => {
  const name = getCommandOptionString("name")(interaction);
  const url = getCommandOptionString("url")(interaction);
  const group = getCommandOptionString("group")(interaction) || "default";

  return pipe(
    StickyStore.createNewSticky(name, url, group),
    Effect.match({
      onSuccess: () => `新增 ${name} 到 ${group} 成功`,
      onFailure: () => `新增 ${name} 到 ${group} 失敗`,
    }),
    Effect.flatMap((msg) =>
      Effect.tryPromise(() =>
        interaction.reply({ content: msg, fetchReply: true }),
      ),
    ),
  );
};

export const deleteSticky = (interaction: CommandInteraction) => {
  const name = getCommandOptionString("name")(interaction);

  return pipe(
    StickyStore.deleteSticky(name),
    Effect.match({
      onSuccess: () => `刪除 ${name} 成功`,
      onFailure: () => `刪除 ${name} 失敗`,
    }),
    Effect.flatMap((msg) =>
      Effect.tryPromise(() =>
        interaction.reply({ content: msg, fetchReply: true }),
      ),
    ),
  );
};
