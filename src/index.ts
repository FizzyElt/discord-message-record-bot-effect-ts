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
import { commands } from "~/slash_command/main_command";
import { memeCommands } from "~/slash_command/meme_command";
import { pushCommands } from "~/slash_command/push_commands";

const program = Effect.scoped(
    Effect.gen(function* () {
        yield* pushCommands([...commands, ...memeCommands]);
        
        const client = yield* ClientContext;

        client
            .on("clientReady", clientReady)
            .on("messageCreate", messageCreateListener(MainLive))
            .on("messageDelete", messageDeleteListener(MainLive))
            .on("messageUpdate", messageUpdateListener(MainLive))
            .on("interactionCreate", interactionCreateListener(MainLive));
    }).pipe(Effect.provide(MainLive)),
);

// oxlint-disable-next-line no-console
Effect.runPromise(program).catch((err) => console.log(err));
