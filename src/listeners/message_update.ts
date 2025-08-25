import type {
    Message,
    OmitPartialGroupDMChannel,
    PartialMessage,
} from "discord.js";
import { Effect, pipe } from "effect";
import type { MainLive } from "~/services";
import { messageGuard, recordUpdateMsg } from "~/tasks";

export const messageUpdateListener =
    (live: typeof MainLive) =>
    (
        oldMsg: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage>,
        newMsg: OmitPartialGroupDMChannel<Message<boolean>>,
    ) => {
        const program = pipe(
            messageGuard(newMsg),
            Effect.flatMap((msg) => recordUpdateMsg(oldMsg, msg)),
            Effect.orElse(() => Effect.succeed(newMsg)),
        );

        Effect.runPromise(program.pipe(Effect.provide(live)));
    };
