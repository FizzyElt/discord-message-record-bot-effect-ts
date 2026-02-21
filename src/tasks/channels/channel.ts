import type {
    Channel,
    ChatInputCommandInteraction,
    CommandInteraction,
} from "discord.js";
import {
    Effect,
    Equal,
    flow,
    Option,
    pipe,
    Array as ReadonlyArray,
} from "effect";

import { ClientContext } from "~/services";
import {
    addChannel,
    addChannels,
    getChannelStore,
    removeChannel,
    removeChannels,
} from "~/services/channel_store";
import {
    getCategoryTextChannels,
    getTextChannelInfo,
    getTextChannelsInfo,
    isCategoryChannel,
    isTextChannel,
} from "~/utils/channel";
import { getCommandOptionString } from "~/utils/command";

const excludeChannels = (channel: Channel) =>
    Effect.gen(function* () {
        if (isCategoryChannel(channel)) {
            return yield* pipe(
                getTextChannelsInfo(channel),
                addChannels,
                Effect.map(() => `已排除 **${channel.name}** 下的所有文字頻道`),
            );
        }

        if (isTextChannel(channel)) {
            return yield* pipe(
                getTextChannelInfo(channel),
                addChannel,
                Effect.map(() => `已排除 **${channel.name}**`),
            );
        }

        return "不支援的頻道類型";
    });

export const addChannelFlow = (interaction: ChatInputCommandInteraction) =>
    Effect.gen(function* () {
        const client = yield* ClientContext;

        const idOrName = pipe(interaction, getCommandOptionString("id"));

        const channel = yield* Effect.tryPromise(() =>
            client.channels.fetch(idOrName),
        );

        return yield* pipe(
            Option.fromNullOr(channel),
            Option.match({
                onNone: () => Effect.succeed("找不到頻道"),
                onSome: excludeChannels,
            }),
            Effect.flatMap((msg) =>
                Effect.tryPromise(() => interaction.reply(msg)),
            ),
        );
    });

const includeChannels = (channel: Channel) =>
    Effect.gen(function* () {
        if (isCategoryChannel(channel)) {
            return yield* pipe(
                getCategoryTextChannels(channel),
                ReadonlyArray.map((channel) => channel.id),
                removeChannels,
                Effect.map(() => `已監聽 **${channel.name}** 下的所有文字頻道`),
            );
        }

        if (isTextChannel(channel)) {
            return yield* pipe(
                removeChannel(channel.id),
                Effect.map(() => `已監聽 **${channel.name}**`),
            );
        }

        return "不支援的頻道類型";
    });

export const removeChannelFlow = (interaction: ChatInputCommandInteraction) =>
    Effect.gen(function* () {
        const client = yield* ClientContext;

        return yield* pipe(
            interaction,
            getCommandOptionString("id"),
            (idOrName) =>
                Option.fromNullishOr(
                    client.channels.cache.find((channel) =>
                        Equal.equals(channel.id, idOrName),
                    ),
                ),
            Option.match({
                onSome: includeChannels,
                onNone: () => Effect.succeed("找不到頻道"),
            }),
            Effect.flatMap((msg) =>
                Effect.tryPromise(() => interaction.reply(msg)),
            ),
        );
    });

export const listChannels = (interaction: CommandInteraction) =>
    pipe(
        getChannelStore(),
        Effect.map(
            flow(
                ReadonlyArray.fromIterable,
                ReadonlyArray.map(([id, name]) => `(${id}) ${name}`),
                ReadonlyArray.join("\n"),
            ),
        ),
        Effect.flatMap((msg) =>
            Effect.tryPromise(() => interaction.reply(msg)),
        ),
    );
