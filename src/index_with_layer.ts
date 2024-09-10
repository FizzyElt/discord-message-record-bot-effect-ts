import {
  interactionCreate,
  messageCreateListener,
  messageDeleteListener,
  messageUpdateListener,
  ready,
} from "@listeners";
import { ClientContext, ClientLive } from "@services/client";
import { EnvLive } from "@services/env";
import { Effect, Layer } from "effect";

const MainLive = ClientLive.pipe(Layer.provideMerge(EnvLive));

const program = Effect.gen(function* () {
  const client = yield* ClientContext;

  client.on("ready", ready);
});

Effect.runPromise(program.pipe(Effect.provide(MainLive)));
