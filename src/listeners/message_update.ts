import type { Message, PartialMessage } from "discord.js";
import { Effect, pipe } from "effect";
import type { MainLive } from "~/services";
import { messageGuard, recordUpdateMsg } from "~/tasks";

export const messageUpdateListener =
    (live: typeof MainLive) =>
    (
        oldMsg: Message<boolean> | PartialMessage,
        newMsg: Message<boolean> | PartialMessage
    ) => {
        const program = pipe(
            messageGuard(newMsg),
            Effect.flatMap((msg) => recordUpdateMsg(oldMsg, msg)),
            Effect.orElse(() => Effect.succeed(newMsg))
        );

        Effect.runPromise(program.pipe(Effect.provide(live)));
    };
