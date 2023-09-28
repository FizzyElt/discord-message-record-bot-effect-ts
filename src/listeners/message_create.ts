import { Effect, pipe, Equal, Boolean, MutableHashMap } from 'effect';
import { Awaitable, Client, Message } from 'discord.js';
import { inviteLinkGuard, recordCreatedMsg } from '@tasks';
import { EnvVariables } from '@services/env';
import {
  ChannelStoreRef,
  ChannelStoreService,
  getChannelStore,
  hasChannel,
} from '@services/channel_store';
export const messageCreateListener = (
  client: Client<true>,
  channelStoreRef: ChannelStoreRef,
  env: EnvVariables
) => {
  const provideChannelStoreRef = Effect.provideService(
    ChannelStoreService,
    ChannelStoreService.of(channelStoreRef)
  );

  return (msg: Message<boolean>): Awaitable<void> => {
    const program = pipe(
      Effect.succeed(msg),
      Effect.tap(inviteLinkGuard),
      Effect.filterOrDieMessage((msg) => !msg.author.bot, 'Is bot message'),
      Effect.filterOrDieMessage(
        (msg) => Equal.equals(msg.author.id, client.user.id),
        'Is bot self'
      ),
      Effect.tap((msg) =>
        pipe(
          hasChannel(msg.channel.id),
          Effect.filterOrDieMessage(Boolean.not, 'chanel is ignored')
        )
      ),
      Effect.flatMap(recordCreatedMsg(env)(client))
    );

    Effect.runPromise(program.pipe(provideChannelStoreRef));
  };
};
