import { REST, Routes } from "discord.js";
import { Console, Effect, pipe } from "effect";
import { EnvConfig, EnvLive } from "../services/env";
import { commands } from "./main_command";
import { memeCommands } from "./meme_command";

import type { SlashCommandOptionsOnlyBuilder } from "discord.js";

const pushCommands = (
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

const program = pushCommands([...commands, ...memeCommands]).pipe(
  Effect.provide(EnvLive),
);

Effect.runPromise(program);
