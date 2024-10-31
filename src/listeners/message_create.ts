import { Effect, pipe } from "effect";
import { messageGuard } from "~/tasks";

import type { Message } from "discord.js";
import type { MainLive } from "~/services";

export const messageCreateListener =
  (live: typeof MainLive) => (msg: Message<boolean>) => {
    const program = pipe(
      messageGuard(msg),
      Effect.orElse(() => Effect.succeed(msg)),
    );

    Effect.runPromise(program.pipe(Effect.provide(live)));
  };
