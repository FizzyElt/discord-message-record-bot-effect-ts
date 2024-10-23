import { Effect } from "effect";
import { EnvLive } from "../services/env";
import { commands } from "./main_command";
import { memeCommands } from "./meme_command";
import { pushCommands } from "./push_commands";

const program = pushCommands([...commands, ...memeCommands]).pipe(
  Effect.provide(EnvLive),
);

Effect.runPromise(program);
