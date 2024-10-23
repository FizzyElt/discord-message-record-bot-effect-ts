import { deleteSticky as deleteStickyByName } from "@services/sticky_store";
import { getCommandOptionString } from "@utils/command";
import type { CommandInteraction } from "discord.js";
import { Effect, String, pipe } from "effect";

export const deleteSticky = (interaction: CommandInteraction) => {
  const name = pipe(getCommandOptionString("name")(interaction), String.trim);

  return pipe(
    deleteStickyByName(name),
    Effect.matchEffect({
      onSuccess: () =>
        Effect.tryPromise(() =>
          interaction.reply({ content: `刪除 ${name} 成功`, fetchReply: true }),
        ),
      onFailure: () =>
        Effect.tryPromise(() =>
          interaction.reply({ content: `刪除 ${name} 失敗`, fetchReply: true }),
        ),
    }),
  );
};
