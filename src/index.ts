import { Effect, pipe } from 'effect';
import { provideEnvService, getEnvService } from '@services/env';
import { clientContext, loginClient, provideClientService } from '@services/client';
import {
  initialChannelStore,
  ChannelStoreService,
  getChannelStoreRef,
} from '@services/channel_store';
import { createVotingStore } from '@services/voting_store';
import {
  ready,
  messageCreateListener,
  messageDeleteListener,
  messageUpdateListener,
  interactionCreate,
} from '@listeners';

const program = pipe(
  Effect.Do,
  Effect.bind('client', () => clientContext),
  Effect.bind('env', () => getEnvService),
  Effect.bind('channelStoreRef', () => getChannelStoreRef),
  Effect.bind('votingStoreRef', () => createVotingStore()),
  Effect.map(({ client, env, channelStoreRef, votingStoreRef }) =>
    client
      .on('ready', ready)
      .on('messageCreate', messageCreateListener(client, env, channelStoreRef))
      .on('messageDelete', messageDeleteListener(client, env, channelStoreRef))
      .on('messageUpdate', messageUpdateListener(client, env, channelStoreRef))
      .on('interactionCreate', interactionCreate(client, env, votingStoreRef, channelStoreRef))
  ),
  Effect.flatMap(loginClient)
);

Effect.runPromise(
  Effect.provideServiceEffect(program, ChannelStoreService, initialChannelStore).pipe(
    provideEnvService,
    provideClientService
  )
);
