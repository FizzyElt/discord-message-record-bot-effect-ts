import { MainLive } from "@services";
import { messageGuard, recordDeleteMsg } from "@tasks";
import { Effect, pipe } from "effect";

import type { Awaitable, Message, PartialMessage } from "discord.js";

export const messageDeleteListener = (
  msg: Message<boolean> | PartialMessage,
): Awaitable<void> => {
  const program = pipe(
    messageGuard(msg),
    Effect.flatMap(recordDeleteMsg),
    Effect.orElse(() => Effect.succeed(msg)),
  );

  Effect.runPromise(program.pipe(Effect.provide(MainLive)));
};
