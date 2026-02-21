import type {
    Awaitable,
    Message,
    OmitPartialGroupDMChannel,
    PartialMessage,
} from "discord.js";
import { Effect, pipe } from "effect";

import type { MainLive } from "~/services";
import { messageGuard, recordDeleteMsg } from "~/tasks";

export const messageDeleteListener =
    (live: typeof MainLive) =>
    (
        msg: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage>,
    ): Awaitable<void> => {
        const program = pipe(
            messageGuard(msg),
            Effect.flatMap(recordDeleteMsg),
            Effect.orElseSucceed(() => msg),
        );

        Effect.runPromise(program.pipe(Effect.provide(live)));
    };
