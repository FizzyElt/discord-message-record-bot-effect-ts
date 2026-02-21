import { Effect } from "effect";

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
    Effect.gen(function* () {
        const client = yield* ClientContext;

        client
            .on("clientReady", clientReady)
            .on("messageCreate", messageCreateListener(MainLive))
            .on("messageDelete", messageDeleteListener(MainLive))
            .on("messageUpdate", messageUpdateListener(MainLive))
            .on("interactionCreate", interactionCreateListener(MainLive));
    }).pipe(Effect.provide(MainLive)),
);

Effect.runPromise(program).catch((err) => console.log(err));
