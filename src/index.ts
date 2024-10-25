import {
  messageCreateListener,
  messageDeleteListener,
  messageUpdateListener,
  interactionCreateListener,
  ready,
} from "@listeners";
import { ClientContext } from "@services/client";
import { MainLive } from "@services";
import { Effect, Layer } from "effect";

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

Effect.runPromise(program).then((err) => console.log(err));
