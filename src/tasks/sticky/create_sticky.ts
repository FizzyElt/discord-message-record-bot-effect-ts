import { createNewSticky } from "@services/sticky_store";
import { getCommandOptionString } from "@utils/command";
import type { CommandInteraction } from "discord.js";
import { Effect, String, pipe } from "effect";

export const createSticky = (interaction: CommandInteraction) => {
  const name = pipe(getCommandOptionString("name")(interaction), String.trim);
  const url = pipe(getCommandOptionString("url")(interaction), String.trim);

  return pipe(
    createNewSticky({ name, url }),
    Effect.catchTag("DuplicateStickyError", () =>
      Effect.tryPromise(() =>
        interaction.reply({ content: `${name} 已存在`, fetchReply: true }),
      ),
    ),
    Effect.matchEffect({
      onSuccess: () =>
        Effect.tryPromise(() =>
          interaction.reply({ content: `新增 ${name} 成功`, fetchReply: true }),
        ),
      onFailure: () =>
        Effect.tryPromise(() =>
          interaction.reply({ content: `新增 ${name} 失敗`, fetchReply: true }),
        ),
    }),
  );
};
