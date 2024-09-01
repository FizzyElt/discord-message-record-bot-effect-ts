import { hasChannel } from "@services/channel_store";
import { Boolean, Effect, Equal, pipe } from "effect";
import { inviteLinkGuard } from "./invite_link_guard";

import type { ChannelStoreService } from "@services/channel_store";
import type { Client, Message, PartialMessage } from "discord.js";

export const messageGuard = (
  msg: Message<boolean> | PartialMessage,
  client: Client<true>,
): Effect.Effect<
  Message<boolean> | PartialMessage,
  string,
  ChannelStoreService
> => {
  return pipe(
    Effect.succeed(msg),
    Effect.tap(inviteLinkGuard),
    Effect.filterOrFail(
      (msg) => !msg.author?.bot,
      () => "Is bot message",
    ),
    Effect.filterOrFail(
      (msg) => !Equal.equals(msg.author?.id, client.user.id),
      () => "Is bot self",
    ),
    Effect.tap((msg) =>
      pipe(
        hasChannel(msg.channel.id),
        Effect.filterOrFail(Boolean.not, () => "channel is ignored"),
      ),
    ),
  );
};
