import { MainLive } from "@services";
import { messageGuard } from "@tasks";
import { Effect, pipe } from "effect";

import type { Message } from "discord.js";

export const messageCreateListener = (msg: Message<boolean>) => {
  const program = pipe(
    messageGuard(msg),
    Effect.orElse(() => Effect.succeed(msg)),
  );

  Effect.runPromise(program.pipe(Effect.provide(MainLive)));
};
