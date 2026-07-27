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
import { commands } from "~/slash_command/main_command";
import { memeCommands } from "~/slash_command/meme_command";
import { pushCommands } from "~/slash_command/push_commands";

const program = Effect.scoped(
    Layer.memoize(MainLive).pipe(
        Effect.tap((mainLive) => {
            return pushCommands([...commands, ...memeCommands]).pipe(
                Effect.provide(mainLive),
            );
        }),
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

// oxlint-disable-next-line no-console
Effect.runPromise(program).catch((err) => console.log(err));
