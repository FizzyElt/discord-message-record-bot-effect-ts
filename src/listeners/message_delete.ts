import { ChannelStoreService } from "@services/channel_store";
import { messageGuard, recordDeleteMsg } from "@tasks";
import { Effect, pipe } from "effect";

import type { ChannelStoreRef } from "@services/channel_store";
import type { EnvVariables } from "@services/env";
import type { Awaitable, Client, Message, PartialMessage } from "discord.js";

export const messageDeleteListener = (
  client: Client<true>,
  env: EnvVariables,
  channelStoreRef: ChannelStoreRef,
) => {
  const provideChannelStoreRef = Effect.provideService(
    ChannelStoreService,
    channelStoreRef,
  );

  return (msg: Message<boolean> | PartialMessage): Awaitable<void> => {
    const program = pipe(
      Effect.succeed(msg),
      Effect.tap((msg) => messageGuard(msg, client)),
      Effect.flatMap(recordDeleteMsg(env)(client)),
      Effect.orElse(() => Effect.succeed(msg)),
    ).pipe(provideChannelStoreRef);

    Effect.runPromise(program);
  };
};
