import { EnvConfig, getEnvService } from "@services/env";
import {
  Context,
  Effect,
  Equal,
  MutableHashMap,
  Array as ReadonlyArray,
  Ref,
  identity,
  pipe,
  Layer,
} from "effect";

export type ChannelStore = MutableHashMap.MutableHashMap<string, string>;

export interface ChannelStoreRef extends Ref.Ref<ChannelStore> {}

export class ChannelStoreService extends Context.Tag("ChannelStoreService")<
  ChannelStoreService,
  ChannelStoreRef
>() {}

export const getChannelStoreRef = ChannelStoreService.pipe(
  Effect.map(identity),
);

export const getChannelStore = ChannelStoreService.pipe(
  Effect.flatMap(Ref.get),
);

export const hasChannel = (channelId: string) =>
  pipe(getChannelStore, Effect.map(MutableHashMap.has(channelId)));

export const addChannel = (channelInfo: { id: string; name: string }) =>
  ChannelStoreService.pipe(
    Effect.flatMap(
      Ref.update(MutableHashMap.set(channelInfo.id, channelInfo.name)),
    ),
  );

export const addChannels = (list: Array<{ id: string; name: string }>) =>
  ChannelStoreService.pipe(
    Effect.flatMap(
      Ref.update((store) => {
        for (const { id, name } of list) {
          MutableHashMap.set(store, id, name);
        }

        return store;
      }),
    ),
  );

export const removeChannel = (id: string) =>
  ChannelStoreService.pipe(
    Effect.flatMap(Ref.update(MutableHashMap.remove(id))),
  );

export const removeChannels = (ids: Array<string>) =>
  pipe(
    getEnvService,
    Effect.map((env) =>
      ReadonlyArray.filter(
        ids,
        (id) => !Equal.equals(id, env.bot_sending_channel_id),
      ),
    ),
    Effect.flatMap((ids) =>
      ChannelStoreService.pipe(
        Effect.flatMap(
          Ref.update((store) => {
            for (const id of ids) {
              MutableHashMap.remove(store, id);
            }
            return store;
          }),
        ),
      ),
    ),
  );

export const initialChannelStore = pipe(
  getEnvService,
  Effect.flatMap((env) =>
    Ref.make(
      MutableHashMap.make([
        env.bot_sending_channel_id,
        env.bot_sending_channel_name,
      ]),
    ),
  ),
);

// layer
export class ChannelService extends Context.Tag("ChannelService")<
  ChannelService,
  {
    getChannelStoreRef: () => ChannelStoreRef;
    getChannelStore: () => Effect.Effect<ChannelStore>;
    hasChannel: (channelId: string) => Effect.Effect<boolean>;
    addChannel: (channelInfo: {
      id: string;
      name: string;
    }) => Effect.Effect<void>;
    addChannels: (
      list: Array<{ id: string; name: string }>,
    ) => Effect.Effect<void>;
    removeChannel: (id: string) => Effect.Effect<void>;
    removeChannels: (ids: Array<string>) => Effect.Effect<void>;
  }
>() {}

export const ChannelServiceLive = Layer.effect(
  ChannelService,
  Effect.gen(function* () {
    const env = yield* EnvConfig;

    const channelStoreRef = yield* Ref.make(
      MutableHashMap.make([
        env.BOT_SENDING_CHANNEL_ID,
        env.BOT_SENDING_CHANNEL_NAME,
      ]),
    );

    const getChannelStoreRef = () => channelStoreRef;

    const getChannelStore = () => Ref.get(channelStoreRef);

    const hasChannel = (id: string) =>
      pipe(getChannelStore(), Effect.map(MutableHashMap.has(id)));

    const addChannel = (channelInfo: { id: string; name: string }) =>
      Ref.update(
        channelStoreRef,
        MutableHashMap.set(channelInfo.id, channelInfo.name),
      );

    const addChannels = (list: Array<{ id: string; name: string }>) =>
      Ref.update(channelStoreRef, (store) => {
        for (const { id, name } of list) {
          MutableHashMap.set(store, id, name);
        }

        return store;
      });

    const removeChannel = (id: string) =>
      Ref.update(channelStoreRef, MutableHashMap.remove(id));

    const removeChannels = (ids: Array<string>) =>
      Ref.update(channelStoreRef, (store) => {
        for (const id of ids) {
          MutableHashMap.remove(store, id);
        }
        return store;
      });

    return {
      getChannelStoreRef,
      getChannelStore,
      hasChannel,
      addChannel,
      addChannels,
      removeChannel,
      removeChannels,
    };
  }),
);
