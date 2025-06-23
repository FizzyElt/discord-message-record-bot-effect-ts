import {
  Context,
  Effect,
  Equal,
  Layer,
  MutableHashMap,
  pipe,
  Array as ReadonlyArray,
  type Ref,
} from "effect";
import { EnvConfig } from "~/services/env";

export type ChannelStore = MutableHashMap.MutableHashMap<string, string>;

export interface ChannelStoreRef extends Ref.Ref<ChannelStore> {}

export class ChannelService extends Context.Tag("ChannelService")<
  ChannelService,
  {
    getChannelStore: () => ChannelStore;
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

    const channelStore = MutableHashMap.make([
      env.BOT_SENDING_CHANNEL_ID,
      env.BOT_SENDING_CHANNEL_NAME,
    ]);

    const getChannelStore = () => channelStore;

    const hasChannel = (id: string) =>
      Effect.succeed(MutableHashMap.has(channelStore, id));

    const addChannel = (channelInfo: { id: string; name: string }) =>
      Effect.succeed(
        MutableHashMap.set(channelStore, channelInfo.id, channelInfo.name),
      );

    const addChannels = (list: Array<{ id: string; name: string }>) => {
      for (const { id, name } of list) {
        MutableHashMap.set(channelStore, id, name);
      }

      return Effect.void;
    };

    const removeChannel = (id: string) => {
      if (Equal.equals(id, env.BOT_SENDING_CHANNEL_ID)) return Effect.void;
      return Effect.succeed(MutableHashMap.remove(channelStore, id));
    };

    const removeChannels = (ids: Array<string>) => {
      const removeIds = ReadonlyArray.filter(
        ids,
        (id) => !Equal.equals(id, env.BOT_SENDING_CHANNEL_ID),
      );

      for (const id of removeIds) {
        MutableHashMap.remove(channelStore, id);
      }

      return Effect.void;
    };

    return {
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
    Effect.map((service) => service.getChannelStore()),
  );

export const hasChannel = (channelId: string) =>
  pipe(
    ChannelService,
    Effect.flatMap((service) => service.hasChannel(channelId)),
  );
