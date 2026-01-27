import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { Effect, pipe } from "effect";

import type { MainLive } from "~/services";
import { messageGuard } from "~/tasks";

export const messageCreateListener =
    (live: typeof MainLive) =>
    (msg: OmitPartialGroupDMChannel<Message<boolean>>) => {
        const program = pipe(
            messageGuard(msg),
            Effect.orElse(() => Effect.succeed(msg)),
        );

        Effect.runPromise(program.pipe(Effect.provide(live)));
    };
