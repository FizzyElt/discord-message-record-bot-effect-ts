import { Context, Ref, MutableHashMap, Effect, pipe, identity, ReadonlyArray, Equal } from 'effect';
import { getEnvService } from '@services/env';

export type ChannelStore = MutableHashMap.MutableHashMap<string, string>;

export interface ChannelStoreRef extends Ref.Ref<ChannelStore> {}

export const ChannelStoreService = Context.Tag<ChannelStoreRef>();

export const getChannelStoreRef = ChannelStoreService.pipe(Effect.map(identity));

export const getChannelStore = ChannelStoreService.pipe(Effect.flatMap(Ref.get));

export const hasChannel = (channelId: string) =>
  pipe(getChannelStore, Effect.map(MutableHashMap.has(channelId)));

export const addChannel = (channelInfo: { id: string; name: string }) =>
  ChannelStoreService.pipe(
    Effect.flatMap(Ref.update(MutableHashMap.set(channelInfo.id, channelInfo.name)))
  );

export const addChannels = (list: Array<{ id: string; name: string }>) =>
  ChannelStoreService.pipe(
    Effect.flatMap(
      Ref.update((store) => {
        list.forEach(({ id, name }) => MutableHashMap.set(store, id, name));
        return store;
      })
    )
  );

export const removeChannel = (id: string) =>
  ChannelStoreService.pipe(Effect.flatMap(Ref.update(MutableHashMap.remove(id))));

export const removeChannels = (ids: Array<string>) =>
  pipe(
    getEnvService,
    Effect.map((env) =>
      ReadonlyArray.filter(ids, (id) => !Equal.equals(id, env.bot_sending_channel_id))
    ),
    Effect.flatMap((ids) => {
      return ChannelStoreService.pipe(
        Effect.flatMap(
          Ref.update((store) => {
            ids.forEach((id) => MutableHashMap.remove(store, id));
            return store;
          })
        )
      );
    })
  );

export const initialChannelStore = pipe(
  getEnvService,
  Effect.flatMap((env) =>
    Ref.make(MutableHashMap.make([env.bot_sending_channel_id, env.bot_sending_channel_name]))
  )
);
