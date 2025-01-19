import { Effect, Layer } from "effect";
import {
  interactionCreateListener,
  messageCreateListener,
  messageDeleteListener,
  messageUpdateListener,
  ready,
} from "~/listeners";
import { MainLive } from "~/services";
import { ClientContext } from "~/services/client";

const program = Effect.scoped(
  Layer.memoize(MainLive).pipe(
    Effect.flatMap((mainLive) =>
      Effect.gen(function* () {
        const client = yield* ClientContext;

        client
          .on("ready", ready)
          .on("messageCreate", messageCreateListener(mainLive))
          .on("messageDelete", messageDeleteListener(mainLive))
          .on("messageUpdate", messageUpdateListener(mainLive))
          .on("interactionCreate", interactionCreateListener(mainLive));
      }).pipe(Effect.provide(mainLive)),
    ),
  ),
);

Effect.runPromise(program).catch((err) => console.log(err));
