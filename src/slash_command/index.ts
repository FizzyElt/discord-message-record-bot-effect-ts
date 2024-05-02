import { REST, Routes } from "discord.js";
import { Effect, pipe, Console } from "effect";
import { provideEnvService, getEnvService } from "../services/env";
import { commands } from "./main_command";
import { memeCommands } from "./meme_command";

import type { SlashCommandBuilder } from "discord.js";

const pushCommands = (
  commands: Array<
    Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
  >,
) => {
  const rest = new REST({ version: "10" });
  return pipe(
    getEnvService,
    Effect.flatMap((env) => {
      rest.setToken(env.token);
      return Effect.tryPromise(() =>
        rest.put(Routes.applicationGuildCommands(env.client_id, env.guild_id), {
          body: commands.map((command) => command.toJSON()),
        }),
      );
    }),
    Effect.matchEffect({
      onFailure: () => Console.error("put fail"),
      onSuccess: (res) => Console.log("put success", res),
    }),
  );
};

const program = pushCommands([...commands, ...memeCommands]).pipe(
  provideEnvService,
);

Effect.runPromise(program);
