import { Effect } from "effect";

import { EnvLive } from "~/services/env";

import { pushCommands } from "./push_commands";

const program = pushCommands([]).pipe(Effect.provide(EnvLive));

Effect.runPromise(program);
