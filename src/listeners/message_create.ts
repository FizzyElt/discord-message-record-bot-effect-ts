import { Effect, pipe } from "effect";
import { recordCreatedMsg, messageGuard } from "@tasks";
import { ChannelStoreService } from "@services/channel_store";

import type { EnvVariables } from "@services/env";
import type { Awaitable, Client, Message } from "discord.js";
import type { ChannelStoreRef } from "@services/channel_store";

export const messageCreateListener = (
  client: Client<true>,
  env: EnvVariables,
  channelStoreRef: ChannelStoreRef,
) => {
  const provideChannelStoreRef = Effect.provideService(
    ChannelStoreService,
    channelStoreRef,
  );

  return (msg: Message<boolean>): Awaitable<void> => {
    const program = pipe(
      Effect.succeed(msg),
      Effect.tap((msg) => messageGuard(msg, client)),
      // Effect.flatMap(recordCreatedMsg(env)(client)),
      Effect.orElse(() => Effect.succeed(msg)),
    ).pipe(provideChannelStoreRef);

    Effect.runPromise(program);
  };
};
