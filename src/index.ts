import {
  messageCreateListener,
  messageDeleteListener,
  messageUpdateListener,
  interactionCreateListener,
  ready,
} from "@listeners";
import { ClientContext, ClientLive } from "@services/client";
import { EnvLive } from "@services/env";
import { Effect, Layer } from "effect";

const MainLive = ClientLive.pipe(Layer.provideMerge(EnvLive));

const program = Effect.gen(function* () {
  const client = yield* ClientContext;

  client
    .on("ready", ready)
    .on("messageCreate", messageCreateListener)
    .on("messageDelete", messageDeleteListener)
    .on("messageUpdate", messageUpdateListener)
    .on("interactionCreate", interactionCreateListener);
});

Effect.runPromise(program.pipe(Effect.provide(MainLive)));
