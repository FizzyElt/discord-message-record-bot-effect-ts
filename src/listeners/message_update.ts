import { MainLive } from "@services";
import { messageGuard, recordUpdateMsg } from "@tasks";
import { Effect, pipe } from "effect";

import type { Message, PartialMessage } from "discord.js";

export const messageUpdateListener = (
  oldMsg: Message<boolean> | PartialMessage,
  newMsg: Message<boolean> | PartialMessage,
) => {
  const program = pipe(
    messageGuard(newMsg),
    Effect.flatMap((msg) => recordUpdateMsg(oldMsg, msg)),
    Effect.orElse(() => Effect.succeed(newMsg)),
  );

  Effect.runPromise(program.pipe(Effect.provide(MainLive)));
};
