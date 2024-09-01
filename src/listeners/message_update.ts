import { ChannelStoreService } from "@services/channel_store";
import { messageGuard, recordUpdateMsg } from "@tasks";
import { Effect, pipe } from "effect";

import type { ChannelStoreRef } from "@services/channel_store";
import type { EnvVariables } from "@services/env";
import type { Client, Message, PartialMessage } from "discord.js";

export const messageUpdateListener = (
  client: Client<true>,
  env: EnvVariables,
  channelStoreRef: ChannelStoreRef,
) => {
  const provideChannelStoreRef = Effect.provideService(
    ChannelStoreService,
    channelStoreRef,
  );

  return (
    oldMsg: Message<boolean> | PartialMessage,
    newMsg: Message<boolean> | PartialMessage,
  ) => {
    const program = pipe(
      Effect.succeed(newMsg),
      Effect.tap((msg) => messageGuard(msg, client)),
      Effect.flatMap((msg) => recordUpdateMsg(env)(client)(oldMsg, msg)),
      Effect.orElse(() => Effect.succeed(newMsg)),
    ).pipe(provideChannelStoreRef);

    Effect.runPromise(program);
  };
};
