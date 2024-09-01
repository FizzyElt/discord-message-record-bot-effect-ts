import {
  interactionCreate,
  messageCreateListener,
  messageDeleteListener,
  messageUpdateListener,
  ready,
} from "@listeners";
import {
  ChannelStoreService,
  getChannelStoreRef,
  initialChannelStore,
} from "@services/channel_store";
import {
  clientContext,
  loginClient,
  provideClientService,
} from "@services/client";
import { getEnvService, provideEnvService } from "@services/env";
import { createVotingStore } from "@services/voting_store";
import { Effect, pipe } from "effect";
import { constant } from "effect/Function";

const program = pipe(
  Effect.Do,
  Effect.bind("client", constant(clientContext)),
  Effect.bind("env", constant(getEnvService)),
  Effect.bind("channelStoreRef", constant(getChannelStoreRef)),
  Effect.bind("votingStoreRef", createVotingStore),
  Effect.map(({ client, env, channelStoreRef, votingStoreRef }) =>
    client
      .on("ready", ready)
      .on("messageCreate", messageCreateListener(client, env, channelStoreRef))
      .on("messageDelete", messageDeleteListener(client, env, channelStoreRef))
      .on("messageUpdate", messageUpdateListener(client, env, channelStoreRef))
      .on(
        "interactionCreate",
        interactionCreate(client, env, votingStoreRef, channelStoreRef),
      ),
  ),
  Effect.flatMap(loginClient),
);

Effect.runPromise(
  Effect.provideServiceEffect(
    program,
    ChannelStoreService,
    initialChannelStore,
  ).pipe(provideEnvService, provideClientService),
);
