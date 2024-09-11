import { EnvConfig } from "@services/env";
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

    const removeChannel = (id: string) => {
      if (Equal.equals(id, env.BOT_SENDING_CHANNEL_ID)) return Effect.void;
      return Ref.update(channelStoreRef, MutableHashMap.remove(id));
    };

    const removeChannels = (ids: Array<string>) =>
      Ref.update(channelStoreRef, (store) => {
        const removeIds = ReadonlyArray.filter(
          ids,
          (id) => !Equal.equals(id, env.BOT_SENDING_CHANNEL_ID),
        );

        for (const id of removeIds) {
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

export const removeChannels = (ids: Array<string>) =>
  pipe(
    ChannelService,
    Effect.flatMap((service) => service.removeChannels(ids)),
  );

export const removeChannel = (id: string) =>
  pipe(
    ChannelService,
    Effect.flatMap((service) => service.removeChannel(id)),
  );

export const addChannel = (channelInfo: { id: string; name: string }) =>
  pipe(
    ChannelService,
    Effect.flatMap((service) => service.addChannel(channelInfo)),
  );

export const addChannels = (list: Array<{ id: string; name: string }>) =>
  pipe(
    ChannelService,
    Effect.flatMap((service) => service.addChannels(list)),
  );

export const getChannelStore = () =>
  pipe(
    ChannelService,
    Effect.flatMap((service) => service.getChannelStore()),
  );

export const hasChannel = (channelId: string) =>
  pipe(
    ChannelService,
    Effect.flatMap((service) => service.hasChannel(channelId)),
  );
