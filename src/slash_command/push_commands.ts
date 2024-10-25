import type {
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { REST, Routes } from "discord.js";
import { Console, Effect, pipe } from "effect";
import { EnvConfig } from "~/services/env";

export const pushCommands = (
  commands: Array<
    SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder
  >,
) => {
  const rest = new REST({ version: "10" });
  return pipe(
    EnvConfig,
    Effect.flatMap((env) => {
      rest.setToken(env.TOKEN);
      return Effect.tryPromise(() =>
        rest.put(Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID), {
          body: commands.map((command) => command.toJSON()),
        }),
      );
    }),
    Effect.matchEffect({
      onFailure: (err) => Console.error("put fail", err),
      onSuccess: () => Effect.void,
    }),
  );
};
