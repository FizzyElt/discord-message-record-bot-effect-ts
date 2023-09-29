import { Effect, Console, pipe } from 'effect';
import { provideEnvService, getEnvService } from '@services/env';
import { clientContext, loginClient, provideClientService } from '@services/client';
import {
  initialChannelStore,
  ChannelStoreService,
  getChannelStore,
  getChannelStoreRef,
} from '@services/channel_store';
import {
  ready,
  messageCreateListener,
  messageDeleteListener,
  messageUpdateListener,
} from '@listeners';

const program = pipe(
  Effect.Do,
  Effect.bind('client', () => clientContext),
  Effect.bind('env', () => getEnvService),
  Effect.bind('channelStoreRef', () => getChannelStoreRef),
  Effect.map(({ client, env, channelStoreRef }) =>
    client
      .on('ready', ready)
      .on('messageCreate', messageCreateListener(client, channelStoreRef, env))
      .on('messageDelete', messageDeleteListener(client, channelStoreRef, env))
      .on('messageUpdate', messageUpdateListener(client, channelStoreRef, env))
  ),
  Effect.flatMap(loginClient)
);

Effect.runPromise(
  Effect.provideServiceEffect(program, ChannelStoreService, initialChannelStore).pipe(
    provideEnvService,
    provideClientService
  )
);
