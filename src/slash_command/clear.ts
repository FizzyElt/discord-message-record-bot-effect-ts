import { Effect, FileSystem } from "effect";

import { EnvLive } from "~/services/env";

import { pushCommands } from "./push_commands";

declare const platformImpl: Omit<
    FileSystem.FileSystem,
    "exists" | "readFileString" | "stream" | "sink" | "writeFileString"
>;

const program = pushCommands([]).pipe(
    Effect.provide(EnvLive),
    Effect.provideService(FileSystem.FileSystem, FileSystem.make(platformImpl)),
);

Effect.runPromise(program);
