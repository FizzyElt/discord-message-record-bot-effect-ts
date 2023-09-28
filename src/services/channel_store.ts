import { Context, Ref, MutableHashMap, Effect, pipe, identity } from 'effect';
import { getEnvService } from '@services/env';

export type ChannelStore = MutableHashMap.MutableHashMap<string, string>;

export interface ChannelStoreRef extends Ref.Ref<ChannelStore> {}

export const ChannelStoreService = Context.Tag<ChannelStoreRef>();

export const getChannelStoreRef = ChannelStoreService.pipe(Effect.map(identity));

export const getChannelStore = ChannelStoreService.pipe(Effect.flatMap((ref) => Ref.get(ref)));

export const hasChannel = (channelId: string) =>
  pipe(getChannelStore, Effect.map(MutableHashMap.has(channelId)));

export const initialChannelStore = pipe(
  getEnvService,
  Effect.flatMap((env) =>
    Ref.make(MutableHashMap.make([env.bot_sending_channel_id, env.bot_sending_channel_name]))
  )
);
