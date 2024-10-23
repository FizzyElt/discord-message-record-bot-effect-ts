import { getSticky } from "@services/sticky_store";
import { getCommandOptionString } from "@utils/command";
import type { CommandInteraction } from "discord.js";
import { Effect, String, pipe } from "effect";

export const showSticky = (interaction: CommandInteraction) => {
  const name = pipe(getCommandOptionString("name")(interaction), String.trim);

  return pipe(
    getSticky(name),
    Effect.matchEffect({
      onSuccess: ({ url }) =>
        Effect.tryPromise(() =>
          interaction.reply({ content: url, fetchReply: true }),
        ),
      onFailure: () =>
        Effect.tryPromise(() =>
          interaction.reply({ content: `找不到 ${name}`, fetchReply: true }),
        ),
    }),
  );
};
