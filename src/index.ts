import { Effect, Layer } from "effect";
import {
    clientReady,
    interactionCreateListener,
    messageCreateListener,
    messageDeleteListener,
    messageUpdateListener,
} from "~/listeners";
import { MainLive } from "~/services";
import { ClientContext } from "~/services/client";

const program = Effect.scoped(
    Layer.memoize(MainLive).pipe(
        Effect.flatMap((mainLive) =>
            Effect.gen(function* () {
                const client = yield* ClientContext;

                client
                    .on("clientReady", clientReady)
                    .on("messageCreate", messageCreateListener(mainLive))
                    .on("messageDelete", messageDeleteListener(mainLive))
                    .on("messageUpdate", messageUpdateListener(mainLive))
                    .on(
                        "interactionCreate",
                        interactionCreateListener(mainLive),
                    );
            }).pipe(Effect.provide(mainLive)),
        ),
    ),
);

Effect.runPromise(program).catch((err) => console.log(err));
