import type {
    CacheType,
    ChatInputCommandInteraction,
    CommandInteraction,
} from "discord.js";
import { Effect, pipe, Ref } from "effect";

import * as StickyStore from "~/services/sticky_store";
import { getCommandOptionString } from "~/utils/command";

export const showSticky = (
    interaction: ChatInputCommandInteraction<CacheType>,
) => {
    const name = interaction.options.getString("name") || "";

    return pipe(
        StickyStore.getSticky(name),
        Effect.flatMap(Effect.fromOption),
        Effect.match({
            onSuccess: ({ imageUrl }) => imageUrl,
            onFailure: () => `找不到 ${name}`,
        }),
        Effect.flatMap((msg) =>
            Effect.tryPromise(() =>
                interaction.reply({ content: msg, withResponse: true }),
            ),
        ),
    );
};

export const createSticky = (interaction: ChatInputCommandInteraction) => {
    const name = getCommandOptionString("name")(interaction);
    const url = getCommandOptionString("url")(interaction);
    const group = getCommandOptionString("group")(interaction) || "default";

    return pipe(
        StickyStore.createNewSticky(name, url, group),
        Effect.map(() => `新增 ${name} 到 ${group} 成功`),
        Effect.catchTags({
            StickyOptionLimitError: () => Effect.succeed("group 以達上限"),
            GroupLimitError: () => Effect.succeed(`${group} 選項已達上限`),
        }),
        Effect.catch(() => Effect.succeed(`新增 ${name} 到 ${group} 失敗`)),
        Effect.flatMap((msg) =>
            Effect.tryPromise(() =>
                interaction.reply({ content: msg, withResponse: true }),
            ),
        ),
    );
};

export const deleteSticky = (interaction: ChatInputCommandInteraction) => {
    const name = getCommandOptionString("name")(interaction);

    return pipe(
        StickyStore.deleteSticky(name),
        Effect.match({
            onSuccess: () => `刪除 ${name} 成功`,
            onFailure: () => `刪除 ${name} 失敗`,
        }),
        Effect.flatMap((msg) =>
            Effect.tryPromise(() =>
                interaction.reply({ content: msg, withResponse: true }),
            ),
        ),
    );
};

export const backupSticky = (interaction: CommandInteraction) => {
    return pipe(
        Effect.service(StickyStore.StickyService),
        Effect.flatMap(Ref.get),
        Effect.flatMap((stickies) => {
            return Effect.tryPromise(() =>
                interaction.reply({
                    content: "資料",
                    files: [
                        {
                            name: "stickies.json",
                            attachment: Buffer.from(
                                JSON.stringify(stickies, null, 2),
                            ),
                        },
                    ],
                    withResponse: true,
                }),
            );
        }),
    );
};
