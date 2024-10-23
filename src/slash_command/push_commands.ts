import { EnvConfig } from "@services/env";
import { REST, Routes } from "discord.js";
import type { SlashCommandOptionsOnlyBuilder } from "discord.js";
import { Console, Effect, pipe } from "effect";

export const pushCommands = (
  commands: Array<
    Omit<SlashCommandOptionsOnlyBuilder, "addSubcommand" | "addSubcommandGroup">
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
      onSuccess: (res) => Console.log("put success", res),
    }),
  );
};
