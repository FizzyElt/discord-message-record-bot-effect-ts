import type { Awaitable, Message, PartialMessage } from "discord.js";
import { Effect, pipe } from "effect";
import type { MainLive } from "~/services";
import { messageGuard, recordDeleteMsg } from "~/tasks";

export const messageDeleteListener =
    (live: typeof MainLive) =>
    (msg: Message<boolean> | PartialMessage): Awaitable<void> => {
        const program = pipe(
            messageGuard(msg),
            Effect.flatMap(recordDeleteMsg),
            Effect.orElse(() => Effect.succeed(msg))
        );

        Effect.runPromise(program.pipe(Effect.provide(live)));
    };
