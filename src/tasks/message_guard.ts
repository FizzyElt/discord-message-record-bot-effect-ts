import { Client, Message, PartialMessage } from 'discord.js';
import { Effect, Equal, Boolean, pipe } from 'effect';
import { inviteLinkGuard } from './invite_link_guard';
import { ChannelStoreRef, ChannelStoreService, hasChannel } from '@services/channel_store';

interface MessageGuard {
  (msg: Message<boolean> | PartialMessage, client: Client<true>): Effect.Effect<
    ChannelStoreRef,
    string,
    Message<boolean> | PartialMessage
  >;
}

export const messageGuard: MessageGuard = (msg, client) => {
  return pipe(
    Effect.succeed(msg),
    Effect.tap(inviteLinkGuard),
    Effect.filterOrDieMessage((msg) => !msg.author?.id, 'Is bot message'),
    Effect.filterOrDieMessage((msg) => Equal.equals(msg.author?.id, client.user.id), 'Is bot self'),
    Effect.tap((msg) =>
      pipe(hasChannel(msg.channel.id), Effect.filterOrDieMessage(Boolean.not, 'channel is ignored'))
    )
  );
};